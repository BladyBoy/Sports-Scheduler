const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const connectEnsureLogin = require("connect-ensure-login");

// Middleware
const ensureLoggedIn = connectEnsureLogin.ensureLoggedIn({ redirectTo: '/login' });

// CREATE Session
router.get('/create/:sportId', ensureLoggedIn, sessionController.getCreatePage);
router.post('/', ensureLoggedIn, sessionController.createSession);

// VIEW & INTERACT
router.get('/:id', ensureLoggedIn, sessionController.getSessionDetails);
router.post('/join', ensureLoggedIn, sessionController.joinSession);
router.post('/leave', ensureLoggedIn, sessionController.leaveSession);
router.post('/remove-player/:id', ensureLoggedIn, sessionController.removePlayer);
router.get('/history/:sportId', ensureLoggedIn, sessionController.getHistory);

// EDIT Session
router.get('/edit/:id', ensureLoggedIn, sessionController.getEditPage);
router.post('/update/:id', ensureLoggedIn, sessionController.updateSession);

// CANCEL Session
router.get('/cancel/:id', ensureLoggedIn, sessionController.getCancelPage);
router.post('/cancel/:id', ensureLoggedIn, sessionController.cancelSession);

module.exports = router;