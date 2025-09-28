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
const subscriptionRoutes = require('./routes/subscriptionRoutes'); // Import subscription routes
const settingsRoutes = require('./routes/settingsRoutes'); // Import settings routes
const serviceProfileRoutes = require('./routes/serviceProfileRoutes'); // Import service profile routes

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'https://skilled-link-lund.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' })); // Increased limit to 50mb
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Add URL encoding support

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

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
app.use('/api/subscription', subscriptionRoutes); // Use subscription routes
app.use('/api/settings', settingsRoutes); // Use settings routes
app.use('/api/service-profiles', serviceProfileRoutes); // Use service profile routes
app.use('/api/service-profile-bookings', require('./routes/serviceProfileBookingRoutes')); // Use service profile booking routes

// Error Handler
app.use(errorHandler);

module.exports = app;