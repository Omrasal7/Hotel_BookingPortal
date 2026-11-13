const hotelModel = require('../models/hotelModel');
const { validateStayDates } = require('../utils/dateUtils');

async function getHotels(req, res) {
  try {
    const { location, checkInDate, checkOutDate } = req.query;

    if (checkInDate || checkOutDate) {
      const validation = validateStayDates(checkInDate, checkOutDate);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }
    }

    const hotels = await hotelModel.getAllHotels({
      location,
      checkInDate,
      checkOutDate
    });

    return res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching hotels.'
    });
  }
}

async function getHotelDetails(req, res) {
  try {
    const { id } = req.params;
    const { checkInDate, checkOutDate } = req.query;

    if (checkInDate || checkOutDate) {
      const validation = validateStayDates(checkInDate, checkOutDate);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }
    }

    const hotel = await hotelModel.getHotelById(id, checkInDate, checkOutDate);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `Hotel with ID ${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching hotel details.'
    });
  }
}

module.exports = {
  getHotels,
  getHotelDetails
};

