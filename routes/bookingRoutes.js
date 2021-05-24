const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');


router.post('/create', bookingController.createBooking);

router.use(authController.protect);

router.get('/', bookingController.getAllBooking);
router.get('/:id', bookingController.getBooking);
router.patch('/update/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;