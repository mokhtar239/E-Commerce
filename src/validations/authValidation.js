const joi = require('joi');

const registerSchema = joi.object({
    name: joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 100 characters',
            'any.required': 'Name is required'
        }),

    email: joi.string()
        .email()
        .required()
        .messages({
            'any.required': 'Email is required',
            'string.email': 'Please provide a valid email'
        }),

    password: joi.string()
        .min(6)
        .max(126)
        .required()
        .messages({
            'any.required': 'Password is required',
            'string.min': 'Password must be at least 6 characters',
            'string.max': 'Password cannot exceed 126 characters'
        }),

    role: joi.string()
        .valid('buyer', 'seller')
        .default('buyer')
        .messages({
            'any.only': 'Role must be buyer or seller'
        }),

    phone: joi.string()
        .max(20)
        .allow('', null)
        .messages({
            'string.max': 'Phone number cannot exceed 20 digits'
        })
});

const loginSchema = joi.object({
    email: joi.string()
        .email()
        .required()
        .messages({
            'any.required': 'Email is required',
            'string.email': 'Email must be a valid email'
        }),

    password: joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});

const updatePasswordSchema = joi.object({
    currentPassword: joi.string()
        .required()
        .messages({
            'any.required': 'Current password is required'
        }),

    newPassword: joi.string()
        .min(6)
        .max(126)
        .required()
        .messages({
            'any.required': 'Password is required',
            'string.min': 'Password must be at least 6 characters',
            'string.max': 'Password cannot exceed 126 characters'
        })
});

module.exports = { registerSchema, loginSchema, updatePasswordSchema };
