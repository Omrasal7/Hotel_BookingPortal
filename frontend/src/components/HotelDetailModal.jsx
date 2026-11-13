import React from 'react';
import { X, Star, MapPin, Check, Sun, ArrowRight, Shield } from 'lucide-react';

export default function HotelDetailModal({ hotel, onClose, onProceedToBook }) {
  if (!hotel) return null;

  const isAvailable = hotel.is_available !== false && (hotel.available_rooms === undefined || hotel.available_rooms > 0);
  const availableRooms = hotel.available_rooms !== undefined ? hotel.available_rooms : hotel.total_rooms;

  return (
    <div className="modal-backdrop" onClick={onClose} data-testid="hotel-detail-modal-backdrop">
      <div
        className="modal-content modal-hotel-detail"
        onClick={(e) => e.stopPropagation()}
        data-testid="hotel-detail-modal"
      >
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close"
          data-testid="btn-close-detail-modal"
        >
          <X size={20} />
        </button>

        <div className="modal-header-hero">
          <img src={hotel.image_url} alt={hotel.name} className="modal-hero-image" />
          <div className="modal-hero-overlay">
            <div className="modal-badge-row">
              <span className="rating-pill">
                <Star size={14} className="star-icon" /> {hotel.rating || 4.8} / 5.0
              </span>
              <span className="location-pill">
                <MapPin size={14} /> {hotel.location}
              </span>
            </div>
            <h2 className="modal-hotel-title" data-testid="detail-hotel-name">{hotel.name}</h2>
          </div>
        </div>

        <div className="modal-scroll-body">
          {/* Destination Travel & Weather Advisory (Surprise Feature) */}
          {hotel.advisory && (
            <div className="advisory-card" data-testid="advisory-card">
              <div className="advisory-header">
                <Sun size={18} className="advisory-icon" />
                <strong>Thomas Cook Destination Advisory & Weather</strong>
              </div>
              <div className="advisory-body">
                <p><strong>Climate:</strong> {hotel.advisory.climate}</p>
                <p><strong>Travel Tip:</strong> {hotel.advisory.recommendation}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="detail-section">
            <h4>About the Property</h4>
            <p className="detail-text" data-testid="detail-hotel-desc">{hotel.description}</p>
          </div>

          {/* Amenities */}
          <div className="detail-section">
            <h4>Included Amenities</h4>
            <div className="amenities-grid" data-testid="detail-amenities-grid">
              {(hotel.amenities || []).map((amenity, idx) => (
                <div key={idx} className="amenity-item">
                  <Check size={16} className="amenity-check" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Room Availability */}
          <div className="detail-section availability-section">
            <h4>Room Availability</h4>
            <div className="room-status-box">
              <div>
                <strong>Single Luxury Category Room</strong>
                <p className="muted-text">King-size bed, ensuite bath, high-speed WiFi</p>
              </div>
              <div className="text-right">
                <div className="room-price-lg">
                  ₹{parseFloat(hotel.room_price_per_night).toLocaleString('en-IN')}
                  <span className="room-price-sub"> / night</span>
                </div>
                <div className="avail-indicator">
                  {isAvailable ? (
                    <span className="status-badge status-available" data-testid="detail-rooms-available">
                      {availableRooms} {availableRooms === 1 ? 'room' : 'rooms'} available
                    </span>
                  ) : (
                    <span className="status-badge status-soldout" data-testid="detail-rooms-soldout">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            data-testid="btn-cancel-detail"
          >
            Close
          </button>
          <button
            className="btn-primary"
            disabled={!isAvailable}
            onClick={() => {
              onClose();
              onProceedToBook(hotel);
            }}
            data-testid="btn-proceed-to-book"
          >
            <span>Proceed to Booking</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

