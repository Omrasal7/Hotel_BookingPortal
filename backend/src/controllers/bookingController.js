const bookingModel = require('../models/bookingModel');
const hotelModel = require('../models/hotelModel');
const { validateStayDates, calculateStayPricing } = require('../utils/dateUtils');

/**
 * Endpoint to preview pricing and availability quote before confirming
 */
async function getBookingQuote(req, res) {
  try {
    const { hotel_id, check_in_date, check_out_date } = req.body;

    if (!hotel_id) {
      return res.status(400).json({ success: false, message: 'hotel_id is required.' });
    }

    const validation = validateStayDates(check_in_date, check_out_date);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    const hotel = await hotelModel.getHotelById(hotel_id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    const availability = await bookingModel.checkAvailability(hotel_id, check_in_date, check_out_date);
    const pricing = calculateStayPricing(hotel.room_price_per_night, validation.totalNights);

    return res.status(200).json({
      success: true,
      data: {
        hotel_id: hotel.id,
        hotel_name: hotel.name,
        location: hotel.location,
        check_in_date,
        check_out_date,
        ...pricing,
        ...availability
      }
    });
  } catch (error) {
    console.error('Error generating quote:', error);
    return res.status(500).json({ success: false, message: 'Internal server error generating quote.' });
  }
}

/**
 * Creates and confirms a new booking
 */
async function createBooking(req, res) {
  try {
    const { hotel_id, guest_name, guest_email, check_in_date, check_out_date } = req.body;

    const errors = [];
    if (!hotel_id) errors.push('hotel_id is required');
    if (!guest_name || guest_name.trim().length < 2) errors.push('guest_name must be at least 2 characters');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!guest_email || !emailRegex.test(guest_email.trim())) {
      errors.push('A valid guest_email address is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Validate stay dates
    const dateValidation = validateStayDates(check_in_date, check_out_date);
    if (!dateValidation.valid) {
      return res.status(400).json({
        success: false,
        message: dateValidation.error
      });
    }

    // Verify hotel existence
    const hotel = await hotelModel.getHotelById(hotel_id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `Hotel with ID ${hotel_id} not found.`
      });
    }

    // Availability verification (Prevent overbooking beyond capacity)
    const availability = await bookingModel.checkAvailability(hotel_id, check_in_date, check_out_date);
    if (availability.availableRooms <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No rooms available for the selected hotel and dates. All rooms are booked.'
      });
    }

    // Backend price calculation (security best practice: compute server-side)
    const pricing = calculateStayPricing(hotel.room_price_per_night, dateValidation.totalNights);

    const newBooking = await bookingModel.createBooking({
      hotel_id,
      guest_name: guest_name.trim(),
      guest_email: guest_email.trim().toLowerCase(),
      check_in_date,
      check_out_date,
      total_nights: dateValidation.totalNights,
      base_amount: pricing.baseAmount,
      discount_amount: pricing.discountAmount,
      total_amount: pricing.totalAmount
    });

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: newBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing booking.'
    });
  }
}

/**
 * Retrieve booking using reference and email
 */
async function retrieveBooking(req, res) {
  try {
    const { booking_reference, guest_email } = req.body;

    if (!booking_reference || !guest_email) {
      return res.status(400).json({
        success: false,
        message: 'Both booking_reference and guest_email are required to retrieve a booking.'
      });
    }

    const booking = await bookingModel.getBookingByReferenceAndEmail(
      booking_reference.trim(),
      guest_email.trim()
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'No matching booking found. Please verify your reference number and email.'
      });
    }

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error retrieving booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving booking.'
    });
  }
}

/**
 * Cancel an existing booking and release room availability
 */
async function cancelBooking(req, res) {
  try {
    const { id } = req.params;
    const { guest_email, booking_reference } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Booking ID is required.' });
    }

    // Verify booking
    let booking = null;
    if (booking_reference && guest_email) {
      booking = await bookingModel.getBookingByReferenceAndEmail(booking_reference, guest_email);
    } else {
      const [b] = await require('../config/db').query('SELECT * FROM bookings WHERE id = ?', [id]);
      booking = b;
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled.'
      });
    }

    const cancelled = await bookingModel.cancelBooking(booking.id);
    if (!cancelled) {
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel booking.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Reserved room capacity has been released.',
      data: {
        id: booking.id,
        booking_reference: booking.booking_reference,
        status: 'CANCELLED',
        cancelled_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while cancelling booking.'
    });
  }
}

module.exports = {
  getBookingQuote,
  createBooking,
  retrieveBooking,
  cancelBooking
};

