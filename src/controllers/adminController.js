const catchAsync = require('../utils/catchAsync');

exports.getDashboard = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Dashboard stats' });
});

exports.getAllUsers = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Get all users' });
});

exports.updateUserRole = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Update user role' });
});

exports.deleteUser = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Delete user' });
});

exports.getAllOrders = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Get all orders' });
});
