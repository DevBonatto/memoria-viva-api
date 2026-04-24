const db = require('../database/connection');

const VALID_GAMES = ['memory', 'puzzle'];

function computeScore(timeSeconds, errors) {
    const base = 10000;
    const raw = base - timeSeconds * 10 - errors * 50;
    return Math.max(0, Math.round(raw));
}

module.exports = {
    async store(req, res) {
        try {
            const { game_type, time_seconds, errors } = req.body;
            const user_id = req.userId;

            if (!VALID_GAMES.includes(game_type)) {
                return res.status(400).json({ error: 'Tipo de jogo inválido. Use "memory" ou "puzzle".' });
            }

            const time = Number(time_seconds);
            const err = Number(errors);

            if (!Number.isFinite(time) || time < 0) {
                return res.status(400).json({ error: 'Tempo inválido.' });
            }
            if (!Number.isFinite(err) || err < 0) {
                return res.status(400).json({ error: 'Número de erros inválido.' });
            }

            const score = computeScore(time, err);

            const [id] = await db('rankings').insert({
                user_id,
                game_type,
                time_seconds: Math.round(time),
                errors: Math.round(err),
                score,
            });

            return res.status(201).json({
                message: 'Pontuação salva com sucesso!',
                id,
                score,
            });
        } catch (error) {
            console.error('Erro ao salvar ranking:', error);
            return res.status(500).json({ error: 'Erro interno ao salvar pontuação.' });
        }
    },

    async index(req, res) {
        try {
            const { game_type } = req.query;

            if (!VALID_GAMES.includes(game_type)) {
                return res.status(400).json({ error: 'Informe um tipo de jogo válido ("memory" ou "puzzle").' });
            }

            const leaderboard = await db('rankings')
                .join('users', 'users.id', '=', 'rankings.user_id')
                .where('rankings.game_type', game_type)
                .select(
                    'rankings.id',
                    'users.name',
                    'rankings.score',
                    'rankings.time_seconds',
                    'rankings.errors',
                    'rankings.created_at'
                )
                .orderBy([
                    { column: 'rankings.score', order: 'desc' },
                    { column: 'rankings.time_seconds', order: 'asc' },
                ])
                .limit(10);

            return res.json(leaderboard);
        } catch (error) {
            console.error('Erro ao buscar ranking:', error);
            return res.status(500).json({ error: 'Erro ao carregar o ranking.' });
        }
    },
};
