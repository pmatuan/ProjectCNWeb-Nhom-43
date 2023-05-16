const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const User = require('../models/users');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter() // ?name=abc&role=teacher
    .sort() // ?sort=role,-createdAt
    .limitFields() // ?fields=name
    .paginate(); // ?page=3&limit=10
  const users = await features.query;

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateRole = catchAsync(async (req, res, next) => {
  const { userId, newRole } = req.body;
  const user = await User.findByIdAndUpdate(
    userId,
    { role: newRole },
    { runValidators: true, new: true },
  );
  if (!user) return next(new AppError(404, 'User not found'));

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
