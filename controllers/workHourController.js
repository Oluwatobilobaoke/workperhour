const WorkHour =  require('../models/workHoursModel');
const AppUser = require('../models/appUserModel');
const catchAsync = require('../utils/libs/catchAsync');
const AppError = require('../utils/libs/appError');
const moment = require('moment');


exports.clockIn = catchAsync(async (req, res, next) => {

  const { fingerPrintId  } = req.body;

  const fingerCheck = await AppUser.findOne({ appUserFingerPrintId: fingerPrintId }).exec();

  if (!fingerCheck) {
    return next(new AppError('You are not registered', 401));
  }

  // console.log({fingerCheck});

  const userHasActiveSession = await WorkHour.findOne({ appUserFingerPrintId: fingerPrintId, isActive: true }).exec();

  console.log({userHasActiveSession});


  if (userHasActiveSession) return next(new AppError('User still has an active session', 401));

    const name  = `${fingerCheck.firstName} ${fingerCheck.lastName}`; 

    await WorkHour.create({ 
      fullName: name,
      appUserFingerPrintId: fingerCheck.appUserFingerPrintId,
      appuser: fingerCheck._id,
      timeIn: new Date(),
      isActive: true  
    })

    return res.status(200).json({
      status: 'success',
      message: `Welcome, ${fingerCheck.firstName}`,
    });
})

exports.clockOut = catchAsync(async (req, res, next) => {

  let amount;

  const { fingerPrintId  } = req.body;

  const fingerCheck = await AppUser.findOne({ appUserFingerPrintId: fingerPrintId }).exec();

  if (!fingerCheck) {
    return next(new AppError('You are unauthorized', 401));
  }

  const workHourObj  = await WorkHour.findOne({ appuser: fingerCheck._id, isActive: true });
  if (!workHourObj) return next(new AppError('User does not have a session active', 401));


      let outTime = new Date();

      const a = moment(workHourObj.timeIn);
      const b = moment(outTime);

      const minutesWorked = (b.diff(a, 'minutes'));

      console.log({outTime}, {a}, {b}, {minutesWorked});

        if (fingerCheck.appUserType == "student") {
          amount = 0;
        } else {
          const hoursWorked = minutesWorked / 60 ;
          console.log({hoursWorked});
          amount = parseInt(hoursWorked * fingerCheck.ratePerHour);
          console.log(amount);
        }
  

     const reqBody = { 
      timeOut: outTime,
      isActive: false,
      amount: amount
     }

        await WorkHour.findByIdAndUpdate(workHourObj._id, reqBody, {
          new: true,
          runValidators: true,
        });
      

    return res.status(200).json({
      status: 'success',
      message: `GoodBye, ${fingerCheck.firstName}`,
    });
})


exports.getAllWorkHours = catchAsync(async (req, res, next) => {

  const { page, limit} = req.query;

  let workHours = await WorkHour.find()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  // get total documents in the collection 
  const count = await WorkHour.countDocuments();


  if(!workHours) return res.status(200).json({ status: 'success', message: 'No Work Hours'})

  return res.status(200).json({
    status: 'success',
    data: {
      workHours,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    } 
  })
})

exports.getuserWorkHours = catchAsync(async (req, res, next) => {

  const { page, limit} = req.query;
  const { appUserId } = req.body;
  

  let workHours = await WorkHour.find({appuser: appUserId })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
  
    // get total documents in the collection 
  const count = await WorkHour.countDocuments();

  if(!workHours) return res.status(200).json({ status: 'success', message: 'No Work Hours'})

  return res.status(200).json({
    status: 'success',
    data: {
      workHours,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    } 
  })

})


exports.getWorkHour = catchAsync(async (req, res, next) => {

  let query = WorkHour.findById(req.params.id);

  const workHour = await query;

  if (!workHour) {
    return next(new AppError('No Doc with such ID not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      workHour,
    },
  });
});

exports.deleteWorkHour = catchAsync(async (req, res, next) => {
  const doc = await WorkHour.findByIdAndDelete(req.params.id);

  if (!doc)
    return next(new AppError('No Doc with such ID not found', 404));

  res.status(204).json({
    status: 'success',
    message: 'Successfully deleted',
    data: null,
  });
});

exports.updateWorkHour = catchAsync(async (req, res, next) => {
  const workHour = await WorkHour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!workHour) {
    return next(new AppError('No App user with such  work ID found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      workHour,
    },
  });
});

