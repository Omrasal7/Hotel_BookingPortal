const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// POST /api/bookings/quote - Pricing and availability calculation preview
router.post('/quote', bookingController.getBookingQuote);

// POST /api/bookings - Book one room with dates, name, email
router.post('/', bookingController.createBooking);

// POST /api/bookings/retrieve - Retrieve booking using reference and email
router.post('/retrieve', bookingController.retrieveBooking);

// POST /api/bookings/:id/cancel - Cancel booking and release availability
router.post('/:id/cancel', bookingController.cancelBooking);

module.exports = router;

