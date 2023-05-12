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

router.route('/quizzes/:id').get(quizController.getQuiz);

router.route('/quizzes/:id/questions').post(quizController.addQuestion);

router
  .route('/quizzes/:quizId/questions/:questionId')
  .put(quizController.editQuestion)
  .delete(quizController.deleteQuestion);

module.exports = router;
