const express = require('express');
const cors = require('cors');
const errorHandler = require('./utils/errorHandler');
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const artisanRoutes = require('./routes/artisanRoutes'); // Corrected to match file name
const bookingsRoutes = require('./routes/bookingsRoutes');
// const paymentsRoutes = require('./routes/paymentsRoutes');
// const messagesRoutes = require('./routes/messagesRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const issueRoutes = require('./routes/issueRoutes'); // Import new issue routes
// const reportRoutes = require('./routes/reportRoutes'); // Comment out old report routes
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/bookings', bookingsRoutes);
// app.use('/api/payments', paymentsRoutes);
// app.use('/api/messages', messagesRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/issues', issueRoutes); // Use new issue routes
// app.use('/api/reports', reportRoutes); // Comment out old report routes
app.use('/api/admin', adminRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;