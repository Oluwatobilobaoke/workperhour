const AppUser = require('../models/appUserModel');
const catchAsync = require('../utils/libs/catchAsync');
const AppError = require('../utils/libs/appError');
const sendEmail = require('../utils/libs/email');

exports.registerAppUser = catchAsync(async (req, res, next) => {
    const newAppUser = await AppUser.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      accountType: req.body.accountType,
      accountNumber: req.body.accountNumber,
      bankName: req.body.bankName,
      appUserFingerPrintId: req.body.appUserFingerPrintId,
      appUserType: req.body.appUserType,
      ratePerHour: req.body.ratePerHour,
    });

    const options = {
      email: req.body.email,
      subject: 'OnBoarding Successful!',
      message: "Welcome to WPH,we're glad to have you 🎉🙏",
    };

    await sendEmail(options);

    return res.status(200).json({
      status: 'success',
      message: `You have successfully placed ${req.body.email} onboard`,
    });
})

exports.getAllAppUser = catchAsync(async (req, res, next) => {
  const appusers = await AppUser.find();

  if(!appusers) return res.status(200).json({ status: 'success', message: 'no app us'})

  return res.status(200).json({
    status: 'success',
    appusers
  })
})

exports.getAppUser = catchAsync(async (req, res, next) => {
    let query = AppUser.findById(req.params.id);

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

exports.deleteAppUser = catchAsync(async (req, res, next) => {
    const doc = await AppUser.findByIdAndDelete(req.params.id);

    if (!doc)
      return next(new AppError('No document with that ID not found', 404));

    res.status(204).json({
      status: 'success',
      message: 'Successfully deleted',
      data: null,
    });
  });

exports.updateAppUser = catchAsync(async (req, res, next) => {
    const doc = await AppUser.findByIdAndUpdate(req.params.id, req.body, {
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