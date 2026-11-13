const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

describe('Thomas Cook Hotel Booking REST API - Automated Integration Suite', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await db.initDatabase();
  });

  afterAll(async () => {
    await db.close();
  });

  const getFutureDate = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  describe('1. System Healthcheck & Hotel Browsing API', () => {
    test('TC-API-01: GET /api/health should return UP status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
    });

    test('TC-API-02: GET /api/hotels should return at least 5 hotels with details and amenities', async () => {
      const res = await request(app).get('/api/hotels');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);

      const firstHotel = res.body.data[0];
      expect(firstHotel).toHaveProperty('id');
      expect(firstHotel).toHaveProperty('name');
      expect(firstHotel).toHaveProperty('location');
      expect(firstHotel).toHaveProperty('room_price_per_night');
      expect(firstHotel).toHaveProperty('amenities');
      expect(Array.isArray(firstHotel.amenities)).toBe(true);
      expect(firstHotel).toHaveProperty('advisory');
    });

    test('TC-API-03: GET /api/hotels?location=Goa should filter hotels by destination', async () => {
      const res = await request(app).get('/api/hotels?location=Goa');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((hotel) => {
        expect(hotel.location.toLowerCase()).toContain('goa');
      });
    });

    test('TC-API-04: GET /api/hotels with date parameters should compute room availability', async () => {
      const checkIn = getFutureDate(7);
      const checkOut = getFutureDate(10);
      const res = await request(app).get(`/api/hotels?checkInDate=${checkIn}&checkOutDate=${checkOut}`);

      expect(res.status).toBe(200);
      const hotel = res.body.data[0];
      expect(hotel).toHaveProperty('available_rooms');
      expect(hotel.available_rooms).toBeGreaterThanOrEqual(0);
      expect(hotel).toHaveProperty('is_available');
    });
  });

  describe('2. Booking Creation & Server-side Validation', () => {
    let createdBooking = null;

    test('TC-API-05: POST /api/bookings with valid data should confirm booking and return reference', async () => {
      const checkIn = getFutureDate(10);
      const checkOut = getFutureDate(13); // 3 nights
      const payload = {
        hotel_id: 1,
        guest_name: 'Rahul Sharma',
        guest_email: 'rahul.sharma@example.com',
        check_in_date: checkIn,
        check_out_date: checkOut
      };

      const res = await request(app).post('/api/bookings').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('booking_reference');
      expect(res.body.data.booking_reference).toMatch(/^TC-HB-/);
      expect(res.body.data.guest_name).toBe('Rahul Sharma');
      expect(res.body.data.total_nights).toBe(3);
      expect(res.body.data.status).toBe('CONFIRMED');

      createdBooking = res.body.data;
    });

    test('TC-API-06: POST /api/bookings with long stay (5 nights) applies surprise loyalty discount', async () => {
      const checkIn = getFutureDate(20);
      const checkOut = getFutureDate(25); // 5 nights
      const payload = {
        hotel_id: 2,
        guest_name: 'Ananya Desai',
        guest_email: 'ananya.desai@example.com',
        check_in_date: checkIn,
        check_out_date: checkOut
      };

      const res = await request(app).post('/api/bookings').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data.total_nights).toBe(5);
      expect(parseFloat(res.body.data.discount_amount)).toBeGreaterThan(0);
      expect(parseFloat(res.body.data.total_amount)).toBe(
        parseFloat(res.body.data.base_amount) - parseFloat(res.body.data.discount_amount)
      );
    });

    test('TC-API-07: POST /api/bookings should reject past check-in dates (400 Bad Request)', async () => {
      const pastDate = '2020-01-01';
      const checkOut = '2020-01-05';
      const payload = {
        hotel_id: 1,
        guest_name: 'Tester',
        guest_email: 'test@example.com',
        check_in_date: pastDate,
        check_out_date: checkOut
      };

      const res = await request(app).post('/api/bookings').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/past/i);
    });

    test('TC-API-08: POST /api/bookings should reject check-out before check-in (400 Bad Request)', async () => {
      const payload = {
        hotel_id: 1,
        guest_name: 'Tester',
        guest_email: 'test@example.com',
        check_in_date: getFutureDate(5),
        check_out_date: getFutureDate(3)
      };

      const res = await request(app).post('/api/bookings').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('TC-API-09: POST /api/bookings should reject invalid email format (400 Bad Request)', async () => {
      const payload = {
        hotel_id: 1,
        guest_name: 'Tester',
        guest_email: 'not-an-email',
        check_in_date: getFutureDate(5),
        check_out_date: getFutureDate(7)
      };

      const res = await request(app).post('/api/bookings').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Booking Retrieval & Cancellation Flow', () => {
    let bookingToTest = null;

    beforeAll(async () => {
      const checkIn = getFutureDate(15);
      const checkOut = getFutureDate(18);
      const res = await request(app).post('/api/bookings').send({
        hotel_id: 3,
        guest_name: 'Vikram Mehta',
        guest_email: 'vikram.mehta@example.com',
        check_in_date: checkIn,
        check_out_date: checkOut
      });
      bookingToTest = res.body.data;
    });

    test('TC-API-10: POST /api/bookings/retrieve finds booking by reference and email', async () => {
      const res = await request(app).post('/api/bookings/retrieve').send({
        booking_reference: bookingToTest.booking_reference,
        guest_email: bookingToTest.guest_email
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(bookingToTest.id);
      expect(res.body.data.booking_reference).toBe(bookingToTest.booking_reference);
    });

    test('TC-API-11: POST /api/bookings/retrieve with wrong email returns 404', async () => {
      const res = await request(app).post('/api/bookings/retrieve').send({
        booking_reference: bookingToTest.booking_reference,
        guest_email: 'wrong.email@example.com'
      });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('TC-API-12: POST /api/bookings/:id/cancel cancels confirmed booking and marks status CANCELLED', async () => {
      const res = await request(app)
        .post(`/api/bookings/${bookingToTest.id}/cancel`)
        .send({
          booking_reference: bookingToTest.booking_reference,
          guest_email: bookingToTest.guest_email
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CANCELLED');

      // Attempting to cancel again should fail
      const repeatRes = await request(app)
        .post(`/api/bookings/${bookingToTest.id}/cancel`)
        .send({
          booking_reference: bookingToTest.booking_reference,
          guest_email: bookingToTest.guest_email
        });
      expect(repeatRes.status).toBe(400);
      expect(repeatRes.body.message).toMatch(/already been cancelled/i);
    });
  });

  describe('4. Availability Tracking & Overbooking Capacity Boundary', () => {
    test('TC-API-13: Overbooking prevention - booking all available rooms and verifying sold out', async () => {
      // Hotel 4 has total_rooms = 5
      const checkIn = getFutureDate(30);
      const checkOut = getFutureDate(32);

      // Book until all rooms are filled
      for (let i = 1; i <= 5; i++) {
        const bookRes = await request(app).post('/api/bookings').send({
          hotel_id: 4,
          guest_name: `Room Guest ${i}`,
          guest_email: `guest${i}@example.com`,
          check_in_date: checkIn,
          check_out_date: checkOut
        });
        expect(bookRes.status).toBe(201);
      }

      // Next booking beyond capacity must be rejected!
      const overbookRes = await request(app).post('/api/bookings').send({
        hotel_id: 4,
        guest_name: 'Overbook Guest',
        guest_email: 'overbook@example.com',
        check_in_date: checkIn,
        check_out_date: checkOut
      });

      expect(overbookRes.status).toBe(400);
      expect(overbookRes.body.success).toBe(false);
      expect(overbookRes.body.message).toMatch(/no rooms available/i);
    });
  });
});

