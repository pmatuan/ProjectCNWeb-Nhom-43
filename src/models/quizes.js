const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    option: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answers: [optionSchema],

    answer: {
      type: Number,
      required: true,
    },

    isEnabled: {
      type: Boolean,
      default: true,
    },

    explanation: {
      type: String,
      default: '',
    },
  },
  {
    collection: 'question',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const quizSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    isEnabled: {
      type: Boolean,
      default: true,
    },

    questions: [questionSchema],
  },
  {
    collection: 'quizes',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

module.exports = {
  Quizes: mongoose.model('Quiz', quizSchema),
  Questions: mongoose.model('Question', questionSchema),
};
