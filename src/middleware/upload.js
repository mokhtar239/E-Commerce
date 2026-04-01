const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const AppError = require('../utils/AppError');

// Store in RAM
const multerStorage = multer.memoryStorage();

// Filter images only
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image'))
        cb(null, true);
    else
        cb(new AppError('Not an image, please upload only images', 400), false);
};

// Multer upload
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Upload up to 5 product images
const uploadMiddleware = upload.array('images', 5);

// Resize & save images using Sharp
const resizeImagesMiddleware = async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    req.body.images = [];

    const promises = req.files.map(async (file, i) => {
        const filename = `product-${req.user.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .toFormat('jpeg')
            .jpeg({ quality: 85 })
            .toFile(path.join('public/uploads/products', filename));

        req.body.images.push(filename);
    });

    await Promise.all(promises);
    next();
};

module.exports = { uploadMiddleware, resizeImagesMiddleware };
