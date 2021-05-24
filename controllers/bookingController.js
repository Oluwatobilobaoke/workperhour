const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/libs/catchAsync');
const AppError = require('../utils/libs/appError');
const sendEmail = require('../utils/libs/email');

exports.createBooking = catchAsync(async (req, res, next) => {
    const newBooking = await Booking.create({
      fullName: req.body.fullName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      homeAddress: req.body.homeAddress,
      serviceType: req.body.serviceType,
    });

    const options = {
      email: req.body.email,
      subject: 'Booking Successful!',
      message: "Welcome to COG, we're glad to have you 🎉🙏",
    };

    await sendEmail(options);

    return res.status(200).json({
      status: 'success',
      message: 'You have successfully reserved a spot',
    });
})

exports.getAllBooking = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find();

  if(!bookings) return res.status(200).json({ status: 'success', message: 'no reservations'})

  return res.status(200).json({
    status: 'success',
    bookings
  })
})

exports.getBooking = catchAsync(async (req, res, next) => {
    let query = Booking.findById(req.params.id);

    const doc = await query;

    if (!doc) {
      return next(new AppError('No document with that ID not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.deleteBooking = catchAsync(async (req, res, next) => {
    const doc = await Booking.findByIdAndDelete(req.params.id);

    if (!doc)
      return next(new AppError('No document with that ID not found', 404));

    res.status(204).json({
      status: 'success',
      message: 'Successfully deleted',
      data: null,
    });
  });

exports.updateBooking = catchAsync(async (req, res, next) => {
    const doc = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document with that ID not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });