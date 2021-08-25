const express = require('express');
const router = express.Router();

const workHourController = require('../controllers/workHourController');
const authController = require('../controllers/authController');


router.post('/clock-in/:faceId', workHourController.clockIn);
router.post('/clock-out/:faceId', workHourController.clockOut);

router.get('/', authController.protect, workHourController.getAllWorkHours);
router.get('/user/:appUserId', authController.protect, workHourController.getuserWorkHours);
router.get('/user/:id', authController.protect, workHourController.getWorkHour);
router.patch('/update/:id', authController.protect, workHourController.updateWorkHour);
router.delete('/:id', authController.protect, workHourController.deleteWorkHour);

module.exports = router;
