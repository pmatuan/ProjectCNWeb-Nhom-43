const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const Quiz = require('../models/quizzes');
const Form = require('../models/forms');

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
  const count = await Quiz.countDocuments();
  res.status(200).json({
    status: 'success',
    results: quizzes.length,
    data: {
      count,
      quizzes,
    },
  });
});

exports.createQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.create({
    name: req.body.name,
    owner: req.user.id,
  });
  // Thiếu, nếu tên quiz trùng nhau ?
  res.status(201).json({
    status: 'success',
    data: {
      quiz,
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

exports.updateQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { name: req.body.name },
    { new: true },
  );

  if (!quiz) {
    return next(new AppError(404, 'Quiz not found'));
  }

  res.status(200).json({
    status: 'success',
    data: quiz,
  });
});

exports.deleteQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findOneAndDelete({
    _id: req.params.id,
    owner: req.user.id,
  });
  if (!quiz) return next(new AppError(404, 'Quiz not found'));
  await Form.deleteMany({ quiz: req.params.id });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllQuestions = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!quiz) {
    next(new AppError(404, `Quiz ${req.params.id} not found`));
  }

  res.status(200).json({
    status: 'success',
    data: quiz.questions,
  });
});

exports.addQuestions = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const owner = req.user.id;
  const { questions } = req.body;

  const quiz = await Quiz.findOneAndUpdate(
    {
      _id: id,
      owner: owner,
    },
    {
      $push: {
        questions: {
          $each: questions,
        },
      },
    },
    { new: true },
  );

  if (!quiz) {
    return next(new AppError(404, 'Quiz not found'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      quiz,
    },
  });
});

exports.deleteAllQuestions = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { $set: { questions: [] } },
    { new: true },
  );

  if (!quiz) {
    return next(new AppError(404, `Quiz ${req.params.id} not found`));
  }

  res.status(200).json(quiz.questions);
});

exports.getQuestion = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findOne({
    _id: req.params.quizId,
    owner: req.user.id,
  });
  const question = quiz?.questions.id(req.params.questionId);

  if (question) {
    res.status(200).json({
      status: 'success',
      data: {
        question,
      },
    });
  } else if (!quiz) {
    next(new AppError(404, `Quiz ${req.params.quizId} not found`));
  } else {
    next(new AppError(404, `Question ${req.params.questionId} not found`));
  }
});

exports.editQuestion = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findOne({
    _id: req.params.quizId,
    owner: req.user.id,
  });

  if (!quiz) {
    next(new AppError(404, `Quiz ${req.params.quizId} not found`));
  }

  const question = quiz.questions.id(req.params.questionId);

  if (!question) {
    next(new AppError(404, `Question ${req.params.questionId} not found`));
  }

  question.question =
    req.body.question !== undefined ? req.body.question : question.question;
  question.explanation =
    req.body.explanation !== undefined
      ? req.body.explanation
      : question.explanation;
  question.answers =
    req.body.answers !== undefined ? req.body.answers : question.answers;
  question.key = req.body.key !== undefined ? req.body.key : question.key;
  question.isEnabled =
    req.body.isEnabled !== undefined ? req.body.isEnabled : question.isEnabled;

  await quiz.save();
  const updatedQuiz = await Quiz.findById(quiz._id);

  res.status(200).json(updatedQuiz.questions.id(req.params.questionId));
});

exports.deleteQuestion = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findOne({
    _id: req.params.quizId,
    owner: req.user.id,
  });

  if (!quiz) {
    next(new AppError(404, `Quiz ${req.params.quizId} not found`));
  }

  const questionId = req.params.questionId;
  const question = quiz.questions.id(questionId);

  if (!question) {
    next(
      new AppError(
        404,
        `Question ${questionId} not found in Quiz ${req.params.quizId}`,
      ),
    );
  }

  quiz.questions.splice(
    quiz.questions.findIndex((q) => q.id === req.params.questionId),
    1,
  );
  const savedQuiz = await quiz.save();

  res.status(200).json(savedQuiz.questions);
});
