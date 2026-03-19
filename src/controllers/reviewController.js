const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  res.status(201).json({ success: true, message: 'Create review' });
});

exports.getProductReviews = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Get product reviews' });
});

exports.remove = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, message: 'Delete review' });
});
