const router = require('express').Router();
const asyncMiddleware = require('../middlewares/async');
const { auth } = require('../middlewares/auth');
const { loginValidate, registerValidate } = require('../validations/auth');
const authController = require('../controllers/auth');
const User = require('../models/user');
const Quizes = require('../models/quizes');

/* eslint-disable prettier/prettier */
router.post(
  '/auths/register',
  registerValidate,
  asyncMiddleware(authController.register),
);
router.post(
  '/auths/login',
  loginValidate,
  asyncMiddleware(authController.login),
);
router.get(
  '/auths/verify',
  auth,
  asyncMiddleware(authController.verifyAccessToken),
);
// router.get('/auths/:email', async (req, res) => {
//   const acc = await User.findOne({email: req.params.email});
//   if (acc){
//     res.send('Hello ' + acc.name);
//   }
//   else {
//       res.send('No body');
//   }
// });
/* eslint-enable prettier/prettier */

module.exports = router;
