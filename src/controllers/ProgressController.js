const db = require('../database/connection');

const DAY_MS = 24 * 60 * 60 * 1000;

function round1(value) {
    if (!Number.isFinite(value)) return null;
    return Math.round(value * 10) / 10;
}

function averageBy(rows, key) {
    if (!rows.length) return null;
    const sum = rows.reduce((acc, row) => acc + Number(row[key] || 0), 0);
    return sum / rows.length;
}

function improvementPercent(firstValue, lastValue) {
    if (!Number.isFinite(firstValue) || !Number.isFinite(lastValue)) return null;
    if (firstValue === 0) {
        return lastValue === 0 ? 0 : null;
    }
    return ((firstValue - lastValue) / firstValue) * 100;
}

function toIsoDay(date) {
    return new Date(date).toISOString().slice(0, 10);
}

async function computeStatsForGame(userId, gameType) {
    const rows = await db('rankings')
        .where({ user_id: userId, game_type: gameType })
        .select('id', 'score', 'time_seconds', 'errors', 'created_at')
        .orderBy('created_at', 'asc');

    const total = rows.length;

    if (total === 0) {
        return {
            total_games: 0,
            best_score: null,
            best_time: null,
            min_errors: null,
            avg_time: null,
            avg_errors: null,
            improvement_time_pct: null,
            improvement_errors_pct: null,
            games_this_week: 0,
            games_last_week: 0,
            last_played: null,
            recent_games: [],
        };
    }

    const bestScore = rows.reduce((best, r) => Math.max(best, r.score), 0);
    const bestTime = rows.reduce((best, r) => Math.min(best, r.time_seconds), Infinity);
    const minErrors = rows.reduce((best, r) => Math.min(best, r.errors), Infinity);

    const avgTime = averageBy(rows, 'time_seconds');
    const avgErrors = averageBy(rows, 'errors');

    let firstBlock = null;
    let lastBlock = null;

    if (total >= 6) {
        firstBlock = rows.slice(0, 3);
        lastBlock = rows.slice(-3);
    } else if (total >= 2) {
        const mid = Math.max(1, Math.floor(total / 2));
        firstBlock = rows.slice(0, mid);
        lastBlock = rows.slice(-mid);
    }

    let improvementTimePct = null;
    let improvementErrorsPct = null;

    if (firstBlock && lastBlock) {
        improvementTimePct = improvementPercent(
            averageBy(firstBlock, 'time_seconds'),
            averageBy(lastBlock, 'time_seconds')
        );
        improvementErrorsPct = improvementPercent(
            averageBy(firstBlock, 'errors'),
            averageBy(lastBlock, 'errors')
        );
    }

    const now = Date.now();
    const gamesThisWeek = rows.filter((r) => {
        const diff = now - new Date(r.created_at).getTime();
        return diff >= 0 && diff <= 7 * DAY_MS;
    }).length;

    const gamesLastWeek = rows.filter((r) => {
        const diff = now - new Date(r.created_at).getTime();
        return diff > 7 * DAY_MS && diff <= 14 * DAY_MS;
    }).length;

    const recent = rows
        .slice(-20)
        .reverse()
        .map((r) => ({
            id: r.id,
            score: r.score,
            time_seconds: r.time_seconds,
            errors: r.errors,
            created_at: r.created_at,
        }));

    return {
        total_games: total,
        best_score: bestScore,
        best_time: Number.isFinite(bestTime) ? bestTime : null,
        min_errors: Number.isFinite(minErrors) ? minErrors : null,
        avg_time: round1(avgTime),
        avg_errors: round1(avgErrors),
        improvement_time_pct: round1(improvementTimePct),
        improvement_errors_pct: round1(improvementErrorsPct),
        games_this_week: gamesThisWeek,
        games_last_week: gamesLastWeek,
        last_played: rows[rows.length - 1].created_at,
        recent_games: recent,
    };
}

module.exports = {
    async show(req, res) {
        try {
            const userId = req.userId;

            const [memory, puzzle] = await Promise.all([
                computeStatsForGame(userId, 'memory'),
                computeStatsForGame(userId, 'puzzle'),
            ]);

            const since = new Date(Date.now() - 30 * DAY_MS);
            const last30 = await db('rankings')
                .where('user_id', userId)
                .andWhere('created_at', '>=', since)
                .select('created_at');

            const activeDays = new Set(last30.map((r) => toIsoDay(r.created_at)));

            return res.json({
                memory,
                puzzle,
                overall: {
                    total_games: memory.total_games + puzzle.total_games,
                    active_days_last_30: activeDays.size,
                },
            });
        } catch (error) {
            console.error('Erro ao calcular progresso:', error);
            return res.status(500).json({ error: 'Erro ao calcular seu progresso.' });
        }
    },
};
