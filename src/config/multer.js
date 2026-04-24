const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'memoria_viva_uploads',
        allowed_formats: ['jpeg', 'jpg', 'png', 'webp'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
});

function fileFilter(req, file, cb) {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
        return cb(new Error('Apenas arquivos de imagem são permitidos.'));
    }
    cb(null, true);
}

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

module.exports.cloudinary = cloudinary;
