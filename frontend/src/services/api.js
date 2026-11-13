const BASE_URL = '/api';

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
}

export async function fetchHotels(location = '', checkInDate = '', checkOutDate = '') {
  const params = new URLSearchParams();
  if (location) params.append('location', location);
  if (checkInDate) params.append('checkInDate', checkInDate);
  if (checkOutDate) params.append('checkOutDate', checkOutDate);

  const res = await fetch(`${BASE_URL}/hotels?${params.toString()}`);
  return res.json();
}

export async function fetchHotelDetails(id, checkInDate = '', checkOutDate = '') {
  const params = new URLSearchParams();
  if (checkInDate) params.append('checkInDate', checkInDate);
  if (checkOutDate) params.append('checkOutDate', checkOutDate);

  const res = await fetch(`${BASE_URL}/hotels/${id}?${params.toString()}`);
  return res.json();
}

export async function fetchBookingQuote(hotelId, checkInDate, checkOutDate) {
  const res = await fetch(`${BASE_URL}/bookings/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hotel_id: hotelId,
      check_in_date: checkInDate,
      check_out_date: checkOutDate
    })
  });
  return res.json();
}

export async function submitBooking(bookingData) {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  });
  return res.json();
}

export async function retrieveBooking(bookingReference, guestEmail) {
  const res = await fetch(`${BASE_URL}/bookings/retrieve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      booking_reference: bookingReference,
      guest_email: guestEmail
    })
  });
  return res.json();
}

export async function cancelBooking(bookingId, bookingReference, guestEmail) {
  const res = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      booking_reference: bookingReference,
      guest_email: guestEmail
    })
  });
  return res.json();
}

