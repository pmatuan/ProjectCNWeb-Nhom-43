const express = require('express');
const formController = require('../controllers/forms');
const quizController = require('../controllers/quizzes');
const authController = require('../controllers/auth');
const attendancesController = require('../controllers/attendances');

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
  .get(quizController.isOwner, formController.getForm)
  .post(formController.gradeForm, attendancesController.addAttendance)
  .delete(formController.isOwner, formController.deleteForm);

router.get(
  '/forms/:id/attendances',
  formController.isOwner,
  attendancesController.getAttendances,
);

module.exports = router;
