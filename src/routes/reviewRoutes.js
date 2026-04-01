const router = require('express').Router();
const ctrl = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReviewSchema } = require('../validations/reviewValidation');

// anyone can read reviews
router.get('/:productId', ctrl.getProductReviews);

// Protected — must be logged in 
router.use(protect);

// Buyer only
router.post('/', restrictTo('buyer'), validate(createReviewSchema), ctrl.create);
router.put('/:id', restrictTo('buyer'), ctrl.update);

// Buyer + Admin
router.delete('/:id', restrictTo('buyer', 'admin'), ctrl.remove);

module.exports = router;
