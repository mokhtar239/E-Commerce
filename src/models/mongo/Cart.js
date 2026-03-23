const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required']
    },
    name: {
        type: String,
        required: [true, 'Product name is required']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
        max: [10, 'Quantity cannot exceed 10 per item']
    },
    image: {
        type: String
    }
}, {
    _id: false
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: [true, 'User ID is required'],
        unique: true
    },
    items: [cartItemSchema],
    totalPrice: {
        type: Number,
        default: 0
    },
    totalItems: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// ==========================================
// Hook: Auto-calculate totals before saving
// ==========================================
cartSchema.pre('save', function () {
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.totalPrice = Math.round(this.totalPrice * 100) / 100;
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
