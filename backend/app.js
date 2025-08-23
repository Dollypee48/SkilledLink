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
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/bookings', bookingsRoutes);
// app.use('/api/payments', paymentsRoutes);
// app.use('/api/messages', messagesRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;