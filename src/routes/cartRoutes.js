const router = require('express').Router();
const ctrl = require('../controllers/cartController');
const {protect , restrictTo} = require('../middleware/auth');

// should be logged in
router.use(protect);

// only buyer has cart
router.use(restrictTo('buyer'));


router.get('/', ctrl.getCart);
router.post('/add', ctrl.addItem);
router.put('/update/:productId', ctrl.updateItem);
router.delete('/remove/:productId', ctrl.removeItem);
router.delete('/clear', ctrl.clearCart);

module.exports = router;
