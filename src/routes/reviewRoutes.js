const router = require('express').Router();
const ctrl = require('../controllers/reviewController');

router.post('/', ctrl.create);
router.delete('/:id', ctrl.remove);

module.exports = router;
