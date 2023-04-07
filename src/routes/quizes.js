const router = require('express').Router();
const {
  getQuizes,
  createQuiz,
  deleteQuizes,
  unsupportedMethods,
} = require('../services/quizes');
const {
  getQuizById,
  updateQuizById,
  deleteQuizById,
} = require('../services/quizesID');
const {
  getQuizQuestions,
  addQuizQuestion,
  deleteQuizQuestions,
  notSupported,
} = require('../services/quizesQuestion');

router
  .route('/quizes')
  .get(getQuizes)
  .post(createQuiz)
  .delete(deleteQuizes)
  .all(unsupportedMethods);

router
  .route('/Quizes/:quizId')
  .get(getQuizById)
  .put(updateQuizById)
  .delete(deleteQuizById);

router
  .route('/quizes/:quizId/questions')
  .get(getQuizQuestions)
  .post(addQuizQuestion)
  .put(notSupported)
  .delete(deleteQuizQuestions);

const getQuizQuestion = (req, res, next) => {
  Quizes.findById(req.params.quizId)
    .then((quiz) => {
      if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(quiz.questions.id(req.params.questionId));
      } else if (quiz == null) {
        const err = new Error(`Quiz ${req.params.quizId} not found`);
        err.statusCode = 404;
        return next(err);
      } else {
        const err = new Error(`Question ${req.params.questionId} not found`);
        err.statusCode = 404;
        return next(err);
      }
    })
    .catch((err) => next(err));
};

const postQuizQuestion = (req, res, next) => {
  res.statusCode = 403;
  res.end(
    `POST operation not supported on /quizes/${req.params.quizId}/questions${req.params.questionId}`,
  );
};

const putQuizQuestion = (req, res, next) => {
  Quizes.findById(req.params.quizId)
    .then((quiz) => {
      if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
        if (req.body.question) {
          quiz.questions.id(req.params.questionId).question = req.body.question;
        }
        if (req.body.answers) {
          quiz.questions.id(req.params.questionId).answers = req.body.answers;
        }
        if (req.body.answer) {
          quiz.questions.id(req.params.questionId).answer = req.body.answer;
        }
        if (req.body.isEnabled != null) {
          quiz.questions.id(req.params.questionId).isEnabled =
            req.body.isEnabled;
        }
        quiz.save().then(
          (quiz) => {
            Quizes.findById(quiz._id).then((quiz) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(quiz.questions.id(req.params.questionId));
            });
          },
          (err) => next(err),
        );
      } else if (quiz == null) {
        const err = new Error(`Quiz ${req.params.quizId} not found`);
        err.statusCode = 404;
        return next(err);
      } else {
        const err = new Error(`Question ${req.params.questionId} not found`);
        err.statusCode = 404;
        return next(err);
      }
    })
    .catch((err) => next(err));
};

const deleteQuizQuestion = (req, res, next) => {
  Quizes.findById(req.params.quizId)
    .then((quiz) => {
      if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
        quiz.questions.id(req.params.questionId).remove();
        quiz.save().then(
          (quiz) => {
            Quizes.findById(quiz._id).then((quiz) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(quiz);
            });
          },
          (err) => next(err),
        );
      } else if (quiz == null) {
        const err = new Error(`Quiz ${req.params.quizId} not found`);
        err.statusCode = 404;
        return next(err);
      } else {
        const err = new Error(`Question ${req.params.questionId} not found`);
        err.statusCode = 404;
        return next(err);
      }
    })
    .catch((err) => next(err));
};

router
  .route('/quizes/:quizId/questions/:questionId')
  .get(getQuizQuestion)
  .post(postQuizQuestion)
  .put(putQuizQuestion)
  .delete(deleteQuizQuestion);

module.exports = router;
