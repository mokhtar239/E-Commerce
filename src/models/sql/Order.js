const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: { args: [0], msg: 'Total amount cannot be negative' }
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    },
    shippingAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
            const raw = this.getDataValue('shippingAddress');
            return raw ? JSON.parse(raw) : null;
        },
        set(value) {
            this.setDataValue('shippingAddress', JSON.stringify(value));
        }
    },
    shippingCost: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    paymentStatus: {
        type: DataTypes.ENUM('unpaid', 'paid', 'refunded'),
        defaultValue: 'unpaid'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    trackingNumber: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'orders',
    timestamps: true
});

module.exports = Order;
