const express = require('express');
const multer = require('multer');

const UserController = require('./controllers/UserController');
const AuthController = require('./controllers/AuthController');
const ImageController = require('./controllers/ImageController');
const RankingController = require('./controllers/RankingController');
const ProgressController = require('./controllers/ProgressController');

const upload = require('./config/multer');
const authMiddleware = require('./middlewares/auth');

const routes = express.Router();

routes.get('/', (req, res) => {
    res.json({ message: 'Bem-vindo à API do Memória Viva!', version: '1.0.0' });
});

routes.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

routes.post('/users', UserController.create);
routes.post('/login', AuthController.login);
routes.get('/rankings', RankingController.index);

routes.get('/me', authMiddleware, AuthController.me);

const MAX_UPLOAD_FILES = 10;

function handleUpload(req, res, next) {
    // Accepts both `images` (new, multiple) and `image` (legacy, single) fields.
    const anyFields = upload.fields([
        { name: 'images', maxCount: MAX_UPLOAD_FILES },
        { name: 'image', maxCount: 1 },
    ]);

    anyFields(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ error: 'Uma das imagens excede o limite de 5MB.' });
            }
            return res.status(400).json({ error: err.message });
        }
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        const files = [
            ...(req.files?.images || []),
            ...(req.files?.image || []),
        ];

        if (!files.length) {
            return res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
        }

        req.files = files;
        next();
    });
}

routes.post('/images', authMiddleware, handleUpload, ImageController.upload);
routes.get('/images', authMiddleware, ImageController.index);
routes.put('/images/:id', authMiddleware, ImageController.update);
routes.delete('/images/:id', authMiddleware, ImageController.delete);

routes.post('/rankings', authMiddleware, RankingController.store);
routes.get('/progress', authMiddleware, ProgressController.show);

module.exports = routes;
