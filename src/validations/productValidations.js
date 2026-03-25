const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Product name must be at least 3 characters',
      'any.required': 'Product name is required'
    }),

  description: Joi.string()
    .min(20)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Description must be at least 20 characters',
      'any.required': 'Description is required'
    }),

  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),

  comparePrice: Joi.number()
    .min(0)
    .allow(null),

  category: Joi.string()
    .required()
    .messages({
      'any.required': 'Category is required'
    }),

  stock: Joi.number()
    .integer()
    .min(0)
    .default(0),

  brand: Joi.string()
    .max(100)
    .allow('', null),

  tags: Joi.array()
    .items(Joi.string())
    .max(10)
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(200),
  description: Joi.string().min(20).max(2000),
  price: Joi.number().min(0),
  comparePrice: Joi.number().min(0).allow(null),
  category: Joi.string(),
  stock: Joi.number().integer().min(0),
  brand: Joi.string().max(100).allow('', null),
  tags: Joi.array().items(Joi.string()).max(10)
}).min(1).messages({
  'object.min': 'At least one field must be provided to update'
});

module.exports = { createProductSchema, updateProductSchema };
