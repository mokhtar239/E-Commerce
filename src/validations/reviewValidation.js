const Joi = require('joi');

const createReviewSchema = Joi.object({
  productId: Joi.string()
    .required()
    .messages({
      'any.required': 'Product ID is required'
    }),

  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required'
    }),

  title: Joi.string()
    .max(100)
    .allow('', null),

  comment: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.min': 'Comment must be at least 10 characters',
      'any.required': 'Comment is required'
    })
});

module.exports = { createReviewSchema };
