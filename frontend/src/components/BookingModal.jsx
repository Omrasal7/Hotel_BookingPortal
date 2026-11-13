import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Mail, Tag, AlertCircle, Loader2 } from 'lucide-react';
import { fetchBookingQuote, submitBooking } from '../services/api';

export default function BookingModal({
  hotel,
  defaultCheckIn,
  defaultCheckOut,
  onClose,
  onBookingSuccess,
  qaMode
}) {
  if (!hotel) return null;

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [checkInDate, setCheckInDate] = useState(defaultCheckIn || '');
  const [checkOutDate, setCheckOutDate] = useState(defaultCheckOut || '');

  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getTodayISO = () => new Date().toISOString().split('T')[0];

  // Fetch / update quote whenever dates change
  useEffect(() => {
    let isCancelled = false;

    async function loadQuote() {
      if (!checkInDate || !checkOutDate) return;
      if (checkInDate >= checkOutDate) {
        setErrorMessage('Check-out date must be strictly after check-in date.');
        setQuote(null);
        return;
      }

      setQuoteLoading(true);
      setErrorMessage('');

      try {
        const res = await fetchBookingQuote(hotel.id, checkInDate, checkOutDate);
        if (isCancelled) return;

        if (res.success) {
          setQuote(res.data);
          setErrorMessage('');
        } else {
          setErrorMessage(res.message);
          setQuote(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setErrorMessage('Failed to fetch pricing quote.');
          setQuote(null);
        }
      } finally {
        if (!isCancelled) {
          setQuoteLoading(false);
        }
      }
    }

    loadQuote();

    return () => {
      isCancelled = true;
    };
  }, [hotel.id, checkInDate, checkOutDate]);

  // QA Quick Fill for fast manual / automation testing
  const handleFillDemoData = () => {
    setGuestName('Arjun Kapoor');
    setGuestEmail('arjun.kapoor@example.com');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!guestName.trim()) {
      setErrorMessage('Guest name is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!guestEmail.trim() || !emailRegex.test(guestEmail.trim())) {
      setErrorMessage('Please enter a valid guest email address.');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      setErrorMessage('Please select check-in and check-out dates.');
      return;
    }

    setSubmitLoading(true);

    try {
      const payload = {
        hotel_id: hotel.id,
        guest_name: guestName.trim(),
        guest_email: guestEmail.trim(),
        check_in_date: checkInDate,
        check_out_date: checkOutDate
      };

      const res = await submitBooking(payload);

      if (res.success) {
        onBookingSuccess(res.data);
      } else {
        setErrorMessage(res.message || 'Booking failed.');
      }
    } catch (err) {
      setErrorMessage('Network error while processing booking. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} data-testid="booking-modal-backdrop">
      <div
        className="modal-content modal-booking"
        onClick={(e) => e.stopPropagation()}
        data-testid="booking-modal"
      >
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close"
          data-testid="btn-close-booking-modal"
        >
          <X size={20} />
        </button>

        <div className="booking-modal-header">
          <h2 className="booking-modal-title">Book Your Stay</h2>
          <p className="booking-modal-sub">
            {hotel.name} • <span className="text-secondary">{hotel.location}</span>
          </p>
        </div>

        {qaMode && (
          <div className="qa-helper-bar">
            <span>QA Mode:</span>
            <button
              type="button"
              className="btn-qa-fill"
              onClick={handleFillDemoData}
              data-testid="btn-qa-fill-demo-data"
            >
              Fill Sample Guest Data
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="booking-form" data-testid="booking-form" noValidate>
          {/* Guest Information */}
          <div className="form-section-title">
            <User size={16} /> Guest Details
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="guest-name">Full Name *</label>
              <input
                id="guest-name"
                data-testid="input-guest-name"
                type="text"
                placeholder="e.g. Priya Sharma"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="guest-email">Email Address *</label>
              <input
                id="guest-email"
                data-testid="input-guest-email"
                type="email"
                placeholder="e.g. priya@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Stay Dates */}
          <div className="form-section-title">
            <Calendar size={16} /> Stay Dates
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="book-checkin">Check-in Date *</label>
              <input
                id="book-checkin"
                data-testid="input-booking-checkin"
                type="date"
                min={getTodayISO()}
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="book-checkout">Check-out Date *</label>
              <input
                id="book-checkout"
                data-testid="input-booking-checkout"
                type="date"
                min={checkInDate || getTodayISO()}
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Price Calculation Breakdown */}
          <div className="price-breakdown-card" data-testid="price-breakdown-card">
            <div className="breakdown-title">
              <span>Price Summary</span>
              {quoteLoading && <Loader2 size={16} className="spinner" />}
            </div>

            {quote ? (
              <div className="breakdown-rows">
                <div className="breakdown-row">
                  <span>Room Rate (₹{quote.pricePerNight} × {quote.totalNights} {quote.totalNights === 1 ? 'night' : 'nights'})</span>
                  <span data-testid="price-base-amount">₹{quote.baseAmount.toLocaleString('en-IN')}</span>
                </div>

                {quote.discountAmount > 0 && (
                  <div className="breakdown-row row-discount" data-testid="price-discount-row">
                    <span className="discount-label">
                      <Tag size={14} /> {quote.discountReason}
                    </span>
                    <span data-testid="price-discount-amount">- ₹{quote.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="breakdown-divider" />

                <div className="breakdown-row row-total">
                  <strong>Total Amount Payable</strong>
                  <strong className="total-highlight" data-testid="price-total-amount">
                    ₹{quote.totalAmount.toLocaleString('en-IN')}
                  </strong>
                </div>

                <div className="breakdown-rooms-note" data-testid="rooms-left-note">
                  {quote.availableRooms} {quote.availableRooms === 1 ? 'room' : 'rooms'} available for these dates
                </div>
              </div>
            ) : (
              <p className="muted-text">Select valid check-in and check-out dates to calculate pricing.</p>
            )}
          </div>

          {/* Cancellation information */}
          <div className="booking-cancellation-note">
            <Calendar size={18} />
            <div>
              <strong>Cancellation</strong>
              <p>You can cancel a confirmed booking from Manage Booking. This demo does not process refunds.</p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="form-error-banner" data-testid="booking-error-banner">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="booking-modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              data-testid="btn-cancel-booking-modal"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary btn-submit-booking"
              disabled={submitLoading || quoteLoading || !quote || (quote && quote.availableRooms <= 0)}
              data-testid="btn-confirm-booking"
            >
              {submitLoading ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm & Reserve Room</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

