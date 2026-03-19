
const errorHandler =  (err , req , res , next) => {
    const statusCode = err.statusCode || 500     ; 
    const status     = err.status     || 'error' ;
    
    const response = { 
        success : false , 
        status ,
        message: err.isOperational ? err.message : 'something get wrong'
    };

    if (process.env.NODE_ENV === 'development'){
        response.stack   = err.stack;
        response.message = err.message;
    }
    
    res.status(statusCode).json(response);

};


module.exports = errorHandler;