const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  productName: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Quantity must be at least 1' }
    }
  },
  unitPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Unit price cannot be negative' }
    }
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'order_items',
  timestamps: false,
  hooks: {
    beforeValidate: (item) => {
      if (item.quantity && item.unitPrice) {
        item.subtotal = item.quantity * item.unitPrice;
      }
    }
  }
});

module.exports = OrderItem;
