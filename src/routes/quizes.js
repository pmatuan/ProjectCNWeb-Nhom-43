const router = require('express').Router();
const {
  getQuizes,
  createQuiz,
  getQuizById,
  updateQuizById,
  deleteQuizById,
  getQuizQuestions,
  addQuizQuestion,
  deleteQuizQuestions,
  getQuizQuestion,
  putQuizQuestion,
  deleteQuizQuestion,
} = require('../services/quizes');

router
  .route('/quizes')
  .get(getQuizes)
  .post(createQuiz)

router
  .route('/quizes/:quizId')
  .get(getQuizById)
  .put(updateQuizById)
  .delete(deleteQuizById);

router
  .route('/quizes/:quizId/questions')
  .get(getQuizQuestions)
  .post(addQuizQuestion)
  .delete(deleteQuizQuestions);

router
  .route('/quizes/:quizId/questions/:questionId')
  .get(getQuizQuestion)
  .put(putQuizQuestion)
  .delete(deleteQuizQuestion);

module.exports = router;
