import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Employee',
    required: true,
  },
  loggedInTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  loggedOutTime: {
    type: Date,
    default: null,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: [
      'present',
      'absent',
      'halfday',
      'workFromHome',
      'sickLeave',
      'paidLeave',
      'earnedLeave',
      'holiday',
    ],
    required: true,
  },
});
// Define a virtual getter for formatted date
attendanceSchema.virtual('formattedDate').get(function () {
  return this.date.toISOString().split('T')[0];
});
attendanceSchema.virtual('formattedLoginTime').get(function () {
  return this.loggedInTime
    ? this.loggedInTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      })
    : null;
});

attendanceSchema.virtual('formattedLogoutTime').get(function () {
  return this.loggedOutTime
    ? this.loggedOutTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      })
    : null;
});

attendanceSchema.pre('save', function (next) {
  if (
    this.status === 'absent' ||
    this.status === 'sickLeave' ||
    this.status === 'paidLeave' ||
    this.status === 'earnedLeave' ||
    this.status === 'holiday'
  ) {
    this.loggedInTime = null;
    this.loggedOutTime = null;
  }
  next();
});
attendanceSchema.pre('save', function (next) {
  if (this.status === 'halfday') {
    // Get the current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    // Set loggedInTime for the first half of the day (9:30 AM)
    const firstHalfLoggedInTime = new Date(
      currentYear,
      currentMonth,
      currentDay,
      9,
      30,
      0
    );
    // Set loggedOutTime for the first half of the day (1:30 PM)
    const firstHalfLoggedOutTime = new Date(
      currentYear,
      currentMonth,
      currentDay,
      13,
      30,
      0
    );

    // Set loggedInTime for the second half of the day (2:30 PM)
    const secondHalfLoggedInTime = new Date(
      currentYear,
      currentMonth,
      currentDay,
      14,
      30,
      0
    );
    // Set loggedOutTime for the second half of the day (6:30 PM)
    const secondHalfLoggedOutTime = new Date(
      currentYear,
      currentMonth,
      currentDay,
      18,
      30,
      0
    );

    // Check the current time and set loggedInTime and loggedOutTime accordingly
    const currentHour = currentDate.getHours();
    if (currentHour < 13) {
      this.loggedInTime = firstHalfLoggedInTime;
      this.loggedOutTime = firstHalfLoggedOutTime;
    } else {
      this.loggedInTime = secondHalfLoggedInTime;
      this.loggedOutTime = secondHalfLoggedOutTime;
    }
  }
  next();
});

// Ensure the virtual is included when converting to JSON
attendanceSchema.set('toJSON', { virtuals: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
