const catchAsync = require('../utils/catchAsync');

exports.getAll = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Get all users' });
});

exports.getOne = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Get single user' });
});

exports.update = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Update user' });
});

exports.remove = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Delete user' });
});
