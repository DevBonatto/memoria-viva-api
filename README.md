# Memória Viva — API

API REST em Node.js/Express + Knex/MySQL, com autenticação JWT e upload de imagens no Cloudinary.

## Stack
- Express 5
- Knex + MySQL2
- JSON Web Tokens
- Bcrypt para hash de senhas
- Cloudinary via multer-storage-cloudinary

## Pré-requisitos
- Node.js 20+
- MySQL 8 (ou compatível)
- Conta no Cloudinary

## Setup

```bash
npm install
cp .env.example .env
# preencha DB_*, JWT_SECRET e CLOUDINARY_*
npm run dev
```

As migrations rodam automaticamente na inicialização do servidor. Também pode executá-las manualmente:

```bash
npm run migrate
```

## Scripts

- `npm start` — inicia em produção
- `npm run dev` — inicia com `node --watch`
- `npm run migrate` — aplica migrations pendentes
- `npm run migrate:rollback` — desfaz a última migration

## Endpoints

| Método | Rota | Descrição | Autenticado |
| --- | --- | --- | --- |
| GET | `/` | Mensagem raiz | ❌ |
| GET | `/health` | Healthcheck | ❌ |
| POST | `/users` | Cria usuário | ❌ |
| POST | `/login` | Login | ❌ |
| GET | `/me` | Dados do usuário logado | ✅ |
| POST | `/images` | Upload de imagem (`game_type`, `image`) | ✅ |
| GET | `/images?game_type=memory\|puzzle` | Lista imagens do usuário | ✅ |
| DELETE | `/images/:id` | Remove imagem do usuário | ✅ |
| POST | `/rankings` | Registra pontuação | ✅ |
| GET | `/rankings?game_type=memory\|puzzle` | Top 10 do ranking | ❌ |

## Variáveis de ambiente

Veja `.env.example` para todas as variáveis necessárias.
