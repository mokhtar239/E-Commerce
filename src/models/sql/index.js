const { sequelize } = require('../../config/mysql');
const User = require('./User');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');

// ==========================================
// User <-->> Order (One-to-Many)
// A user can place many orders
// ==========================================
User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders'
});
Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// ==========================================
// Order <-->> OrderItem (One-to-Many)
// An order can have many items
// ==========================================
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items',
  onDelete: 'CASCADE'
});
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order'
});

// ==========================================
// Order <--> Payment (One-to-One)
// An order has exactly one payment
// ==========================================
Order.hasOne(Payment, {
  foreignKey: 'orderId',
  as: 'payment',
  onDelete: 'CASCADE'
});
Payment.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order'
});

// ==========================================
// User <-->> Payment (One-to-Many)
// A user can have many payments
// ==========================================
User.hasMany(Payment, {
  foreignKey: 'userId',
  as: 'payments'
});
Payment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'payer'
});

module.exports = {
  sequelize,
  User,
  Order,
  OrderItem,
  Payment
};
