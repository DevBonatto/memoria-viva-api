const db = require('../database/connection');
const fs = require('fs'); // Necessário para apagar o arquivo físico
const path = require('path');

module.exports = {
    async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
            }

            const { game_type } = req.body;
            
            if (!game_type || (game_type !== 'memory' && game_type !== 'puzzle')) {
                return res.status(400).json({ error: 'Você deve especificar se a imagem é para "memory" ou "puzzle".' });
            }

            const user_id = req.userId; 
            const url = req.file.path; 

            await db('images').insert({
                user_id,
                url,
                game_type
            });

            return res.status(201).json({ 
                message: 'Imagem salva com sucesso!', 
                url: url 
            });

        } catch (error) {
            console.error('Erro ao fazer upload da imagem:', error);
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    async index(req, res) {
        try {
            const user_id = req.userId;
            const { game_type } = req.query; 

            if (!game_type) {
                return res.status(400).json({ error: 'Informe o tipo de jogo para buscar as imagens.' });
            }

            const images = await db('images')
                .where({ user_id, game_type })
                .select('id', 'url');

            return res.json(images);

        } catch (error) {
            console.error('Erro ao buscar imagens:', error);
            return res.status(500).json({ error: 'Erro ao carregar imagens.' });
        }
    },

    // ==========================================
    // NOVA FUNÇÃO: DELETAR IMAGEM
    // ==========================================
    async delete(req, res) {
        try {
            const { id } = req.params; // Pega o ID da imagem na URL
            const user_id = req.userId; // Pega o ID do usuário logado (segurança!)

            // 1. Busca a imagem no banco para verificar se ela existe e se pertence ao usuário
            const image = await db('images')
                .where({ id, user_id })
                .first();

            if (!image) {
                return res.status(404).json({ error: 'Imagem não encontrada ou você não tem permissão.' });
            }

            // 2. Tenta deletar o arquivo físico do servidor (se estiver usando storage local)
            // Se você usa Cloudinary ou S3, a lógica de deletar o arquivo muda um pouco.
            if (image.url && !image.url.startsWith('http')) {
                const filePath = path.resolve(image.url);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            // 3. Deleta o registro no banco de dados
            await db('images')
                .where({ id, user_id })
                .del();

            return res.status(204).send(); // Sucesso sem conteúdo (padrão para DELETE)

        } catch (error) {
            console.error('Erro ao deletar imagem:', error);
            return res.status(500).json({ error: 'Erro ao deletar imagem no servidor.' });
        }
    }
};