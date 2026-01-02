const express = require('express');
const router = express.Router();
const sportController = require('../controllers/sportController');
const connectEnsureLogin = require("connect-ensure-login");

// Middleware
const ensureLoggedIn = connectEnsureLogin.ensureLoggedIn({ redirectTo: '/login' });

// Dashboard
router.get('/', ensureLoggedIn, sportController.getDashboard);

// Create Sport (Specific Route)
router.get('/create', ensureLoggedIn, sportController.getCreatePage);
router.post('/', ensureLoggedIn, sportController.createSport);

// Edit Sport 
router.get('/edit/:id', ensureLoggedIn, sportController.getEditPage);
router.post('/update/:id', ensureLoggedIn, sportController.updateSport);

// View Single Sport and its Sessions
router.get('/:id', ensureLoggedIn, sportController.getSportDetails);

// Delete Sport
router.delete('/:id', ensureLoggedIn, sportController.deleteSport);

module.exports = router;