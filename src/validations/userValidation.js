const joi = require('joi');

const updateMeSchema = joi.object({
    name: joi.string().min(2).max(100),
    phone: joi.string().max(20).allow('', null),
    avatar: joi.string().max(255).allow('', null)
}).min(1).messages({
    'object.min': 'Provide at least one field to update'
});

const adminUpdateUserSchema = joi.object({
    name: joi.string().min(2).max(100),
    phone: joi.string().max(20).allow('', null),
    avatar: joi.string().max(255).allow('', null),
    role: joi.string().valid('buyer', 'seller', 'admin'),
    isVerified: joi.boolean()
}).min(1).messages({
    'object.min': 'Provide at least one field to update'
});

module.exports = { updateMeSchema, adminUpdateUserSchema };
