const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateMeSchema, adminUpdateUserSchema } = require('../validations/userValidation');

router.use(protect);

router.get('/me', ctrl.getMe);
router.patch('/me', validate(updateMeSchema), ctrl.updateMe);
router.delete('/me', ctrl.remove);

router.get('/', restrictTo('admin'), ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.put('/:id', restrictTo('admin'), validate(adminUpdateUserSchema), ctrl.update);
router.delete('/:id', restrictTo('admin'), ctrl.remove);

module.exports = router;
