const db = require('../database/connection');
const bcrypt = require('bcrypt');

module.exports = {
    async create(req, res) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
            }

            const existingUser = await db('users').where({ email }).first();
            if (existingUser) {
                return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
            }

            const password_hash = await bcrypt.hash(password, 10);

            await db('users').insert({
                name,
                email,
                password_hash
            });

            return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });

        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }
};