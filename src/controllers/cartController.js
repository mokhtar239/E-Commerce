const catchAsync = require('../utils/catchAsync');

exports.getCart = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Get cart' });
});

exports.addItem = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Add item to cart' });
});

exports.updateItem = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Update cart item' });
});

exports.removeItem = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Remove item from cart' });
});

exports.clearCart = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Clear cart' });
});
