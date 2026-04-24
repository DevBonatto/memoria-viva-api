const db = require('../database/connection');
const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../config/multer');

const VALID_GAMES = ['memory', 'puzzle'];

function extractPublicIdFromUrl(url) {
    if (!url || !url.includes('/upload/')) return null;
    try {
        const afterUpload = url.split('/upload/')[1];
        const withoutVersion = afterUpload.replace(/^v\d+\//, '');
        const withoutExt = withoutVersion.replace(/\.[^.]+$/, '');
        return withoutExt;
    } catch {
        return null;
    }
}

module.exports = {
    async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
            }

            const { game_type } = req.body;

            if (!VALID_GAMES.includes(game_type)) {
                return res.status(400).json({
                    error: 'Tipo de jogo inválido. Use "memory" ou "puzzle".',
                });
            }

            const user_id = req.userId;
            const url = req.file.path || req.file.secure_url;
            const public_id = req.file.filename || req.file.public_id || null;

            const [id] = await db('images').insert({
                user_id,
                url,
                public_id,
                game_type,
            });

            return res.status(201).json({
                message: 'Imagem salva com sucesso!',
                image: { id, url, game_type },
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

            if (!VALID_GAMES.includes(game_type)) {
                return res.status(400).json({
                    error: 'Informe um tipo de jogo válido ("memory" ou "puzzle").',
                });
            }

            const images = await db('images')
                .where({ user_id, game_type })
                .orderBy('created_at', 'desc')
                .select('id', 'url');

            return res.json(images);
        } catch (error) {
            console.error('Erro ao buscar imagens:', error);
            return res.status(500).json({ error: 'Erro ao carregar imagens.' });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const user_id = req.userId;

            const image = await db('images').where({ id, user_id }).first();

            if (!image) {
                return res.status(404).json({
                    error: 'Imagem não encontrada ou você não tem permissão.',
                });
            }

            if (image.url && image.url.startsWith('http')) {
                const publicId = image.public_id || extractPublicIdFromUrl(image.url);
                if (publicId && cloudinary?.uploader?.destroy) {
                    try {
                        await cloudinary.uploader.destroy(publicId);
                    } catch (cloudErr) {
                        console.warn('Falha ao remover do Cloudinary:', cloudErr?.message);
                    }
                }
            } else if (image.url) {
                const filePath = path.resolve(image.url);
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (fsErr) {
                        console.warn('Falha ao remover arquivo local:', fsErr?.message);
                    }
                }
            }

            await db('images').where({ id, user_id }).del();

            return res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar imagem:', error);
            return res.status(500).json({ error: 'Erro ao deletar imagem no servidor.' });
        }
    },
};
