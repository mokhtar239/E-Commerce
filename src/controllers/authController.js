const catchAsync = require('../utils/catchAsync');
const User = require('../models/sql/User');
const AppError = require('../utils/AppError');
const generateToken = require('../utils/generateToken');
const { sendWelcomeEmail , sendPasswordResetEmail } = require('../utils/email');
const crypto = require('crypto');
const { Op } = require('sequelize');


exports.register = catchAsync(async (req, res, next) => {
    const { name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
        return next(new AppError('Email already exists', 400));
    }

    const newUser = await User.create({ name, email, password, role, phone });

    const token = generateToken({ id: newUser.id, role: newUser.role });

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        data: { user: newUser }
    });
    sendWelcomeEmail(newUser).catch(err => console.log('Error sending welcome email:', err));
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const existingUser = await User.findOne({ where: { email } });

    if (!existingUser) {
        return next(new AppError('Invalid email or password', 401));
    }

    const isMatched = await existingUser.comparePassword(password);

    if (!isMatched) {
        return next(new AppError('Invalid email or password', 401));
    }

    existingUser.lastLogin = new Date();
    await existingUser.save({ fields: ['lastLogin'] });

    const token = generateToken({ id: existingUser.id, role: existingUser.role });

    res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        token,
        data: { user: existingUser }
    });
});

exports.getMe = catchAsync(async (req, res) => {
    res.status(200).json({
        success: true,
        data: { user: req.user }
    });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new AppError('Please provide current and new password', 400));
    }

    const user = await User.findByPk(req.user.id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return next(new AppError('Current password is incorrect', 401));
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken({ id: user.id, role: user.role });

    res.status(200).json({
        success: true,
        message: 'Password updated successfully',
        token
    });
});

exports.forgetPassword = catchAsync(async(req , res , next) => {
    const {email} = req.body;
    const user = await User.findOne({where : {email}});
    if (!user){
        return next(new AppError('No user found with that email', 404));
    }
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetExpires = Date.now() + 10 * 60 * 1000;
    

    // 1) Save token to DB first
await user.save({fields: ['resetToken', 'resetExpires']});

try {
    // 2) Then send email
    await sendPasswordResetEmail(user, resetToken);
    res.status(200).json({ success: true, message: 'Password reset email sent' });
} catch (error) {
    // 3) Email failed — clean up the token
    user.resetToken = null;
    user.resetExpires = null;
    await user.save({fields: ['resetToken', 'resetExpires']});
    return next(new AppError('Error sending email, try again later', 500));
}

});

// ==========================================
// @desc    Reset password using token
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
// ==========================================
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  // 1) Hash the token from the URL (to match what's stored in DB)
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // 2) Find user where token matches AND token hasn't expired
  

  const user = await User.findOne({
    where: {
      resetToken: hashedToken,
      resetExpires: { [Op.gt]: Date.now() }
    }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // 3) Update password and clear reset fields
  user.password = password;
  user.resetToken = null;
  user.resetExpires = null;
  await user.save();

  // 4) Auto-login — return fresh JWT
  const token = generateToken({ id: user.id, role: user.role });

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
    token
  });
});
