// Date and Pricing Utilities with Surprise Feature Logic

/**
 * Validates check-in and check-out dates according to hotel booking rules:
 * 1. Valid ISO date format (YYYY-MM-DD).
 * 2. Check-in cannot be in the past (must be today or later).
 * 3. Check-out must be strictly after check-in (at least 1 night).
 */
function validateStayDates(checkInStr, checkOutStr) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!checkInStr || !dateRegex.test(checkInStr)) {
    return { valid: false, error: 'Check-in date must be in YYYY-MM-DD format.' };
  }
  if (!checkOutStr || !dateRegex.test(checkOutStr)) {
    return { valid: false, error: 'Check-out date must be in YYYY-MM-DD format.' };
  }

  const checkIn = new Date(checkInStr + 'T00:00:00');
  const checkOut = new Date(checkOutStr + 'T00:00:00');

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return { valid: false, error: 'Invalid date values provided.' };
  }

  // Today with time zeroed
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkIn < today) {
    return { valid: false, error: 'Check-in date cannot be in the past.' };
  }

  const diffTime = checkOut.getTime() - checkIn.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { valid: false, error: 'Check-out date must be strictly after check-in date (minimum 1 night stay).' };
  }

  return {
    valid: true,
    checkInDate: checkInStr,
    checkOutDate: checkOutStr,
    totalNights: diffDays
  };
}

/**
 * Surprise Feature Calculation:
 * - Dynamic Long-Stay Loyalty Discount: 10% off for stays of 4+ nights
 * - Free Cancellation Cutoff Window (48 hours before check-in)
 * - Transparent price breakdown
 */
function calculateStayPricing(roomPricePerNight, totalNights) {
  const price = parseFloat(roomPricePerNight);
  const baseAmount = Math.round(price * totalNights * 100) / 100;
  
  let discountAmount = 0.00;
  let discountReason = null;

  if (totalNights >= 4) {
    // 10% Thomas Cook Long-Stay Savings
    discountAmount = Math.round(baseAmount * 0.10 * 100) / 100;
    discountReason = '10% Thomas Cook Long-Stay Loyalty Discount (4+ nights)';
  }

  const totalAmount = Math.round((baseAmount - discountAmount) * 100) / 100;

  return {
    pricePerNight: price,
    totalNights,
    baseAmount,
    discountAmount,
    discountReason,
    totalAmount
  };
}

/**
 * Surprise Feature Advisory:
 * Real-time seasonal weather & travel tip for popular destinations
 */
function getDestinationAdvisory(location) {
  const advisories = {
    Goa: {
      climate: 'Tropical & Sunny (28°C - 32°C)',
      recommendation: 'Beachwear, sunscreen & sunglasses recommended. Ideal for water sports and evening beach shacks.',
      flexiCancellationHours: 48
    },
    Jaipur: {
      climate: 'Pleasant & Royal (22°C - 27°C)',
      recommendation: 'Comfortable cottons for day fort visits, light shawl for evening cultural shows.',
      flexiCancellationHours: 48
    },
    Mumbai: {
      climate: 'Warm & Coastal Breeze (27°C - 31°C)',
      recommendation: 'Light breathable clothes. Great for Marine Drive sunset walks and heritage district tours.',
      flexiCancellationHours: 48
    },
    Manali: {
      climate: 'Crisp Mountain Breeze (10°C - 16°C)',
      recommendation: 'Warm jackets and sturdy shoes recommended. Perfect for Solang Valley and hot springs.',
      flexiCancellationHours: 48
    },
    Munnar: {
      climate: 'Cool & Misty (15°C - 21°C)',
      recommendation: 'Light woolens and walking shoes. Ideal for misty tea garden treks and spice plantations.',
      flexiCancellationHours: 48
    },
    Bengaluru: {
      climate: 'Pleasant & Moderate (20°C - 26°C)',
      recommendation: 'Casual smart wear. Great weather year-round for rooftop dining and park strolls.',
      flexiCancellationHours: 48
    }
  };

  return advisories[location] || {
    climate: 'Comfortable & Welcoming',
    recommendation: 'Standard travel essentials recommended.',
    flexiCancellationHours: 48
  };
}

/**
 * Generates an alphanumeric Thomas Cook booking reference
 * Format: TC-HB-<6 digits/letters>
 */
function generateBookingReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TC-HB-${randomPart}`;
}

module.exports = {
  validateStayDates,
  calculateStayPricing,
  getDestinationAdvisory,
  generateBookingReference
};

