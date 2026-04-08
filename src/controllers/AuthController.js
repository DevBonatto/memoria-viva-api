const db = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
            }

            const user = await db('users').where({ email }).first();

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Senha incorreta.' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.status(200).json({
                message: 'Login realizado com sucesso!',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                token
            });

        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }
};