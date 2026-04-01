const catchAsync = require('../utils/catchAsync');
const Product = require('../models/mongo/Product');
const Category = require('../models/mongo/Category');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

exports.create = catchAsync(async (req, res, next) => {
  req.body.sellerId = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product
  });
});

exports.getAll = catchAsync(async (req, res) => {
  // Build the query with APIFeatures
  const features = new APIFeatures(Product.find({ isActive: true }), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Execute the query
  const products = await features.query;

  // Get total count for pagination metadata
  const totalFeatures = new APIFeatures(Product.find({ isActive: true }), req.query)
    .search()
    .filter();
  const total = await totalFeatures.query.countDocuments();

  const totalPages = Math.ceil(total / features.limit);

  res.status(200).json({
    success: true,
    results: products.length,
    pagination: {
      currentPage: features.page,
      totalPages,
      total,
      hasNext: features.page < totalPages,
      hasPrev: features.page > 1
    },
    data: products
  });
});


exports.getOne = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('reviews')
    .populate('category', 'name');

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

exports.update = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (req.user.role === 'seller' && product.sellerId !== req.user.id) {
    return next(new AppError('You can only update your own products', 403));
  }

  Object.assign(product, req.body);
  await product.save();

  res.status(200).json({
    success: true,
    data: product
  });
});

exports.remove = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  if (req.user.role === 'seller' && product.sellerId !== req.user.id) {
    return next(new AppError('You can only delete your own products', 403));
  }

  await product.deleteOne();

  res.status(204).json({
    success: true,
    data: null
  });
});

exports.getMyProducts = catchAsync(async (req, res) => {
  const products = await Product.find({ sellerId: req.user.id })
    .populate('category', 'name')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    results: products.length,
    data: products
  });
});

exports.getByCategory = catchAsync(async (req, res, next) => {
  const categoryId = req.params.catId;

  const category = await Category.findById(categoryId);

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  const products = await Product.find({ category: categoryId, isActive: true })
    .populate('category', 'name')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    results: products.length,
    data: products
  });
});
