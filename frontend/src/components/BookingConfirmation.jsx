import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, Calendar, MapPin, Mail, User, ShieldCheck } from 'lucide-react';

export default function BookingConfirmation({ booking, onClose, onOpenManageBooking }) {
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const handleCopyReference = () => {
    navigator.clipboard.writeText(booking.booking_reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} data-testid="confirmation-modal-backdrop">
      <div
        className="modal-content modal-confirmation"
        onClick={(e) => e.stopPropagation()}
        data-testid="booking-confirmation-modal"
      >
        <div className="confirmation-header">
          <div className="success-icon-wrap">
            <CheckCircle2 size={42} className="success-icon" />
          </div>
          <h2>Booking Confirmed!</h2>
          <p className="confirmation-sub">Your room has been reserved with Thomas Cook</p>
        </div>

        {/* Reference Highlight Box */}
        <div className="ref-card" data-testid="booking-reference-card">
          <span className="ref-label">Booking Reference Number</span>
          <div className="ref-value-wrap">
            <span className="ref-code" data-testid="booking-reference-code">
              {booking.booking_reference}
            </span>
            <button
              className="btn-copy"
              onClick={handleCopyReference}
              title="Copy Reference"
              data-testid="btn-copy-reference"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <p className="ref-hint">Save this reference and your email to view or cancel your booking.</p>
        </div>

        {/* Booking Details Card */}
        <div className="summary-card">
          <h4>Reservation Details</h4>

          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Hotel</span>
              <span className="summary-val" data-testid="confirm-hotel-name">{booking.hotel_name}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Destination</span>
              <span className="summary-val">{booking.hotel_location}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Guest Name</span>
              <span className="summary-val" data-testid="confirm-guest-name">{booking.guest_name}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Email</span>
              <span className="summary-val" data-testid="confirm-guest-email">{booking.guest_email}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Check-in</span>
              <span className="summary-val" data-testid="confirm-checkin">{booking.check_in_date}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Check-out</span>
              <span className="summary-val" data-testid="confirm-checkout">{booking.check_out_date}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Total Nights</span>
              <span className="summary-val">{booking.total_nights} nights</span>
            </div>

            <div className="summary-item highlight-total">
              <span className="summary-label">Total Amount</span>
              <span className="summary-val" data-testid="confirm-total-amount">
                ₹{parseFloat(booking.total_amount).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Travel Assurance */}
        <div className="assurance-banner">
          <ShieldCheck size={18} />
          <span>Need to modify? You can retrieve and cancel this booking anytime using your reference and email.</span>
        </div>

        <div className="confirmation-actions">
          <button
            className="btn-secondary"
            onClick={onClose}
            data-testid="btn-close-confirmation"
          >
            Back to Hotels
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              onClose();
              onOpenManageBooking();
            }}
            data-testid="btn-go-to-manage"
          >
            Manage This Booking
          </button>
        </div>
      </div>
    </div>
  );
}

