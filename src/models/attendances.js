const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide an user id'],
  },
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: [true, 'Please provide a form id'],
  },
  grade: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
    default: 0,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

attendanceSchema.index({ user: 1, form: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
