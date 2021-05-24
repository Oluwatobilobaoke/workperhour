const { setupMaster } = require('cluster');
const crypto = require('crypto');
const mongoose = require('mongoose');
const AppError = require('../utils/libs/appError');


const bookingSchema = new mongoose.Schema({
  fullName: {
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
  phoneNumber: {
    type: String,
    lowercase: true,
    require: [true, 'Please enter your phone number!'],
    minlength: 8,
  },
  homeAddress: {
    type: String,
    lowercase: true,
    require: [true, 'Please enter your Home address!'],
    minlength: 10,
  },
  serviceType: {
    type: String,
    enum: ['sunday-service', 'midweek-service', 'friday-service'],

  }
}, { timestamps: true });


// bookingSchema.pre('save', async function (next) {

//   // If No Seats Available 
//   if (this.seatsAvailable = 0) return AppError('No Space Available for booking', 400);  
//   next();

// });

// bookingSchema.post('save', async function () {
//   // IF seats available
//   if (this.seatsAvailable > 0) return this.seatsAvailable - 1;
// })

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;