const mongoose = require('mongoose');

const workhourSchema = new mongoose.Schema({
  appuser: { 
    type: mongoose.Schema.ObjectId,
    ref: "AppUser" ,
    required: [true, 'Please provide a AppUser ID'],},
  appUserFingerPrintId: {
    type: String,
    require: [true, 'Please enter user finger!'],
  },
  fullName: {
    type: String,
    require: [true, 'Please enter user ID!'],
  },
  timeIn: {
    type: String,
    default:new Date(),
  },
  timeOut: {
    type: String,
  },
  isActive: {
    type: Boolean,
  },
  amount: {
    type: String,
  },
  paymentStatus: {
    type: String,
    default: "pending",
  }
}, { timestamps: true });

const WorkHour = mongoose.model('WorkHour', workhourSchema);

module.exports = WorkHour;