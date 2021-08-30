const AppUser = require('../models/appUserModel');
const WorkHour =  require('../models/workHoursModel');
const catchAsync = require('../utils/libs/catchAsync');
const AppError = require('../utils/libs/appError');
const sendEmail = require('../utils/libs/email');

exports.registerAppUser = catchAsync(async (req, res, next) => {

  const { faceId } = req.params;
    
    const userExist = await AppUser.findOne({ appUserFingerPrintId: faceId });

    console.log({ userExist});

    // if (userExist) {
    //   return next(new AppError('App user Exists', 400));
    // }
    if (userExist) 
      return res.status(200).json({ status: 'success', message: 'App User Exist , Clocked In'})

    const appUser = await AppUser.create({
      appUserFingerPrintId: faceId,
    });


    // const options = {
    //   email: req.body.email,
    //   subject: 'OnBoarding Successful!',
    //   message: "Welcome to WPH,we're glad to have you 🎉🙏",
    // };

    // await sendEmail(options);

    return res.status(200).json({
      status: 'success',
      message: `Welcome OnBoard`,
      data: {
        appUser
      },
    });
})

exports.getAllAppUser = catchAsync(async (req, res, next) => {

  const { page, limit} = req.query;

  const appUsers = await AppUser.find()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({updatedAt: -1})
    .exec();

  // get total documents in the Posts collection 
  const count = await AppUser.countDocuments();


  if(!appUsers) return res.status(200).json({ status: 'success', message: 'no app us'})

  return res.status(200).json({
    status: 'success',
    data: {
      appUsers,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    } 
  })
})

exports.getAllStudentAppUser = catchAsync(async (req, res, next) => {

  const { page, limit} = req.query;

  const appUsers = await AppUser.find({ appUserType: "student"})
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({updatedAt: -1})
    .exec();

  // get total documents in the Posts collection 
  const count = await AppUser.countDocuments();


  if(!appUsers) return res.status(200).json({ status: 'success', message: 'no app us'})

  return res.status(200).json({
    status: 'success',
    data: {
      appUsers,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    } 
  })
})

exports.getAllWorkerAppUser = catchAsync(async (req, res, next) => {

  const { page, limit} = req.query;

  const appUsers = await AppUser.find({ appUserType: "worker"})
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({updatedAt: -1})
    .exec();

  // get total documents in the Posts collection 
  const count = await AppUser.countDocuments();


  if(!appUsers) return res.status(200).json({ status: 'success', message: 'no app us'})

  return res.status(200).json({
    status: 'success',
    data: {
      appUsers,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    } 
  })
})

exports.getAppUser = catchAsync(async (req, res, next) => {
    let query = AppUser.findById(req.params.id);

    const appUser = await query;

    if (!appUser) {
      return next(new AppError('No App user with such ID not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        appUser,
      },
    });
  });

exports.deleteAppUser = catchAsync(async (req, res, next) => {
    const doc = await AppUser.findByIdAndDelete(req.params.id);

    if (!doc)
      return next(new AppError('No App User with such ID not found', 404));

    res.status(204).json({
      status: 'success',
      message: 'Successfully deleted',
      data: null,
    });
  });

exports.updateAppUser = catchAsync(async (req, res, next) => {
    const appUser = await AppUser.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!appUser) {
      return next(new AppError('No App user with such ID not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        appUser,
      },
    });
  });