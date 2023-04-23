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
  notSupported,
  getQuizQuestion,
  postQuizQuestion,
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
  .put(notSupported)
  .delete(deleteQuizQuestions);

router
  .route('/quizes/:quizId/questions/:questionId')
  .get(getQuizQuestion)
  .post(postQuizQuestion)
  .put(putQuizQuestion)
  .delete(deleteQuizQuestion);

module.exports = router;
