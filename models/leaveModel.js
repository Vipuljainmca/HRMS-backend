import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['sick-leave', 'casual-leave', 'earned-leave', 'vacation'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    leaveBalance: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reason: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true } }
);

// Define a virtual field to calculate the duration of the leave
leaveSchema.virtual('duration').get(function () {
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  const endDate = new Date(this.endDate);
  const startDate = new Date(this.startDate);

  // Calculate days without adding 1
  const days = Math.floor((endDate - startDate) / millisecondsInDay);

  return days;
});

// leaveSchema.pre('save', async function (next) {
//   try {
//     const employee = await mongoose.model('Employee').findById(this.employeeId);

//     if (employee) {
//       // Update leave balance based on the leave type and duration
//       const daysTaken = this.duration;

//       if (this.leaveType === 'sick-leave') {
//         employee.leavesDetails.leaveBalance -= daysTaken;
//         employee.leavesDetails.sickLeave -= daysTaken;
//       } else if (this.leaveType === 'casual-leave') {
//         // Adjust this according to your leave balance calculation logic
//         employee.leavesDetails.leaveBalance -= daysTaken;
//         employee.leavesDetails.casualLeave -= daysTaken;
//       } else if (this.leaveType === 'earned-leave') {
//         // Adjust this according to your leave balance calculation logic
//         employee.leavesDetails.earnedLeave -= daysTaken;
//         employee.leavesDetails.leaveBalance -= daysTaken;
//       }

//       // Save the updated employee leave balance
//       await employee.save();
//     }

//     next();
//   } catch (error) {
//     next(error);
//   }
// });

const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;
