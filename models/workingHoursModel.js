import mongoose from 'mongoose';

const workingHoursSchema = new mongoose.Schema(
  {
    loggedInTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    loggedOutTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const WorkingHours = mongoose.model('WorkingHour', workingHoursSchema);
export default WorkingHours;
