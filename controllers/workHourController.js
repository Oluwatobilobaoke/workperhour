const WorkHour =  require('../models/workHoursModel');
const AppUser = require('../models/appUserModel');
const catchAsync = require('../utils/libs/catchAsync');
const AppError = require('../utils/libs/appError');


exports.clockIn = catchAsync(async (req, res, next) => {

  const { fingerPrintId,  } = req.body;

  const fingerCheck = AppUser.findOne({ appUserFingerPrintId: fingerPrintId }).exec();

  if (!fingerCheck) {
    return next(new AppError('You are unauthorized', 401));
  }

  const userCheck  = await AppUser.findById(fingerCheck._id);
  if (!userCheck) return next(new AppError('Invalid User', 401));

    const name  = `${fingerCheck.firstName} ${fingerCheck.lastName}`; 

    await WorkHour.create({ 
      fullName: name,
      appUserFingerPrintId: fingerCheck,
      appuser: fingerCheck._id,
      timeIn: new Date(),
      status: 'active',
      isActive: true  
    })

    return res.status(200).json({
      status: 'success',
      message: `Welcome, ${userCheck.firstName}`,
    });
})

exports.clockOut = catchAsync(async (req, res, next) => {

  let amount;

  const { fingerPrintId  } = req.body;

  const fingerCheck = AppUser.findOne({ appUserFingerPrintId: fingerPrintId }).exec();

  if (!fingerCheck) {
    return next(new AppError('You are unauthorized', 401));
  }

  const workHourObj  = await WorkHour.findOne({ appuser: fingerCheck._id });
  if (!userCheck) return next(new AppError('Invalid User', 401));

  const query = { appuser: fingerCheck._id, isActive: true }

      let outTime = new Date();

      const a = moment(workHourObj.timeIn);
      const b = moment(outTime);

      const hoursWorked = (b.diff(a, 'hours'));

        if (fingerCheck.appUserType == "student") {
          amount = 0;
        } else {
          amount = parseInt(hoursWorked * fingerCheck.ratePerHour);
        }
  

      WorkHour.findOneAndUpdate(
        query, 
        { 
          timeOut: outTime,
          isActive: false,
          amount: amount
        })
      

    return res.status(200).json({
      status: 'success',
      message: `GoodBye, ${userCheck.firstName}`,
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

  if (!appUser) {
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
  const workHour = await AppUser.findByIdAndUpdate(req.params.id, req.body, {
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

