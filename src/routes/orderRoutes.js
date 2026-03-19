const router = require('express').Router();
const ctrl = require('../controllers/orderController');

router.post('/', ctrl.placeOrder);
router.get('/', ctrl.getMyOrders);
router.get('/:id', ctrl.getOne);
router.put('/:id/status', ctrl.updateStatus);
router.put('/:id/cancel', ctrl.cancel);

module.exports = router;
