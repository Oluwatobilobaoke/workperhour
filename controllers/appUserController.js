const AppUser = require('../models/appUserModel');
const WorkHour =  require('../models/workHoursModel');
const catchAsync = require('../utils/libs/catchAsync');
const AppError = require('../utils/libs/appError');
const sendEmail = require('../utils/libs/email');
const moment = require('moment');


exports.registerAppUser = catchAsync(async (req, res, next) => {

  const { faceId } = req.params;
    
    const fingerCheck = await AppUser.findOne({ appUserFingerPrintId: faceId });

    if (fingerCheck.status === 'suspended') {
      return next(new AppError('User  suspended', 400));
    }

    console.log({ fingerCheck});

    if (fingerCheck) {
      // if user exists check if there is an active session if yes, clock them out, else clock in
      const userHasActiveSession = await WorkHour.findOne({ appUserFingerPrintId: faceId, isActive: true }).exec();

      console.log({userHasActiveSession});

      if (userHasActiveSession) { 
        // clock out
        let outTime = new Date();

        const a = moment(userHasActiveSession.timeIn);
        const b = moment(outTime);

        const minutesWorked = (b.diff(a, 'minutes'));

        console.log({outTime}, {a}, {b}, {minutesWorked});

        if (fingerCheck.appUserType == "student") {
          amount = 0;
        } else {
          const hoursWorked = minutesWorked / 60 ;
          console.log({hoursWorked});
          amount = parseInt(hoursWorked * fingerCheck.ratePerHour) || 3000;
          console.log(amount);
        }
  

          const reqBody = { 
            timeOut: outTime,
            isActive: false,
            amount: amount
          }

          const updateClockOut = await WorkHour.findByIdAndUpdate(userHasActiveSession._id, reqBody, {
            new: true,
            runValidators: true,
          });
          
          if (!updateClockOut) {
            return next(new AppError('Could not clock Out user', 500));
          }


          return res.status(200).json({
            status: 'success',
            message: `User has been clocked out successfully`,
          });

      } 

      // if user has no active session, clock them in
      const name  = `${fingerCheck.firstName} ${fingerCheck.lastName}`; 

      const clockedInUser = await WorkHour.create({ 
        fullName: name,
        appUserFingerPrintId: fingerCheck.appUserFingerPrintId,
        appuser: fingerCheck._id,
        timeIn: new Date(),
        isActive: true  
      })

      console.log({clockedInUser});


      if (!clockedInUser) {
        return next(new AppError('Could not clock in user, Update User Information', 500));
      }
  
      return res.status(200).json({
        status: 'success',
        message: `User Clocked In Successfully`,
      });

    }
  
    const appUser = await AppUser.create({
      appUserFingerPrintId: faceId,
    });

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