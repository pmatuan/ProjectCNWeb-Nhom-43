const Attendance = require('../models/attendances');
const catchAsync = require('../utils/catchAsync');
//const AppError = require('../utils/appError');

exports.getAttendances = catchAsync(async (req, res, next) => {
  const formId = req.params.id;
  const attendances = await Attendance.find({ form: formId }).populate('user');

  res.status(200).json({
    status: 'success',
    data: {
      attendances,
    },
  });
});
