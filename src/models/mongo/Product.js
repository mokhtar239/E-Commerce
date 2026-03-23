const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [3, 'Product name must be at least 3 characters'],
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    slug: {
        type: String,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        minlength: [20, 'Description must be at least 20 characters'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    comparePrice: {
        type: Number,
        min: [0, 'Compare price cannot be negative']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Product category is required']
    },
    images: {
        type: [String],
        validate: {
            validator: function (val) {
                return val.length >= 1 && val.length <= 5;
            },
            message: 'Product must have between 1 and 5 images'
        }
    },
    thumbnail: {
        type: String
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    sellerId: {
        type: Number,
        required: [true, 'Seller ID is required']
    },
    brand: {
        type: String,
        trim: true
    },
    tags: {
        type: [String]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    ratingsAvg: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be below 0'],
        max: [5, 'Rating cannot exceed 5'],
        set: (val) => Math.round(val * 10) / 10
    },
    ratingsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==========================================
// Indexes for search & filtering performance
// ==========================================
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ sellerId: 1 });
productSchema.index({ price: 1 });
productSchema.index({ slug: 1 });

// ==========================================
// Virtual: Get reviews for this product
// ==========================================
productSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'productId'
});

// ==========================================
// Hook: Auto-generate slug & set thumbnail
// ==========================================
productSchema.pre('save', function () {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    if (this.isModified('images') && this.images.length > 0) {
        this.thumbnail = this.images[0];
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
