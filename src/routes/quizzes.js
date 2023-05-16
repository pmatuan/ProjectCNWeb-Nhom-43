const express = require('express');
const quizController = require('../controllers/quizzes');
const authController = require('../controllers/auth');

const router = express.Router();

router.use(authController.protect);
router.use(authController.restrictTo('admin', 'teacher'));

router
  .route('/quizzes')
  .get(quizController.getAllQuizzes)
  .post(quizController.createQuiz);

router
  .route('/quizzes/:id')
  .get(quizController.getQuiz)
  .put(quizController.updateQuiz)
  .delete(quizController.deleteQuiz);

router
  .route('/quizzes/:id/questions')
  .get(quizController.getAllQuestions)
  .post(quizController.addQuestions)
  .delete(quizController.deleteAllQuestions);

router
  .route('/quizzes/:quizId/questions/:questionId')
  .get(quizController.getQuestion)
  .put(quizController.editQuestion)
  .delete(quizController.deleteQuestion);

module.exports = router;
