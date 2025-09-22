const express = require('express');
const router = express.Router();
const serviceProfileBookingController = require('../controllers/serviceProfileBookingController');
const auth = require('../middleware/auth');

// Create a new service profile booking
router.post('/', auth, serviceProfileBookingController.createServiceProfileBooking);

// Get all service profile bookings for the logged-in customer
router.get('/my', auth, serviceProfileBookingController.getMyServiceProfileBookings);

// Get all service profile bookings for the logged-in artisan
router.get('/artisan', auth, serviceProfileBookingController.getArtisanServiceProfileBookings);

// Get single service profile booking by ID
router.get('/:id', auth, serviceProfileBookingController.getServiceProfileBookingById);

// Update service profile booking status
router.put('/:id/status', auth, serviceProfileBookingController.updateServiceProfileBookingStatus);

// Delete service profile booking
router.delete('/:id', auth, serviceProfileBookingController.deleteServiceProfileBooking);

module.exports = router;
