const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const Quiz = require('../models/quizzes');

exports.isOwner = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.body.quizId);
  if (!quiz) return next(new AppError(404, 'Quiz not found'));

  if (!quiz.owner.equals(req.user._id))
    return next(new AppError(403, "You don't have permission on this quiz"));

  next();
});

exports.getAllQuizzes = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Quiz.find({ owner: req.user.id }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const quizzes = await features.query;

  res.status(200).json({
    status: 'success',
    results: quizzes.length,
    data: {
      quizzes,
    },
  });
});

exports.getQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findOne({
    owner: req.user.id,
    _id: req.params.id,
  }).populate({
    path: 'owner',
    select: 'id name email role',
  });

  if (!quiz) return next(new AppError(404, 'Quiz not found'));

  res.status(200).json({
    status: 'success',
    data: {
      quiz,
    },
  });
});

exports.createQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.create({
    name: req.body.name,
    owner: req.user.id,
  });
  res.status(201).json({
    status: 'success',
    data: {
      quiz,
    },
  });
});

exports.deleteQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findByIdAndDelete({ id: req.params.id });
  if (!quiz) return next(new AppError(404, 'Quiz not found'));
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.addQuestion = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) return next(new AppError(404, 'Quiz not found'));

  const question = {
    question: req.body.question,
    answers: req.body.answers, //array of string
    key: req.body.key,
    explaination: req.body.explaination,
  };

  quiz.questions.push(question);
  quiz.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      quiz,
    },
  });
});

exports.editQuestion = catchAsync(async (req, res, next) => {});
exports.deleteQuestion = catchAsync(async (req, res, next) => {});
