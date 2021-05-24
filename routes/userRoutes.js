const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// AUTH ROUTES
router.post('/signup', authController.adminCreateAdmin);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Restrict route to only AUTHENTICATED users
router.use(authController.protect);

// Current User Routes
router.patch('/updateMyPassword', authController.updatePassword);

module.exports = router;
