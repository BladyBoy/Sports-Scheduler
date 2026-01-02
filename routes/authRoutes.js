const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/signup', authController.signupPage);
router.post('/users', authController.createUser);
router.get('/login', authController.loginPage);
router.post('/session', authController.loginUser);
router.get('/signout', authController.signout);

module.exports = router;