const catchAsync = require('../utils/catchAsync');

exports.placeOrder = catchAsync(async (req, res) => {
  res.status(201).json({ success: true, message: 'Place order' });
});

exports.getMyOrders = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Get my orders' });
});

exports.getOne = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Get order details' });
});

exports.updateStatus = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Update order status' });
});

exports.cancel = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Cancel order' });
});
