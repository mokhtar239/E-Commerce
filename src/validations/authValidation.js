const joi = require('joi');

const registerSchema = joi.object({

    name : joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
    'string.min'  : 'name must be at least 2 charachters'  ,  
    'string.max'  : 'name can not excedd 100 charachters',
    'any.required': 'name is required' }) 
    , 


    email : joi.string()
    .email()
    .required()
    .messages({
    'any.required' : 'email is reauired' , 
    'string.email' : 'please provide a valid email'
    }) 
    , 


    password : joi.string()
    .min(6)
    .max(126)
    .required()
    .messages({
    'any.required' : 'password is required',
    'string.min'   : 'password must be at least 6 charachters',
    'string.max'   : 'password can not excedd 126 charachters'
    })
    ,

    role : joi.string()
    .valid('buyer' , 'seller')
    .default('buyer')
    .messages({
        'any.only' : 'role must br buyer or seller'
    }) 
    , 

    phone : joi.string()
    .max(20)
    .allow('' , null)
    .messages({
    'string.max' : 'phone number can not excedd 20 digit'
    })

});


const loginSchema = joi.object({
    
    email : joi.string()
    .email()
    .required()
    .messages({
    'any.required' : 'email is required',
    'string.email' : 'email must be a valid email'
    })
    ,

    password : joi.string()
    .required()
    .messages({
    'any.required' : 'password is required'
    })
    ,


});

const updatePasswordSchema = joi.object({

    currentPassword : joi.string()
    .required()
    .messages({
    'any.required' : 'current password is required'
    })
    ,
    newPassword : joi.string()
    .min(6)
    .max(126)
    .required()
    .messages({
    'any.required' : 'password is required',
    'string.min'   : 'password must be at least 6 charachters',
    'string.max'   : 'password can not excedd 126 charachters'
    })
});

module.exports = { registerSchema, loginSchema, updatePasswordSchema };

