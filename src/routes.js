const express = require('express');
const multer = require('multer');

const UserController = require('./controllers/UserController');
const AuthController = require('./controllers/AuthController');
const ImageController = require('./controllers/ImageController');
const RankingController = require('./controllers/RankingController');

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

routes.post(
    '/images',
    authMiddleware,
    (req, res, next) => {
        upload.single('image')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(413).json({ error: 'Imagem muito grande (máx. 5MB).' });
                }
                return res.status(400).json({ error: err.message });
            }
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            next();
        });
    },
    ImageController.upload
);
routes.get('/images', authMiddleware, ImageController.index);
routes.delete('/images/:id', authMiddleware, ImageController.delete);

routes.post('/rankings', authMiddleware, RankingController.store);

module.exports = routes;
