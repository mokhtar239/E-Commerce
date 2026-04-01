const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { Order, OrderItem, Payment, User } = require('../models/sql');
const { Op } = require('sequelize');
const Product = require('../models/mongo/Product');

// Helper: render an admin page with the layout
const renderAdmin = (res, page, data = {}) => {
  res.render('layouts/admin', {
    page,
    body: '',
    message: null,
    error: null,
    ...data
  });
};

// ==========================================
// @desc    Dashboard with stats
// @route   GET /admin/dashboard
// @access  Admin
// ==========================================
exports.getDashboard = catchAsync(async (req, res) => {
  // Run all queries in parallel for speed
  const [
    totalUsers,
    buyers,
    sellers,
    totalOrders,
    pendingOrders,
    revenueResult,
    totalProducts,
    lowStock,
    recentOrders
  ] = await Promise.all([
    User.count(),
    User.count({ where: { role: 'buyer' } }),
    User.count({ where: { role: 'seller' } }),
    Order.count(),
    Order.count({ where: { status: 'pending' } }),
    Order.sum('totalAmount', { where: { status: { [Op.notIn]: ['cancelled'] } } }),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ stock: { $lt: 5 }, isActive: true }),
    Order.findAll({ order: [['createdAt', 'DESC']], limit: 10 })
  ]);

  const stats = {
    totalUsers,
    buyers,
    sellers,
    totalOrders,
    pendingOrders,
    totalRevenue: revenueResult || 0,
    totalProducts,
    lowStock
  };

  res.render('pages/dashboard', {
    title: 'Dashboard',
    page: 'dashboard',
    stats,
    recentOrders
  });
});

// ==========================================
// @desc    Users management page
// @route   GET /admin/users
// @access  Admin
// ==========================================
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.findAll({
    order: [['createdAt', 'DESC']]
  });

  res.render('pages/users', {
    title: 'Users',
    page: 'users',
    users,
    message: req.query.message || null,
    error: req.query.error || null
  });
});

// ==========================================
// @desc    Update user role
// @route   POST /admin/users/:id/role
// @access  Admin
// ==========================================
exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.redirect('/admin/users?error=User not found');
  }

  // Prevent admin from changing their own role
  if (user.id === req.user.id) {
    return res.redirect('/admin/users?error=Cannot change your own role');
  }

  user.role = role;
  await user.save({ fields: ['role'] });

  res.redirect('/admin/users?message=Role updated successfully');
});

// ==========================================
// @desc    Delete user
// @route   POST /admin/users/:id/delete
// @access  Admin
// ==========================================
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.redirect('/admin/users?error=User not found');
  }

  if (user.id === req.user.id) {
    return res.redirect('/admin/users?error=Cannot delete your own account');
  }

  await user.destroy();

  res.redirect('/admin/users?message=User deleted successfully');
});

// ==========================================
// @desc    Orders management page
// @route   GET /admin/orders
// @access  Admin
// ==========================================
exports.getAllOrders = catchAsync(async (req, res) => {
  const { status } = req.query;

  const where = {};
  if (status) where.status = status;

  const orders = await Order.findAll({
    where,
    order: [['createdAt', 'DESC']],
    include: [{ model: Payment, as: 'payment' }]
  });

  res.render('pages/orders', {
    title: 'Orders',
    page: 'orders',
    orders,
    filter: status || '',
    message: req.query.message || null,
    error: req.query.error || null
  });
});

// ==========================================
// @desc    Update order status (from dashboard)
// @route   POST /admin/orders/:id/status
// @access  Admin
// ==========================================
exports.updateOrderStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByPk(req.params.id);

  if (!order) {
    return res.redirect('/admin/orders?error=Order not found');
  }

  const statusFlow = {
    pending  : ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped  : ['delivered']
  };

  const allowed = statusFlow[order.status];

  if (!allowed || !allowed.includes(status)) {
    return res.redirect(`/admin/orders?error=Cannot change from ${order.status} to ${status}`);
  }

  order.status = status;

  if (status === 'delivered') {
    await Payment.update(
      { status: 'completed', paidAt: new Date() },
      { where: { orderId: order.id, status: 'pending' } }
    );
    order.paymentStatus = 'paid';
  }

  if (status === 'cancelled') {
    order.paymentStatus = 'refunded';
    await Payment.update(
      { status: 'refunded' },
      { where: { orderId: order.id } }
    );

    // Restore stock
    const items = await OrderItem.findAll({ where: { orderId: order.id } });
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stock: item.quantity, sold: -item.quantity } }
      }
    }));
    if (bulkOps.length > 0) await Product.bulkWrite(bulkOps);
  }

  await order.save();

  res.redirect('/admin/orders?message=Order status updated');
});

// ==========================================
// @desc    Products management page
// @route   GET /admin/products
// @access  Admin
// ==========================================
exports.getAllProducts = catchAsync(async (req, res) => {
  const products = await Product.find()
    .sort('-createdAt')
    .select('name price stock sold ratingsAvg ratingsCount isActive');

  res.render('pages/products', {
    title: 'Products',
    page: 'products',
    products,
    message: req.query.message || null,
    error: req.query.error || null
  });
});

// ==========================================
// @desc    Toggle product active status
// @route   POST /admin/products/:id/toggle
// @access  Admin
// ==========================================
exports.toggleProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.redirect('/admin/products?error=Product not found');
  }

  product.isActive = !product.isActive;
  await product.save();

  res.redirect(`/admin/products?message=${product.name} ${product.isActive ? 'activated' : 'deactivated'}`);
});
