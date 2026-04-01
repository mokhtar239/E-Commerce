const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, updatePasswordSchema } = require('../validations/authValidation');
const passport = require('../config/passport');
const generateToken = require('../utils/generateToken');

// Public routes
router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login', validate(loginSchema), ctrl.login);
// Password reset (public — user isn't logged in)
router.post('/forgot-password', ctrl.forgetPassword);
router.put('/reset-password/:token', ctrl.resetPassword);

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/v1/auth/google/failed', session: false }),
  (req, res) => {
    const token = generateToken({ id: req.user.id, role: req.user.role });
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
  }
);

router.get('/google/failed', (req, res) => {
  res.status(401).json({ success: false, message: 'Google authentication failed' });
});


// Protected routes
router.get('/me', protect, ctrl.getMe);
router.patch('/update-password', protect, validate(updatePasswordSchema), ctrl.updatePassword);


module.exports = router;
