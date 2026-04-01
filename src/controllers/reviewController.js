const catchAsync    = require('../utils/catchAsync');
const AppError      = require('../utils/AppError');
const Review        = require('../models/mongo/Review');
const Product       = require('../models/mongo/Product');
const { OrderItem, Order } = require('../models/sql');
const APIFeatures   = require('../utils/apiFeatures');

exports.create = catchAsync(async (req, res , next) => {
  const { productId , rating  , title , comment } = req.body ;

  // Bug 1 fix: missing await
  const product = await Product.findById(productId);

  if (!product)
    return next(new AppError('product not found ' , 404));

  const hasPurchasedThisProduct = await OrderItem.findOne({
    where : {
      productId : productId ,
      // Bug 2 fix: req.user.Id → req.user.id
      '$order.userId$' : req.user.id ,
      // Bug 3 fix: '$Order.status$' → '$order.status$' (must match as: 'order')
      '$order.status$' : 'delivered'
    } ,
    include : [{
      model : Order  ,
      as    : 'order',
      attributes : []
    }]
  });

  if (!hasPurchasedThisProduct){
    return next(new AppError('You Can Not Review Product You Did not Purchase' , 403 ));
  }

  const reviewedThisProductBefore = await Review.findOne({
    userId : req.user.id ,
    productId
  });

  if (reviewedThisProductBefore){
    return next(new AppError('You have already reviewed this product', 400));
  }

  const review = await Review.create({
    userId: req.user.id,
    userName: req.user.name,
    productId,
    rating,
    title,
    comment
  });

  res.status(201).json({ success: true, data: review });
});

exports.getProductReviews = catchAsync(async (req, res , next) => {

  const productId = req.params.productId;

  const product = await Product.findById(productId);

  if (!product)
    return next(new AppError('Product not found', 404));

  const features = new APIFeatures(
    Review.find({ productId }),
    req.query
  )
    .sort()
    .paginate();

  const reviews = await features.query;

  const total = await Review.countDocuments({ productId });
  const totalPages = Math.ceil(total / features.limit);

  res.status(200).json({
    success: true,
    results: reviews.length,
    pagination: {
      currentPage: features.page,
      totalPages,
      total,
      hasNext: features.page < totalPages,
      hasPrev: features.page > 1
    },
    data: reviews
  });
});

exports.remove = catchAsync(async (req, res , next) => {

  const UserId   = req.user.id;
  const UserRole = req.user.role ;
  const ReviewId = req.params.id;

  const review = await Review.findById(ReviewId);

  if (!review){
    return next(new AppError( 'Review Not Found' , 404 ));
  }

  if (UserRole === 'buyer' && review.userId != UserId)
    return next(new AppError( 'You can only delete your own reviews', 403));

  // Bug 5 fix: missing await
  await Review.findOneAndDelete({_id : ReviewId});

  res.status(200).json({ success: true, data: null });
});

exports.update = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  if (review.userId !== req.user.id) {
    return next(new AppError('You can only update your own reviews', 403));
  }

  const { rating, title, comment } = req.body;

  if (rating) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment) review.comment = comment;

  await review.save();

  res.status(200).json({ success: true, data: review });
});
