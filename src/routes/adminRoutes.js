const router = require('express').Router();
const ctrl = require('../controllers/adminController');

router.get('/dashboard', ctrl.getDashboard);
router.get('/users', ctrl.getAllUsers);
router.put('/users/:id/role', ctrl.updateUserRole);
router.delete('/users/:id', ctrl.deleteUser);
router.get('/orders', ctrl.getAllOrders);

module.exports = router;
