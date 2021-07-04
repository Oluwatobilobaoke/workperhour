const mongoose = require('mongoose');
const AppError = require('../utils/libs/appError');


const appuserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    lowercase: true,
    require: [true, 'Please enter your name!'],
    minlength: 3,
  },
  lastName: {
    type: String,
    lowercase: true,
    require: [true, 'Please enter your name!'],
    minlength: 3,
  },
  email: {
    type: String,
    lowercase: true,
    require: [true, 'Please enter your email address!'],
    minlength: 8,
  },
  accountType: {
    type: String,
    lowercase: true,
    enum: ['savings', 'current'],
  },
  accountNumber: {
    type: String,
    lowercase: true,
    minlength: 9,
  },
  bankName: {
    type: String,
    lowercase: true,
    minlength: 5,
  },
  status: {
    type: String, 
    default: 'active',
  },
  appUserFingerPrintId: {
    type: String,
    require: [true, 'Please use the fingerprintscanner!'],
  },
  appUserType: {
    type: String,
    enum: ['worker', 'student'],
    require: [true, 'Please select user type!'],
  },
  ratePerHour: {
    type: Number,
  },
}, { timestamps: true });

// Cascade delete work hours when an App user is deleted
appuserSchema.pre('remove', async function (next) {
  console.log(`Work Hours / Attendance are being removed for this user ${this._id}-${this.email}`);
  await this.model('WorkHour').deleteMany({ appuser: this._id });
  next();
});

const AppUser = mongoose.model('AppUser', appuserSchema);

module.exports = AppUser;