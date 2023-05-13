const Attendance = require('../models/attendances');
const catchAsync = require('../utils/catchAsync');
//const AppError = require('../utils/appError');

exports.getAttendances = catchAsync(async (req, res, next) => {
  const attendances = await Attendance.find({ form: req.params.id })
    .populate({
      path: 'user',
      select: 'name email',
    })
    .select('grade');

  res.status(200).json({
    status: 'success',
    data: {
      attendances,
    },
  });
});

exports.addAttendance = catchAsync(async (req, res, next) => {
  const attendance = await Attendance.create({
    user: req.user._id,
    form: req.params.id,
    grade: req.grade,
  });

  res.status(201).json({
    status: 'success',
    data: {
      attendance,
    },
  });
});
