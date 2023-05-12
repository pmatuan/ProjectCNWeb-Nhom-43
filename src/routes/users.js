const express = require('express');
const authController = require('../controllers/auth');
const userController = require('../controllers/users');

const router = express.Router();

router
  .route('/users')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getAllUsers,
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    userController.updateRole,
  );

module.exports = router;
