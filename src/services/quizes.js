const Quizes = require('../models/quizes');

const getQuizes = async (req, res, next) => {
  try {
    const quizes = await Quizes.find({ isEnabled: true }).lean();
    const text = quizes
      .map((quiz) => {
        return `<b>Name: </b>${quiz.name}<br><b>id:</b> ${quiz._id}<br><hr>`;
      })
      .join('');
    res.status(200).send(text);
  } catch (err) {
    next(err);
  }
};

const createQuiz = async (req, res, next) => {
  try {
    const quiz = await Quizes.create(req.body);
    console.log('Quiz Created: ', quiz);
    res.status(200).json(quiz);
  } catch (err) {
    next(err);
  }
};

const deleteQuizes = async (req, res, next) => {
  try {
    const resp = await Quizes.remove({});
    res.status(200).json(resp);
  } catch (err) {
    next(err);
  }
};

const unsupportedMethods = (req, res, next) => {
  res.status(403).send('Not supported');
};

module.exports = { getQuizes, createQuiz, deleteQuizes, unsupportedMethods };
