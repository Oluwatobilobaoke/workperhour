const mongoose = require('mongoose');

const workhourSchema = new mongoose.Schema({
  appuser: { type: Schema.Types.ObjectId, ref: "appuser" },
  appUserId: {
    type: String,
    require: [true, 'Please enter user ID!'],
  },
  timeIn: {
      type:String,
      default:new Date(),
  },
  timeOut: {
    type:String,
  },
  status:{ 
    type:String,
    required:true
  },
  amount: {
    type:String,
  },
  paymentStatus: {
    type:String,
  }
}, { timestamps: true });

const WorkHour = mongoose.model('WorkHour', workhourSchema);

module.exports = WorkHour;