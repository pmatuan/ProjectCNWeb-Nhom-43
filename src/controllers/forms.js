const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Form = require('../models/forms');
const APIFeatures = require('../utils/apiFeatures');
const { generateRandomString } = require('../utils/random');

exports.gradeForm = catchAsync(async (req, res, next) => {
  const form = await Form.findOne({
    _id: req.params.id,
    isEnabled: true,
  }).populate('quiz');

  if (!form) return next(new AppError(404, 'Form not found'));

  const { questions } = form.quiz;
  const studentAnswers = req.body.answers;

  let rightAnswer = 0;
  questions.forEach((question) => {
    const studentAnswer = studentAnswers[question._id];
    if (studentAnswer === question.key) rightAnswer += 1;
  });
  req.grade = Math.round((rightAnswer / questions.length) * 100) / 10;
  req.device = req.body.device
  req.location = req.body.location
  next();
});

exports.isOwner = catchAsync(async (req, res, next) => {
  const form = await Form.findById(req.params.id);
  if (!form) return next(new AppError(404, 'Form not found'));
  if (!form.owner.equals(req.user._id))
    return next(new AppError(403, "You don't have permission on this form"));

  next();
});

exports.getAllForms = catchAsync(async (req, res, next) => {
  const ownerId = req.user._id;
  const features = new APIFeatures(
    Form.find({ owner: ownerId }).populate({ path: 'quiz', select: 'name' }),
    req.query,
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const forms = await features.query;
  const count = await Form.countDocuments();
  res.status(200).json({
    status: 'success',
    results: forms.length,
    data: {
      count,
      forms,
    },
  });
});

exports.createForm = catchAsync(async (req, res, next) => {
  const { quizId, name, timeLimit } = req.body;

  const form = await Form.create({
    name: name,
    quiz: quizId,
    timeLimit: timeLimit, //minutes
    owner: req.user.id,
  });

  const formData = await Form.findById(form._id)
    .populate('quiz')
    .select('-__v ');

  res.status(200).json({
    status: 'success',
    data: {
      form: formData,
    },
  });
});

exports.getForm = catchAsync(async (req, res, next) => {
  const form = await Form.findById(req.params.id)
    .populate('quiz')
    .select('-__v ');

  res.status(200).json({
    status: 'success',
    data: {
      form,
    },
  });
});

exports.editForm = catchAsync(async (req, res, next) => {
  const { quizId, name, timeLimit } = req.body;
  const form = await Form.findByIdAndUpdate(
    req.params.id,
    { quizId: quizId, name: name, timeLimit: timeLimit },
    { new: true },
  );
  res.status(200).json({
    status: 'success',
    data: {
      form,
    },
  });
});

exports.deleteForm = catchAsync(async (req, res, next) => {
  const form = await Form.findByIdAndDelete(req.params.id);
  if (!form) return next(new AppError(404, 'Form not found'));
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.openForm = catchAsync(async (req, res, next) => {
  const form = await Form.findByIdAndUpdate(
    req.params.id,
    { isEnabled: true, password: req.body.password },
    { new: true },
  );
  res.status(200).json({
    status: 'success',
    data: {
      form,
    },
  });
});

exports.closeForm = catchAsync(async (req, res, next) => {
  const form = await Form.findByIdAndUpdate(
    req.params.id, //form-id
    { isEnabled: false, password: generateRandomString(6, '0123456789') },
    { new: true },
  );
  res.status(200).json({
    status: 'success',
    data: {
      form,
    },
  });
});

exports.joinForm = catchAsync(async (req, res, next) => {
  const form = await Form.findOne({ _id: req.params.id, isEnabled: true });

  if (!form) return next(new AppError(404, 'Form not found'));
  if (req.body.password !== form.password.toString())
    return next(new AppError(403, 'Wrong password, please try again!'));

  const fullForm = await Form.findById(req.params.id)
    .populate({
      path: 'quiz',
      select: '-questions.key -questions.explanation',
    })
    .select('-__v -password');

  res.status(200).json({
    status: 'success',
    data: {
      form: fullForm,
    },
  });
});
