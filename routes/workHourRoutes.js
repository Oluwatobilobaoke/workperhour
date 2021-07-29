const express = require('express');
const router = express.Router();

const workHourController = require('../controllers/workHourController');
const authController = require('../controllers/authController');


router.post('/clock-in', workHourController.clockIn);
router.post('/clock-out', workHourController.clockOut);

router.use(authController.protect);

router.get('/', workHourController.getAllWorkHours);
router.get('/user', workHourController.getuserWorkHours);
router.get('/user/:id', workHourController.getWorkHour);
router.patch('/update/:id', workHourController.updateWorkHour);
router.delete('/:id', workHourController.deleteWorkHour);

module.exports = router;
