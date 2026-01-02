const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const connectEnsureLogin = require("connect-ensure-login");

// Middleware
const ensureLoggedIn = connectEnsureLogin.ensureLoggedIn({ redirectTo: '/login' });

router.get('/', ensureLoggedIn, reportController.getReports);

module.exports = router;