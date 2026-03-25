const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User   = require('../models/sql/User');


const Protect = async (req , res , next) => {

    let Token;

    let authorization = req.headers.authorization;

    let key = process.env.JWT_SECRET;

    if (authorization && authorization.startsWith('Bearer')){
        Token = authorization.split(' ')[1];
    }

    if (!Token){
        return next (new AppError('u are not logged in , please log in to get access' , 401))
    }

    let decoded ;

    try
    {
        decoded = jwt.verify(Token , key );
    } 
    catch (error) {

        const errMsg = (error.name === 'TokenExpiredError' ? 'Token Expired , log in again' : 'invalid Token , log in again');

        const err = new AppError(errMsg , 401);

        return next(err);
    }

    const user = await User.findByPk(decoded.id);

    if (!user){

        const errMsg = 'The User belongs to this Token no longer exists';

        const err = new AppError(errMsg , 401);

        return next(err);
    }

    req.user = user;
    next();

}

const restrictTo = (...Roles) => {
    return (req , res , next) => {
        if (!Roles.includes(req.user.role))
            return next(new AppError('u dont have permissions to do that' , 403));
        next();
    }

}
module.exports = { protect: Protect , restrictTo };
