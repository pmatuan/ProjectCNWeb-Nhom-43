const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  //if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    device: req.body.device,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Check if email and password was sent
  if (!email || !password) {
    return next(new AppError(400, 'Please provide your email and password!'));
  }
  // Check if email and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(401, 'Incorrect email or password'));
  }
  // Send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
};

// Use on all routes that require authentication
exports.protect = catchAsync(async (req, res, next) => {
  // Getting token and check if it exists
  let token = '';
  if (req.headers.cookie && req.headers.cookie.startsWith('jwt')) {
    token = req.headers.cookie.split('=')[1];
  }
  if (!token) {
    return next(
      new AppError(401, 'You are not logged in! Please log in to get access.'),
    );
  }
  // Verification token with jwt.verify()
  const decodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY,
  );
  // Check if user still exists
  const user = await User.findById(decodedPayload.id);
  if (!user) {
    return next(
      new AppError(401, 'The user belongs to this token is no longer exist.'),
    );
  }
  // Check if user changed password after the token was issued
  if (user.changedPasswordAfter(decodedPayload.iat)) {
    return next(
      new AppError(
        401,
        'User has recently changed password! Please log in again',
      ),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = user; // Get user information
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(403, 'You do not have permission to perform this action'),
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError(404, 'User not found'));
  // Generate a random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // Send it to user's email
  const resetUrl = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/resetPassword/${resetToken}`;
  const message = `Here is your token: ${resetToken} \nGo to ${resetUrl} to reset your password \nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes) 🫠',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        500,
        'There is an error sending the email. Please try again later!',
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // check token expiration, set the new password
  if (!user) {
    return next(new AppError(400, 'Token is invalid or has expired'));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // update changePasswordAt

  // log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user from collection (authenticated user only, should pass the protect middleware)
  const user = await User.findById(req.user.id).select('+password');
  // check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError(401, 'Your current password is incorrect'));
  // update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // log user in again
  createSendToken(user, 200, res);
});
