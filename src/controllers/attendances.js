const Attendance = require('../models/attendances');
const catchAsync = require('../utils/catchAsync');

exports.getAttendances = catchAsync(async (req, res, next) => {
  const attendances = await Attendance.find({ form: req.params.id }).populate({
    path: 'user',
    select: 'name email device',
  });

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
    device: req.device,
    location: {
      latitude: req.location.latitude,
      longitude: req.location.longitude,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      attendance,
    },
  });
});
