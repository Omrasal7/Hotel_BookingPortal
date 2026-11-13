const db = require('../config/db');
const { getDestinationAdvisory } = require('../utils/dateUtils');

/**
 * Returns all hotels, optionally filtered by location and date availability.
 */
async function getAllHotels({ location, checkInDate, checkOutDate } = {}) {
  let sql = 'SELECT * FROM hotels WHERE 1=1';
  const params = [];

  if (location && location.trim() !== '') {
    sql += ' AND LOWER(location) LIKE LOWER(?)';
    params.push(`%${location.trim()}%`);
  }

  sql += ' ORDER BY rating DESC, name ASC';
  const hotels = await db.query(sql, params);

  // If dates are provided, calculate availability for each hotel
  const results = await Promise.all(
    hotels.map(async (hotel) => {
      const parsedAmenities = typeof hotel.amenities === 'string'
        ? JSON.parse(hotel.amenities)
        : hotel.amenities;

      let availableRooms = hotel.total_rooms;
      let bookedCount = 0;

      if (checkInDate && checkOutDate) {
        // Count confirmed bookings that overlap with requested stay
        // Overlap condition: existing.check_in < requested.checkOut AND existing.check_out > requested.checkIn
        const overlapSql = `
          SELECT COUNT(*) as count 
          FROM bookings 
          WHERE hotel_id = ? 
            AND status = 'CONFIRMED'
            AND check_in_date < ? 
            AND check_out_date > ?
        `;
        const [overlapRes] = await db.query(overlapSql, [hotel.id, checkOutDate, checkInDate]);
        bookedCount = parseInt(overlapRes ? (overlapRes.count || overlapRes['COUNT(*)'] || 0) : 0, 10);
        availableRooms = Math.max(0, hotel.total_rooms - bookedCount);
      }

      return {
        ...hotel,
        amenities: parsedAmenities,
        booked_rooms: bookedCount,
        available_rooms: availableRooms,
        is_available: availableRooms > 0,
        advisory: getDestinationAdvisory(hotel.location)
      };
    })
  );

  return results;
}

/**
 * Returns single hotel details with room availability for given dates.
 */
async function getHotelById(id, checkInDate = null, checkOutDate = null) {
  const hotels = await db.query('SELECT * FROM hotels WHERE id = ?', [id]);
  if (!hotels || hotels.length === 0) {
    return null;
  }

  const hotel = hotels[0];
  const parsedAmenities = typeof hotel.amenities === 'string'
    ? JSON.parse(hotel.amenities)
    : hotel.amenities;

  let availableRooms = hotel.total_rooms;
  let bookedCount = 0;

  if (checkInDate && checkOutDate) {
    const overlapSql = `
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE hotel_id = ? 
        AND status = 'CONFIRMED'
        AND check_in_date < ? 
        AND check_out_date > ?
    `;
    const [overlapRes] = await db.query(overlapSql, [hotel.id, checkOutDate, checkInDate]);
    bookedCount = parseInt(overlapRes ? (overlapRes.count || overlapRes['COUNT(*)'] || 0) : 0, 10);
    availableRooms = Math.max(0, hotel.total_rooms - bookedCount);
  }

  return {
    ...hotel,
    amenities: parsedAmenities,
    booked_rooms: bookedCount,
    available_rooms: availableRooms,
    is_available: availableRooms > 0,
    advisory: getDestinationAdvisory(hotel.location)
  };
}

module.exports = {
  getAllHotels,
  getHotelById
};

