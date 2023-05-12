const mongoose = require('mongoose');
const { generateRandomString } = require('../utils/random');

const formSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: () => `Warm-up Test: ${new Date()}`,
      required: [true, 'A test must have a name'],
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Please provide a quiz id'],
    },
    timeLimit: {
      type: Number,
      required: [true, 'Please provide a time limit for the form'],
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    password: {
      type: Number,
      default: () => generateRandomString(18, '0123456789'),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Form = mongoose.model('Form', formSchema);

module.exports = Form;
