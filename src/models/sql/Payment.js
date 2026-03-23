const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Amount cannot be negative' }
    }
  },
  method: {
    type: DataTypes.ENUM('credit_card', 'paypal', 'cash_on_delivery'),
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
},
 {
  tableName: 'payments',
  timestamps: true
});

module.exports = Payment;
