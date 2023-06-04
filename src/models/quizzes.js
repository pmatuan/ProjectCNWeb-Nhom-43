const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answers: [
      {
        type: String,
        required: true,
      },
    ],
    key: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      default: '',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const quizSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    questions: [questionSchema],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'quizzes',
    timestamps: true,
  },
);

module.exports = mongoose.model('Quiz', quizSchema);
