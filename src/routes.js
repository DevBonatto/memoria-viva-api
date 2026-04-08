const express = require('express');

const UserController = require('./controllers/UserController');
const AuthController = require('./controllers/AuthController');
const ImageController = require('./controllers/ImageController');
const RankingController = require('./controllers/RankingController');

const upload = require('./config/multer');
const authMiddleware = require('./middlewares/auth');

const routes = express.Router();

routes.get('/', (req, res) => {
    res.send({ message: 'Bem-vindo à API do Memória Viva!' });
});

routes.post('/users', UserController.create);
routes.post('/login', AuthController.login);
routes.get('/rankings', RankingController.index); 

routes.get('/profile', authMiddleware, (req, res) => {
    return res.status(200).json({ 
        message: 'Você está na área VIP!',
        loggedUserId: req.userId 
    });
});

routes.post('/images', authMiddleware, upload.single('image'), ImageController.upload);
routes.get('/images', authMiddleware, ImageController.index);
routes.delete('/images/:id', authMiddleware, ImageController.delete);
routes.post('/rankings', authMiddleware, RankingController.store);

module.exports = routes;