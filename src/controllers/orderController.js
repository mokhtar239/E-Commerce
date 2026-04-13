const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sequelize, Order, OrderItem, Payment, User } = require('../models/sql');
const Cart = require('../models/mongo/Cart');
const Product = require('../models/mongo/Product');
const { sendOrderConfirmationEmail } = require('../utils/email');
const generateInvoice = require('../utils/generateInvoice');
const generateQR = require('../utils/generateQr');

async function revertStock(reserved) {
  if (!reserved.length) return;
  const ops = reserved.map(r => ({
    updateOne: {
      filter: { _id: r.productId },
      update: { $inc: { stock: r.quantity, sold: -r.quantity } }
    }
  }));
  try {
    await Product.bulkWrite(ops);
  } catch (err) {
    console.error('CRITICAL: stock revert failed, manual reconciliation needed:', err, reserved);
  }
}

exports.placeOrder = catchAsync(async (req, res, next) => {
  const { shippingAddress, paymentMethod, notes } = req.body;

  const cart = await Cart.findOne({ userId: req.user.id });

  if (!cart || cart.items.length === 0)
    return next(new AppError('your cart is empty', 400));

  // 1) Atomically reserve stock per item. Track what we took so we can revert.
  const reserved = [];
  for (const item of cart.items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.productId, isActive: true, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, sold: item.quantity } },
      { new: true }
    );

    if (!updated) {
      await revertStock(reserved);
      return next(new AppError(
        `"${item.name}" is unavailable or out of stock`, 400
      ));
    }
    reserved.push({ productId: item.productId, quantity: item.quantity });
  }

  const shippingCost = cart.totalPrice >= 100 ? 0 : 10;
  const totalAmount = cart.totalPrice + shippingCost;

  // 2) SQL transaction for order/items/payment
  const transaction = await sequelize.transaction();
  let order;
  try {
    order = await Order.create({
      userId: req.user.id,
      totalAmount,
      shippingAddress,
      shippingCost,
      notes: notes || null
    }, { transaction });

    const orderItemsData = cart.items.map(item => ({
      orderId: order.id,
      productId: item.productId.toString(),
      productName: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      subtotal: item.price * item.quantity
    }));
    await OrderItem.bulkCreate(orderItemsData, { transaction });

    await Payment.create({
      orderId: order.id,
      userId: req.user.id,
      amount: totalAmount,
      method: paymentMethod,
      status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'completed',
      paidAt: paymentMethod !== 'cash_on_delivery' ? new Date() : null
    }, { transaction });

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    await revertStock(reserved);
    console.error('Order SQL failed:', err);
    return next(new AppError('Order Placement Failed, Please Try Again', 500));
  }

  // 3) Non-critical: clear cart. Order is already committed — just log on failure.
  Cart.findOneAndDelete({ userId: req.user.id })
    .catch(err => console.error('Cart cleanup failed:', err));

  const fullOrder = await Order.findByPk(order.id, {
    include: [
      { model: OrderItem, as: 'items' },
      { model: Payment, as: 'payment' }
    ]
  });

  res.status(201).json({ success: true, data: fullOrder });

  // 4) Fire-and-forget side effects
  Promise.all([
    generateInvoice(fullOrder, req.user),
    generateQR(fullOrder)
  ]).catch(err => console.error('Invoice/QR generation failed:', err));

  User.findByPk(req.user.id)
    .then(user => {
      if (user) sendOrderConfirmationEmail(user, fullOrder)
        .catch(err => console.error('Order confirmation email failed:', err));
    })
    .catch(err => console.error('Failed to fetch user for order email:', err));
});

exports.getMyOrders = catchAsync(async (req, res) => {

  const id = req.user.id;
  const myOrders = await Order.findAll({
    where: { userId: id },
    include: [
      { model: OrderItem, as: 'items' },
      { model: Payment, as: 'payment' }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({ success: true, results: myOrders.length, data: myOrders });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;

  const order = await Order.findByPk(orderId, {
    include: [
      { model: OrderItem, as: 'items' },
      { model: Payment, as: 'payment' }
    ]
  });

  if (!order) {
    return next(new AppError('order not found', 404));
  }

  const OrderOwnerId = order.userId;

  if (req.user.role === 'buyer' && OrderOwnerId !== req.user.id) {
    return next(new AppError('You do not have permission to view this order', 403));
  }
  res.status(200).json({ success: true, data: order });
});

exports.updateStatus = catchAsync(async (req, res, next) => {

  const { status } = req.body;

  const order = await Order.findByPk(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.status === 'cancelled') {
    return next(new AppError('can not update cancelled order', 400));
  }

  if (order.status === 'delivered') {
    return next(new AppError('can not update delivered order', 400));
  }

  const statusFlow = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered']
  };

  const allowed = statusFlow[order.status];

  if (!allowed || !allowed.includes(status)) {
    return next(new AppError(`Cannot change status from ${order.status} to ${status}`, 400));
  }

  order.status = status;

  if (status === 'delivered') {
    await Payment.update(
      { status: 'completed', paidAt: new Date() },
      { where: { orderId: req.params.id, status: 'pending' } }
    )
    order.paymentStatus = 'paid';
  }
  await order.save();

  res.status(200).json({ success: true, data: order });
});


exports.cancel = catchAsync(async (req, res, next) => {
  const order = await Order.findByPk(req.params.id, {
    include: [{ model: OrderItem, as: 'items' }]
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Buyers can only cancel their own orders
  if (req.user.role === 'buyer' && order.userId !== req.user.id) {
    return next(new AppError('You do not have permission to cancel this order', 403));
  }

  // Buyers: pending only. Admins: pending or confirmed
  const allowedStatuses = req.user.role === 'admin'
    ? ['pending', 'confirmed']
    : ['pending'];

  if (!allowedStatuses.includes(order.status)) {
    return next(new AppError(`Cannot cancel an order with status "${order.status}"`, 400));
  }

  // Restore stock in MongoDB
  const bulkOps = order.items.map(item => ({
    updateOne: {
      filter: { _id: item.productId },
      update: { $inc: { stock: item.quantity, sold: -item.quantity } }
    }
  }));

  await Product.bulkWrite(bulkOps);

  // Update order and payment status
  order.status = 'cancelled';
  order.paymentStatus = 'refunded';
  await order.save();

  await Payment.update(
    { status: 'refunded' },
    { where: { orderId: order.id } }
  );

  res.status(200).json({ success: true, data: order });
});
