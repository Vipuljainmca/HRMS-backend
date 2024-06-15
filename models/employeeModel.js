import mongoose from 'mongoose';
import validator from 'validator';

const employeeSchema = new mongoose.Schema({
  personalDetails: {
    candidateName: {
      type: String,
      required: [true, 'Name must be required'],
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
      },
      default: 'male',
    },
    image: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'DOB must be required'],
    },
    originalBirthDay: {
      type: Date,
    },
    martialStatus: {
      type: String,
      enum: ['Single', 'Married'],
      required: [true, 'Martial Status must be required'],
    },
    contactNumber: {
      type: Number,
      minlength: 10,
      maxlength: 10,
      required: [true, 'Contact Number must be required'],
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      },
      required: [true, 'Blood Group must be required'],
    },
    emailAddress: {
      type: String,
      required: [true, 'Email must be required'],
      // unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please enter a valid email address'],
    },
    fathersName: {
      type: String,
      required: [true, 'Father Name must be required'],
    },
    aadharNumber: {
      type: Number,
      minlength: 12,
      maxlength: 12,
      required: [true, 'Aadhar Number must be required'],
    },
    panNumber: {
      type: String,
      required: [true, 'Pan Number must be Required'],
    },
    emergencyContactInformation: {
      name: {
        type: String,
      },
      relationship: {
        type: String,
      },
      phone: {
        type: String,
      },
    },
    presentAddress: {
      type: String,
      required: true,
    },
    permanentAddress: {
      type: String,
      required: true,
    },
  },

  officialDetails: {
    employeeId: {
      type: String,
      required: [true, 'EmployeeId must be required'],
    },
    idCardExpirationDate: {
      type: Date,
      required: [true, 'ID Card Expiration Date must be required'],
    },
    designation: {
      type: String,
      required: [true, 'designation must be required'],
    },
    department: {
      type: String,
      required: [true, 'department must be required'],
    },
    grade: {
      type: String,
      required: [true, 'grade must be required'],
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining Date must be required'],
    },
    grossSalary: {
      type: Number,
      required: [true, 'Gross Salary must be required'],
    },
    officialEmailAddress: {
      type: String,
      lowercase: true,
      validate: [validator.isEmail, 'Please enter a valid email address'],
    },
    officialNumber: {
      type: Number,
      minlength: 10,
      maxlength: 10,
    },
    primaryReporting: {
      type: String,
    },
    secondaryReporting: {
      type: String,
    },
    lastDayOfWorking: {
      type: Date,
    },
    activeEmployee: {
      type: Boolean,
      default: true,
    },
  },
  bankDetails: {
    bankName: {
      type: String,
      required: [true, 'Bank Name must be required'],
    },
    accountNumber: {
      type: String,
      required: [true, 'Account Number must be required'],
    },
    ifscCode: {
      type: String,
      required: [true, 'IFSC Code must be required'],
    },
  },

  leavesDetails: {
    leaveBalance: {
      type: Number,
      default: 0,
    },
    casualLeave: {
      type: Number,
      default: 0,
    },
    sickLeave: {
      type: Number,
      default: 0,
    },
    earnedLeave: {
      type: Number,
      default: 0,
    },
    maternityLeave: {
      type: Number,
      default: 0,
    },
    paternityLeave: {
      type: Number,
      default: 0,
    },
    beareavementLeave: {
      type: Number,
      default: 0,
    },
  },
  documentStatus: {
    aadharCard: {
      type: String,
    },
    panCard: {
      type: String,
    },

    tenthMarksheetCertificate: {
      type: String,
    },
    tweleveMarksheetCertificate: {
      type: String,
    },
    graduationMarksheetCertificate: {
      type: String,
    },
    mastersMarksheetCertificate: {
      type: String,
    },
    relievingLetter: {
      type: String,
    },
    experienceLetter: {
      type: String,
    },
    salarySlip: {
      type: String,
    },
    photo: {
      type: String,
    },
    policyAcknowledgement: {
      type: Boolean,
    },
    idType: {
      type: String,
      enum: ['Permanent', 'Temporary', 'Contractual'],
      default: 'Permanent',
    },
    idStatus: {
      type: String,
      enum: ['Assigned', 'NotAssigned', 'Expired', 'Cancelled'],
      default: 'Assigned',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

employeeSchema.pre('save', function (next) {
  const {
    casualLeave,
    sickLeave,
    earnedLeave,
    paternityLeave,
    maternityLeave,
    beareavementLeave,
  } = this.leavesDetails;

  const sum =
    casualLeave +
    sickLeave +
    earnedLeave +
    paternityLeave +
    maternityLeave +
    beareavementLeave;

  this.leavesDetails.leaveBalance = sum;

  next();
});
const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
