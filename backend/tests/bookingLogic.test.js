const {
  validateStayDates,
  calculateStayPricing,
  getDestinationAdvisory,
  generateBookingReference
} = require('../src/utils/dateUtils');

describe('Booking Logic & Pricing Calculation Unit Tests', () => {
  // Helpers for future dates
  const getFutureDate = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  const getPastDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  describe('Date Validation Rules', () => {
    test('TC-VAL-01: Valid future dates should pass validation with correct night count', () => {
      const checkIn = getFutureDate(2);
      const checkOut = getFutureDate(5);
      const result = validateStayDates(checkIn, checkOut);

      expect(result.valid).toBe(true);
      expect(result.totalNights).toBe(3);
      expect(result.checkInDate).toBe(checkIn);
      expect(result.checkOutDate).toBe(checkOut);
    });

    test('TC-VAL-02: Check-in date in the past must be rejected', () => {
      const checkIn = getPastDate(1);
      const checkOut = getFutureDate(2);
      const result = validateStayDates(checkIn, checkOut);

      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/past/i);
    });

    test('TC-VAL-03: Same check-in and check-out date must be rejected (0 nights)', () => {
      const checkIn = getFutureDate(3);
      const checkOut = checkIn;
      const result = validateStayDates(checkIn, checkOut);

      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/strictly after/i);
    });

    test('TC-VAL-04: Check-out before check-in date must be rejected', () => {
      const checkIn = getFutureDate(5);
      const checkOut = getFutureDate(3);
      const result = validateStayDates(checkIn, checkOut);

      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/strictly after/i);
    });

    test('TC-VAL-05: Malformed or missing date strings must fail validation', () => {
      expect(validateStayDates('invalid-date', '2026-12-01').valid).toBe(false);
      expect(validateStayDates(null, '2026-12-01').valid).toBe(false);
      expect(validateStayDates('2026-12-01', '').valid).toBe(false);
    });
  });

  describe('Pricing Engine & Surprise Feature (Long-Stay Loyalty Discount)', () => {
    test('TC-PRC-01: Short stay (1-3 nights) calculates exact base rate with 0 discount', () => {
      const pricePerNight = 4000;
      const nights = 3;
      const pricing = calculateStayPricing(pricePerNight, nights);

      expect(pricing.baseAmount).toBe(12000);
      expect(pricing.discountAmount).toBe(0);
      expect(pricing.discountReason).toBeNull();
      expect(pricing.totalAmount).toBe(12000);
    });

    test('TC-PRC-02: Long stay (4+ nights) applies 10% Thomas Cook loyalty discount', () => {
      const pricePerNight = 3500;
      const nights = 5;
      const pricing = calculateStayPricing(pricePerNight, nights);

      // Base: 5 * 3500 = 17500
      // 10% discount: 1750
      // Total: 15750
      expect(pricing.baseAmount).toBe(17500);
      expect(pricing.discountAmount).toBe(1750);
      expect(pricing.discountReason).toMatch(/10% Thomas Cook Long-Stay/i);
      expect(pricing.totalAmount).toBe(15750);
    });

    test('TC-PRC-03: Boundary value analysis on 4 nights threshold', () => {
      const pricePerNight = 2000;
      const pricing3Nights = calculateStayPricing(pricePerNight, 3);
      const pricing4Nights = calculateStayPricing(pricePerNight, 4);

      expect(pricing3Nights.discountAmount).toBe(0);
      expect(pricing4Nights.discountAmount).toBe(800); // 10% of 8000
      expect(pricing4Nights.totalAmount).toBe(7200);
    });
  });

  describe('Destination Weather Advisory & Booking Reference', () => {
    test('TC-ADV-01: Provides destination climate and packing tips', () => {
      const goaAdvisory = getDestinationAdvisory('Goa');
      expect(goaAdvisory.climate).toContain('Sunny');
      expect(goaAdvisory.flexiCancellationHours).toBe(48);

      const manaliAdvisory = getDestinationAdvisory('Manali');
      expect(manaliAdvisory.climate).toContain('Mountain');
    });

    test('TC-REF-01: Generates unique Thomas Cook format booking reference', () => {
      const ref1 = generateBookingReference();
      const ref2 = generateBookingReference();

      expect(ref1).toMatch(/^TC-HB-[A-Z0-9]{6}$/);
      expect(ref2).toMatch(/^TC-HB-[A-Z0-9]{6}$/);
      expect(ref1).not.toBe(ref2);
    });
  });
});

