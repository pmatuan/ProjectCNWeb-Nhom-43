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

router.get(
  '/forms/:id/join',
  authController.restrictTo('student'),
  formController.joinForm,
);

router
  .route('/forms')
  .get(formController.getAllForms)
  .post(quizController.isOwner, formController.createForm);

router
  .route('/forms/:id')
  .get(formController.getForm)
  .delete(formController.isOwner, formController.deleteForm);

module.exports = router;
