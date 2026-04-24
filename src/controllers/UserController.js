const db = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = {
    async create(req, res) {
        try {
            const name = String(req.body.name || '').trim();
            const email = String(req.body.email || '').trim().toLowerCase();
            const password = String(req.body.password || '');

            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
            }
            if (name.length < 2) {
                return res.status(400).json({ error: 'Nome muito curto.' });
            }
            if (!EMAIL_REGEX.test(email)) {
                return res.status(400).json({ error: 'E-mail inválido.' });
            }
            if (password.length < 6) {
                return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
            }

            const existingUser = await db('users').where({ email }).first();
            if (existingUser) {
                return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
            }

            const password_hash = await bcrypt.hash(password, 10);

            const [id] = await db('users').insert({ name, email, password_hash });

            const token = jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

            return res.status(201).json({
                message: 'Usuário cadastrado com sucesso!',
                user: { id, name, email },
                token,
            });
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },
};
