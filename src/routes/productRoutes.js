const router = require('express').Router();
const ctrl = require('../controllers/productController');
const {protect , restrictTo} = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createProductSchema, updateProductSchema  } = require('../validations/productValidations');
const { uploadMiddleware, resizeImagesMiddleware } = require('../middleware/upload');

// Public routes
router.get('/', ctrl.getAll);
router.get('/category/:catId', ctrl.getByCategory);
router.get('/:id', ctrl.getOne);

// Protected - must be logged in
router.use(protect);

// Seller/Admin only
router.use(restrictTo('seller', 'admin'));

router.get('/seller/mine', ctrl.getMyProducts);

router.post('/',
    uploadMiddleware,
    resizeImagesMiddleware,
    validate(createProductSchema),
    ctrl.create
);

router.put('/:id', uploadMiddleware, resizeImagesMiddleware, validate(updateProductSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
