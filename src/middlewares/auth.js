const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido. Acesso negado.' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Erro no formato do token.' });
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: 'Token mal formatado.' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('JWT_SECRET ausente no ambiente.');
        return res.status(500).json({ error: 'Configuração do servidor inválida.' });
    }

    jwt.verify(token, secret, (error, decoded) => {
        if (error) {
            return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        return next();
    });
};
