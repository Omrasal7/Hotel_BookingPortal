const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// GET /api/hotels - Browse & search hotels with optional date availability check
router.get('/', hotelController.getHotels);

// GET /api/hotels/:id - View hotel details and room availability
router.get('/:id', hotelController.getHotelDetails);

module.exports = router;

