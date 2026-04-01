const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// All admin routes require login + admin role
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard
router.get('/dashboard', ctrl.getDashboard);

// Users management
router.get('/users', ctrl.getAllUsers);
router.post('/users/:id/role', ctrl.updateUserRole);
router.post('/users/:id/delete', ctrl.deleteUser);

// Orders management
router.get('/orders', ctrl.getAllOrders);
router.post('/orders/:id/status', ctrl.updateOrderStatus);

// Products management
router.get('/products', ctrl.getAllProducts);
router.post('/products/:id/toggle', ctrl.toggleProduct);

module.exports = router;
