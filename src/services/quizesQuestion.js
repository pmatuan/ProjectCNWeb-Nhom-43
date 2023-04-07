const Quizes = require('../models/quizes');

const getQuizQuestions = (req, res, next) => {
  Quizes.findById(req.params.quizId)
    .then((quiz) => {
      if (quiz) {
        res.status(200).json(quiz.questions);
      } else {
        const err = new Error(`Quiz ${req.params.quizId} not found`);
        err.status = 404;
        return next(err);
      }
    })
    .catch((err) => next(err));
};

const addQuizQuestion = (req, res, next) => {
  Quizes.findById(req.params.quizId)
    .then((quiz) => {
      if (quiz) {
        quiz.questions.push(req.body);
        return quiz.save();
      }
      const err = new Error(`Quiz ${req.params.quizId} not found`);
      err.status = 404;
      throw err;
    })
    .then((quiz) => Quizes.findById(quiz._id))
    .then((quiz) => res.status(200).json(quiz))
    .catch((err) => next(err));
};

const deleteQuizQuestions = (req, res, next) => {
  Quizes.findById(req.params.quizId)
    .then((quiz) => {
      if (quiz) {
        for (let i = quiz.questions.length - 1; i >= 0; i--) {
          quiz.questions.id(quiz.questions[i]._id).remove();
        }
        return quiz.save();
      }
      const err = new Error(`Quiz ${req.params.quizId} not found`);
      err.status = 404;
      throw err;
    })
    .then((quiz) => res.status(200).json(quiz.questions))
    .catch((err) => next(err));
};

const notSupported = (req, res) => {
  res
    .status(403)
    .send(
      `PUT operation not supported on /quizes/${req.params.quizId}/questions`,
    );
};

module.exports = { getQuizQuestions, addQuizQuestion, deleteQuizQuestions, notSupported };