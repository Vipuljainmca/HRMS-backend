import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name'],
  },
  email: {
    type: String,
    required: [true, 'Email must be required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password must  be required'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,

    required: [true, 'Password confirm your password'],
    validate: {
      // This works only CREATE And SAVE USER
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not same!',
    },
  },
  role: {
    type: String,
    enum: {
      values: ['employee', 'humanResource', 'manager', 'admin'],
    },
    default: 'employee',
  },
});

userSchema.pre('save', async function (next) {
  // Only run this function if password is actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the password Confirm field

  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

export default User;
