const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: [true, 'User ID is required']
    },
    userName: {
        type: String,
        required: [true, 'User name is required']
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    title: {
        type: String,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        minlength: [10, 'Comment must be at least 10 characters'],
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });


reviewSchema.statics.calcAverageRating = async function (productId) {
    const stats = await this.aggregate([
        { $match: { productId: productId } },
        {
            $group: {
                _id: '$productId',
                avgRating: { $avg: '$rating' },
                numRatings: { $sum: 1 }
            }
        }
    ]);

    const Product = mongoose.model('Product');

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            ratingsAvg: stats[0].avgRating,
            ratingsCount: stats[0].numRatings
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            ratingsAvg: 0,
            ratingsCount: 0
        });
    }
};


reviewSchema.post('save', async function () {
    await this.constructor.calcAverageRating(this.productId);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await doc.constructor.calcAverageRating(doc.productId);
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
