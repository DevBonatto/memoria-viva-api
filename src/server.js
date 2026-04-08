require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const db = require('./database/connection');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        console.log('Verificando o banco de dados (Migrations)...');
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