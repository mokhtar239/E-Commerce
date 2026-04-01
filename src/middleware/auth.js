const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User = require('../models/sql/User');

const protect = async (req, res, next) => {
    let token;

    const authorization = req.headers.authorization;

    if (authorization && authorization.startsWith('Bearer')) {
        token = authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in, please log in to get access', 401));
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        const errMsg = error.name === 'TokenExpiredError'
            ? 'Token expired, please log in again'
            : 'Invalid token, please log in again';

        return next(new AppError(errMsg, 401));
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
        return next(new AppError('The user belonging to this token no longer exists', 401));
    }

    req.user = user;
    next();
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

module.exports = { protect, restrictTo };
