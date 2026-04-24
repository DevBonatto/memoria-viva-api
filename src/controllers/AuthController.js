const db = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET não configurado no ambiente.');
    }
    return jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '7d' });
}

module.exports = {
    async login(req, res) {
        try {
            const email = String(req.body.email || '').trim().toLowerCase();
            const password = String(req.body.password || '');

            if (!email || !password) {
                return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
            }
            if (!EMAIL_REGEX.test(email)) {
                return res.status(400).json({ error: 'E-mail inválido.' });
            }

            const user = await db('users').where({ email }).first();

            if (!user) {
                return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
            }

            const token = generateToken(user);

            return res.status(200).json({
                message: 'Login realizado com sucesso!',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
                token,
            });
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    async me(req, res) {
        try {
            const user = await db('users')
                .where({ id: req.userId })
                .select('id', 'name', 'email')
                .first();

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            return res.json({ user });
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },
};
