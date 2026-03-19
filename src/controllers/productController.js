const catchAsync = require('../utils/catchAsync');

exports.getAll = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Get all products' });
});

exports.getOne = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Get single product' });
});

exports.create = catchAsync(async (req, res) => {
  res.status(201).json({ success: true, message: 'Create product' });
});

exports.update = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Update product' });
});

exports.remove = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Delete product' });
});

exports.getMyProducts = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Get seller products' });
});

exports.getByCategory = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Get products by category' });
});
