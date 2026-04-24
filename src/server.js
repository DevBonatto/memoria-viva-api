require('dotenv').config();
const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const db = require('./database/connection');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins.length ? allowedOrigins : true,
        credentials: true,
    })
);
app.use(express.json({ limit: '1mb' }));
app.use(routes);

app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada.' });
});

app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        console.log('Verificando o banco de dados (migrations)...');
        await db.migrate.latest();
        console.log('Banco de dados atualizado com sucesso!');

        app.listen(PORT, () => {
            console.log(`Servidor rodando perfeitamente na porta ${PORT}`);
        });
    } catch (error) {
        console.error('Erro ao iniciar:', error);
        process.exit(1);
    }
}

startServer();
