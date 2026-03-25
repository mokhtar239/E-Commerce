const catchAsync = require('../utils/catchAsync');
const User = require('../models/sql/User');
const AppError = require('../utils/AppError');
const generateToken = require('../utils/generateToken');

exports.register = catchAsync(async( req , res , next) => {
    const { name , email , password , role , phone } = req.body ; 
    
    const existingUser = await User.findOne({where: {email}});

    if (existingUser)
        return next(new AppError('email already exists', 400));

    const newUser = await User.create({name , email , password , role , phone});

    const Token = generateToken({id : newUser.id , role : newUser.role});

    const response = {
        success : true , 
        message : 'user registered successfully' , 
        Token , 
        data : {newUser}
    };

    res.status(201).json(response);
});

exports.login = catchAsync(async( req , res , next) => {
    const {email , password} = req.body;

    if (!email || !password)
        return next(new AppError('please provide email and password', 400));

    const existingUser = await User.findOne({where : {email}});

    if (!existingUser){
        return next(new AppError('invalid email or password', 401));
    }

    const isMatched = await existingUser.comparePassword(password);

    if (!isMatched)
        return next(new AppError('invalid email or password', 401));

    existingUser.lastLogin = new Date();
    await existingUser.save({fields : ['lastLogin']});

    const Token = generateToken({id : existingUser.id , role : existingUser.role});

    const response = {
        success : true , 
        message :'user logged in successfully',
        Token , 
        data : {existingUser}
    };

    res.status(200).json(response);
});

exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user }
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400));
  }

  const user = await User.findByPk(req.user.id);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  const token = generateToken({ id: user.id, role: user.role });

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
    token
  });
});