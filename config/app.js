import path from 'path';
import express from 'express';
import AppError from '../utils/AppError.js';
import cors from 'cors';
import userRoutes from '../routes/userRoutes.js';
import employeeRoutes from '../routes/employeeRoutes.js';
import attendanceRoutes from '../routes/attendanceRoutes.js';
import leaveRoutes from '../routes/leaveRoutes.js';
import payrollRoutes from '../routes/payrollRoutes.js';
import eventRoutes from '../routes/eventRoutes.js';
import workingHoursRoutes from '../routes/workingHoursRoutes.js';
import customDepartmentRoutes from '../routes/customDepartmentRoutes.js';
import morgan from 'morgan';

const app = express();
app.use(cors());

app.options('*', cors());

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, 'public')));

// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get('/', (req, res) => {
  res.status(200).json(true);
});

console.log("app is running")
app.use('/api/users', userRoutes);
app.use('/api/workingHours', workingHoursRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/customDepartment', customDepartmentRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can not find ${req.originalUrl} on this server`, 404));
});

export default app;
