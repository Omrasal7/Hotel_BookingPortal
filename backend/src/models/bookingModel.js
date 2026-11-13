const db = require('../config/db');
const { generateBookingReference } = require('../utils/dateUtils');

/**
 * Checks available room count for a specific hotel and date range.
 */
async function checkAvailability(hotelId, checkInDate, checkOutDate) {
  const [hotel] = await db.query('SELECT total_rooms FROM hotels WHERE id = ?', [hotelId]);
  if (!hotel) {
    return { error: 'Hotel not found' };
  }

  // Count active overlapping bookings
  const countSql = `
    SELECT COUNT(*) as count 
    FROM bookings 
    WHERE hotel_id = ? 
      AND status = 'CONFIRMED'
      AND check_in_date < ? 
      AND check_out_date > ?
  `;
  const [res] = await db.query(countSql, [hotelId, checkOutDate, checkInDate]);
  const bookedCount = parseInt(res ? (res.count || res['COUNT(*)'] || 0) : 0, 10);
  const totalRooms = hotel.total_rooms;
  const availableRooms = Math.max(0, totalRooms - bookedCount);

  return {
    totalRooms,
    bookedCount,
    availableRooms,
    isAvailable: availableRooms > 0
  };
}

/**
 * Creates a new booking in the database.
 */
async function createBooking(data) {
  const bookingReference = generateBookingReference();

  const insertSql = `
    INSERT INTO bookings (
      booking_reference, hotel_id, guest_name, guest_email,
      check_in_date, check_out_date, total_nights,
      base_amount, discount_amount, total_amount, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')
  `;

  const params = [
    bookingReference,
    data.hotel_id,
    data.guest_name,
    data.guest_email,
    data.check_in_date,
    data.check_out_date,
    data.total_nights,
    data.base_amount,
    data.discount_amount,
    data.total_amount
  ];

  const result = await db.query(insertSql, params);
  const newBookingId = result.insertId;

  // Fetch created booking with hotel details
  const fetchSql = `
    SELECT b.*, h.name as hotel_name, h.location as hotel_location, h.room_price_per_night, h.image_url
    FROM bookings b
    JOIN hotels h ON b.hotel_id = h.id
    WHERE b.id = ?
  `;
  const [booking] = await db.query(fetchSql, [newBookingId]);
  return booking;
}

/**
 * Retrieves booking by unique reference code and guest email (case-insensitive email).
 */
async function getBookingByReferenceAndEmail(reference, email) {
  const sql = `
    SELECT b.*, h.name as hotel_name, h.location as hotel_location, h.room_price_per_night, h.image_url, h.description
    FROM bookings b
    JOIN hotels h ON b.hotel_id = h.id
    WHERE UPPER(b.booking_reference) = UPPER(?)
      AND LOWER(b.guest_email) = LOWER(?)
  `;
  const [booking] = await db.query(sql, [reference.trim(), email.trim()]);
  return booking || null;
}

/**
 * Cancels an existing booking and records timestamp.
 */
async function cancelBooking(id) {
  const updateSql = `
    UPDATE bookings 
    SET status = 'CANCELLED', cancelled_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'CONFIRMED'
  `;
  const result = await db.query(updateSql, [id]);
  return result.affectedRows > 0;
}

module.exports = {
  checkAvailability,
  createBooking,
  getBookingByReferenceAndEmail,
  cancelBooking
};

