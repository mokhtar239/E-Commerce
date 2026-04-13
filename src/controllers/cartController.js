const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Cart = require('../models/mongo/Cart');
const Product = require('../models/mongo/Product');

exports.getCart = catchAsync(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user.id });

  if (!cart) {
    cart = { items: [], totalPrice: 0, totalItems: 0 };
  }

  res.status(200).json({ success: true, data: cart });
});

exports.addItem = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    return next(new AppError('Product not found or unavailable', 404));
  }

  if (product.stock < quantity) {
    return next(new AppError(`Only ${product.stock} items available in stock`, 400));
  }

  let cart = await Cart.findOne({ userId: req.user.id });

  if (!cart) {
    cart = new Cart({ userId: req.user.id, items: [] });
  }

  const existingItem = cart.items.find(
    item => item.productId.toString() === productId
  );

  if (existingItem) {
    const newQuantity = quantity + existingItem.quantity;

    if (newQuantity > 10) {
      return next(new AppError('Cannot add more than 10 of the same item', 400));
    }

    if (newQuantity > product.stock) {
      return next(new AppError(`Only ${product.stock} items available in stock`, 400));
    }

    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.thumbnail
    });
  }

  await cart.save();

  res.status(200).json({ success: true, data: cart });
});

exports.updateItem = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return next(new AppError('Quantity must be an integer between 1 and 10', 400));
  }

  const cart = await Cart.findOne({ userId: req.user.id });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const item = cart.items.find(
    item => item.productId.toString() === req.params.productId
  );

  if (!item) {
    return next(new AppError('Item not in cart', 404));
  }

  const product = await Product.findById(req.params.productId);

  if (!product || !product.isActive) {
    return next(new AppError('Product is no longer available', 404));
  }

  if (quantity > product.stock) {
    return next(new AppError(`Only ${product.stock} items available in stock`, 400));
  }

  item.quantity = quantity;
  await cart.save();

  res.status(200).json({
    success: true,
    data: cart
  });
});

exports.removeItem = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;

  const cart = await Cart.findOne({ userId: req.user.id });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  cart.items = cart.items.filter(
    item => item.productId.toString() !== productId
  );

  await cart.save();

  res.status(200).json({ success: true, data: cart });
});

exports.clearCart = catchAsync(async (req, res) => {
  await Cart.findOneAndDelete({ userId: req.user.id });

  res.status(200).json({ success: true, data: null });
});
