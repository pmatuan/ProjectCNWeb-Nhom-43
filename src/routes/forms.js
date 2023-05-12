const express = require('express');
const formController = require('../controllers/forms');
const quizController = require('../controllers/quizzes');
const authController = require('../controllers/auth');

const router = express.Router();

router.use(authController.protect);

router.patch(
  '/forms/:id/open',
  formController.isOwner,
  formController.openForm,
);
router.patch(
  '/forms/:id/close',
  formController.isOwner,
  formController.closeForm,
);

router
  .route('/forms')
  .get(formController.getAllForms)
  .post(quizController.isOwner, formController.createForm);

router
  .route('/forms/:id')
  .get(authController.restrictTo('student'), formController.joinForm)
  .post(formController.isOwner, formController.deleteForm);

module.exports = router;
