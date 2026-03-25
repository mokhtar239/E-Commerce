const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, updatePasswordSchema } = require('../validations/authValidation');

// Public routes
router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login', validate(loginSchema), ctrl.login);

// Protected routes
router.get('/me', protect, ctrl.getMe);
router.patch('/update-password', protect, validate(updatePasswordSchema), ctrl.updatePassword);

module.exports = router;
