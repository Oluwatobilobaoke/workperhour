const { setupMaster } = require('cluster');
const crypto = require('crypto');
const mongoose = require('mongoose');
const AppError = require('../utils/libs/appError');


const appuserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    lowercase: true,
    require: [true, 'Please enter your name!'],
    minlength: 6,
  },
  lastName: {
    type: String,
    lowercase: true,
    require: [true, 'Please enter your name!'],
    minlength: 6,
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


const AppUser = mongoose.model('AppUser', appuserSchema);

module.exports = AppUser;