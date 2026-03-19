const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async( req , res) => {
    res.status(200).json({  success : true   ,  message : 'Register User'  });
});

exports.login = catchAsync(async( req , res) => {
    res.status(200).json({  success : true   ,  message : 'Login User'  });
});

exports.getMe = catchAsync(async( req , res) => {
    res.status(200).json({  success : true   ,  message : 'Get Current User'  });
});

exports.updatePassword = catchAsync(async( req , res) => {
    res.status(200).json({  success : true   ,  message : 'updata Password'  });
});