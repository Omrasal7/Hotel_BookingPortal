import React, { useState } from 'react';
import { X, Search, AlertCircle, CheckCircle2, XCircle, Loader2, ShieldAlert } from 'lucide-react';
import { retrieveBooking, cancelBooking } from '../services/api';

export default function ManageBookingModal({ onClose, onBookingCancelled }) {
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const handleRetrieve = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setBooking(null);
    setShowConfirmCancel(false);

    if (!reference.trim() || !email.trim()) {
      setErrorMsg('Please enter both booking reference and email.');
      return;
    }

    setLoading(true);

    try {
      const res = await retrieveBooking(reference.trim(), email.trim());
      if (res.success) {
        setBooking(res.data);
      } else {
        setErrorMsg(res.message || 'No booking found matching these details.');
      }
    } catch (err) {
      setErrorMsg('Failed to retrieve booking. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    setCancelLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await cancelBooking(booking.id, booking.booking_reference, booking.guest_email);
      if (res.success) {
        setBooking({
          ...booking,
          status: 'CANCELLED',
          cancelled_at: res.data.cancelled_at
        });
        setSuccessMsg('Booking cancelled successfully! The reserved room has been released back into availability.');
        setShowConfirmCancel(false);
        if (onBookingCancelled) {
          onBookingCancelled();
        }
      } else {
        setErrorMsg(res.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      setErrorMsg('Error processing cancellation request.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} data-testid="manage-booking-backdrop">
      <div
        className="modal-content modal-manage-booking"
        onClick={(e) => e.stopPropagation()}
        data-testid="manage-booking-modal"
      >
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close"
          data-testid="btn-close-manage-modal"
        >
          <X size={20} />
        </button>

        <div className="modal-header">
          <h2>Manage & Cancel Booking</h2>
          <p className="modal-sub">Look up your reservation with your booking reference and email address</p>
        </div>

        {/* Lookup Form */}
        <form onSubmit={handleRetrieve} className="manage-lookup-form" data-testid="manage-lookup-form">
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="manage-ref">Booking Reference *</label>
              <input
                id="manage-ref"
                data-testid="input-manage-reference"
                type="text"
                placeholder="e.g. TC-HB-89211"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="manage-email">Guest Email *</label>
              <input
                id="manage-email"
                data-testid="input-manage-email"
                type="email"
                placeholder="e.g. guest@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary btn-retrieve"
            disabled={loading}
            data-testid="btn-retrieve-booking"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spinner" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Find Reservation</span>
              </>
            )}
          </button>
        </form>

        {/* Error Message */}
        {errorMsg && (
          <div className="form-error-banner" data-testid="manage-error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="form-success-banner" data-testid="manage-success-banner">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Retrieved Booking Card */}
        {booking && (
          <div className="manage-booking-result" data-testid="manage-booking-result">
            <div className="result-header">
              <div>
                <span className="result-ref" data-testid="retrieved-ref">{booking.booking_reference}</span>
                <h3 className="result-hotel" data-testid="retrieved-hotel-name">{booking.hotel_name}</h3>
                <span className="result-location">{booking.hotel_location}</span>
              </div>

              <div className="result-status-wrap">
                {booking.status === 'CONFIRMED' ? (
                  <span className="status-badge status-confirmed" data-testid="retrieved-status-confirmed">
                    <CheckCircle2 size={14} /> Confirmed
                  </span>
                ) : (
                  <span className="status-badge status-cancelled" data-testid="retrieved-status-cancelled">
                    <XCircle size={14} /> Cancelled
                  </span>
                )}
              </div>
            </div>

            <div className="result-details-grid">
              <div>
                <span className="label">Guest:</span>
                <strong data-testid="retrieved-guest-name">{booking.guest_name}</strong>
              </div>
              <div>
                <span className="label">Email:</span>
                <strong data-testid="retrieved-guest-email">{booking.guest_email}</strong>
              </div>
              <div>
                <span className="label">Check-in:</span>
                <strong data-testid="retrieved-checkin">{booking.check_in_date}</strong>
              </div>
              <div>
                <span className="label">Check-out:</span>
                <strong data-testid="retrieved-checkout">{booking.check_out_date}</strong>
              </div>
              <div>
                <span className="label">Nights:</span>
                <strong>{booking.total_nights}</strong>
              </div>
              <div>
                <span className="label">Total Paid:</span>
                <strong className="text-primary" data-testid="retrieved-total-amount">
                  ₹{parseFloat(booking.total_amount).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            {/* Cancellation Confirmation Prompt */}
            {booking.status === 'CONFIRMED' && !showConfirmCancel && (
              <div className="cancellation-action-box">
                <button
                  type="button"
                  className="btn-danger-outline"
                  onClick={() => setShowConfirmCancel(true)}
                  data-testid="btn-initiate-cancel"
                >
                  Cancel This Reservation
                </button>
              </div>
            )}

            {booking.status === 'CONFIRMED' && showConfirmCancel && (
              <div className="cancellation-confirm-dialog" data-testid="cancel-confirm-dialog">
                <div className="dialog-warning">
                  <ShieldAlert size={20} className="warning-icon" />
                  <div>
                    <strong>Are you sure you want to cancel this booking?</strong>
                    <p>This action cannot be undone. Your reserved room will be instantly made available to other travelers.</p>
                  </div>
                </div>

                <div className="dialog-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowConfirmCancel(false)}
                    data-testid="btn-abort-cancel"
                  >
                    Keep Booking
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    disabled={cancelLoading}
                    onClick={handleCancelBooking}
                    data-testid="btn-confirm-cancel"
                  >
                    {cancelLoading ? (
                      <>
                        <Loader2 size={16} className="spinner" />
                        <span>Processing Cancellation...</span>
                      </>
                    ) : (
                      <span>Yes, Cancel Reservation</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {booking.status === 'CANCELLED' && (
              <div className="cancellation-notice" data-testid="cancellation-notice">
                <XCircle size={16} />
                <span>This booking is cancelled. Availability has been restored.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

