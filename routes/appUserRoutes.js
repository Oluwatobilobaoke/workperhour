const express = require('express');
const router = express.Router();

const appUserController = require('../controllers/appUserController');
const authController = require('../controllers/authController');

router.post('/onboard', appUserController.registerAppUser);

router.use(authController.protect);

router.get('/', appUserController.getAllAppUser);
router.get('/:id', appUserController.getAppUser);
router.patch('/update/:id', appUserController.updateAppUser);
router.delete('/:id', appUserController.deleteAppUser);

module.exports = router;