const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { placeOrderSchema } = require('../validations/orderValidation');

// All order routes require login
router.use(protect);

// Buyer routes
router.post('/', restrictTo('buyer'), validate(placeOrderSchema), ctrl.placeOrder);
router.get('/', restrictTo('buyer'), ctrl.getMyOrders);

// Buyer + Admin routes
router.get('/:id', restrictTo('buyer', 'admin'), ctrl.getOne);
router.put('/:id/cancel', restrictTo('buyer', 'admin'), ctrl.cancel);

// Admin only
router.put('/:id/status', restrictTo('admin'), ctrl.updateStatus);

module.exports = router;
