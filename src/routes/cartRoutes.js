const router = require('express').Router();
const ctrl = require('../controllers/cartController');

router.get('/', ctrl.getCart);
router.post('/add', ctrl.addItem);
router.put('/update', ctrl.updateItem);
router.delete('/remove/:productId', ctrl.removeItem);
router.delete('/clear', ctrl.clearCart);

module.exports = router;
