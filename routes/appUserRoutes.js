const express = require('express');
const router = express.Router();

const appUserController = require('../controllers/appUserController');
const authController = require('../controllers/authController');

router.post('/onboard/:faceId', appUserController.registerAppUser);

router.get('/', authController.protect, appUserController.getAllAppUser);
router.get('/student', authController.protect, appUserController.getAllStudentAppUser);
router.get('/worker', authController.protect, appUserController.getAllWorkerAppUser);
router.get('/:id', authController.protect, appUserController.getAppUser);
router.patch('/update/:id', authController.protect, appUserController.updateAppUser);
router.delete('/:id', authController.protect, appUserController.deleteAppUser);

module.exports = router;