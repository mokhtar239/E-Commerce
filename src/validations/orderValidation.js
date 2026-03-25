const Joi = require('joi');

const placeOrderSchema = Joi.object({
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    zip: Joi.string().required()
  })
    .required()
    .messages({
      'any.required': 'Shipping address is required'
    }),

  paymentMethod: Joi.string()
    .valid('credit_card', 'paypal', 'cash_on_delivery')
    .required()
    .messages({
      'any.only': 'Payment method must be credit_card, paypal, or cash_on_delivery',
      'any.required': 'Payment method is required'
    }),

  notes: Joi.string()
    .max(500)
    .allow('', null)
});

module.exports = { placeOrderSchema };
