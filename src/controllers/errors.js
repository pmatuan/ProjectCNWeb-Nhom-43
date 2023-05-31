const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(400, message);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${Object.keys(err.keyValue)[0]}`;
  return new AppError(400, message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(400, message);
};

const handleJWTError = (err) =>
  new AppError(401, `${err.message}, please log in again!`);

const handleJWtExpiredError = () =>
  new AppError(401, 'Your login was expired, please log in again');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 🤷‍♂️🤷‍♂️', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

// Global error handling
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
  else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err); // Hard-copy
    if (err.name === 'CastError') error = handleCastErrorDB(err); // Mongoose Error
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err); // Mongoose Error
    if (err.code === 11000) error = handleDuplicateFieldsDB(err); // MongoDB Error
    if (err.name === 'JsonWebTokenError') error = handleJWTError(err); // JWT Error
    if (err.name === 'TokenExpiredError') error = handleJWtExpiredError(); // JWT Error
    sendErrorProd(error, res);
  }
};
