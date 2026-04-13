const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/sql/User');

exports.getAll = catchAsync(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const { rows, count } = await User.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        total: count,
        page,
        pages: Math.ceil(count / limit),
        count: rows.length,
        data: rows
    });
});

exports.getMe = catchAsync(async (req, res) => {
    res.status(200).json({ success: true, data: req.user });
});

exports.getOne = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return next(new AppError('Invalid user id', 400));

    if (req.user.role !== 'admin' && req.user.id !== id) {
        return next(new AppError('You do not have permission to access this user', 403));
    }

    const user = await User.findByPk(id);
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({ success: true, data: user });
});

exports.updateMe = catchAsync(async (req, res) => {
    const { name, phone, avatar } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;

    await req.user.update(updates);

    res.status(200).json({ success: true, data: req.user });
});

exports.update = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return next(new AppError('Invalid user id', 400));

    const user = await User.findByPk(id);
    if (!user) return next(new AppError('User not found', 404));

    const { name, phone, avatar, role, isVerified } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;
    if (role !== undefined) updates.role = role;
    if (isVerified !== undefined) updates.isVerified = isVerified;

    await user.update(updates);

    res.status(200).json({ success: true, data: user });
});

exports.remove = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return next(new AppError('Invalid user id', 400));

    if (req.user.role !== 'admin' && req.user.id !== id) {
        return next(new AppError('You do not have permission to delete this user', 403));
    }

    if (req.user.role === 'admin' && req.user.id === id) {
        return next(new AppError('Admins cannot delete their own account', 400));
    }

    const user = await User.findByPk(id);
    if (!user) return next(new AppError('User not found', 404));

    await user.destroy();

    res.status(204).send();
});
