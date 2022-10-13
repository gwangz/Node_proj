const AppError = require ('./../utils/appError')

const handleCastErrorDB = err => {
    const message = `invalid ${err.path}: ${err.value}`
    return new AppError(message, 400)
};

const sendErrorDev = (err, res) =>{
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) =>{
    // Operational, trusted error: send message to client
    if (err.isOperational){   
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack
        });
        //Programming or other unknown error. Dont let leak error details
    }else {
        //1.log error
        console.error('ERROR', err);

        //2. send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        })
    }
};
module.exports = (err, req, res, next)=>{
    // console.log(err.stack);
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res)
    }else if (process.env.NODE_ENV === 'production '){  //process.env.NODE_ENV.trim() added a space. postman error
        // let error = {...err};
        let error = Object.create(err);
        if(error.name === 'CastError') error = handleCastErrorDB(error)
        // error.name = err.name

        sendErrorProd(error, res);
    }
};



// if(process.env.NODE_ENV === 'development'){
//     sendErrorDev(err, res)
// }else if (process.env.NODE_ENV === 'production'){    //process.env.NODE_ENV.trim()
//     let error = {...err};
//     if(error.name === 'CastError') error = handleCastErrorDB(error)
//     // error.name = err.name

//     sendErrorProd(error, res);
// }
// };