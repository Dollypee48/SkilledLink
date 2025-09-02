const express = require('express');
const cors = require('cors');
const errorHandler = require('./utils/errorHandler');
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const artisanRoutes = require('./routes/artisanRoutes'); // Corrected to match file name
const bookingsRoutes = require('./routes/bookingsRoutes');
// const paymentsRoutes = require('./routes/paymentsRoutes');
const messageRoutes = require('./routes/messageRoutes'); // Uncommented and corrected import
const reviewRoutes = require('./routes/reviewRoutes');
const issueRoutes = require('./routes/issueRoutes'); // Import new issue routes
const reportRoutes = require('./routes/reportRoutes'); // Uncommented new report routes
const adminRoutes = require('./routes/adminRoutes');
const kycRoutes = require('./routes/kycRoutes'); // New: Import KYC routes
const notificationRoutes = require('./routes/notificationRoutes'); // Import notification routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit to 50mb

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/bookings', bookingsRoutes);
// app.use('/api/payments', paymentsRoutes);
app.use('/api/messages', messageRoutes); // New: Use Message routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/issues', issueRoutes); // Use new issue routes
app.use('/api/reports', reportRoutes); // Uncommented new report routes
app.use('/api/admin', adminRoutes);
app.use('/api/kyc', kycRoutes); // New: Use KYC routes
app.use('/api/notifications', notificationRoutes); // Use notification routes

// Error Handler
app.use(errorHandler);

module.exports = app;