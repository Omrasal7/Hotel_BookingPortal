import React from 'react';
import { Star, MapPin, Check, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

export default function HotelCard({ hotel, onSelectHotel, onBookDirectly, qaMode }) {
  const isAvailable = hotel.is_available !== false && (hotel.available_rooms === undefined || hotel.available_rooms > 0);
  const availableRooms = hotel.available_rooms !== undefined ? hotel.available_rooms : hotel.total_rooms;

  return (
    <article
      className="hotel-card"
      data-testid={`hotel-card-${hotel.id}`}
      id={`hotel-card-${hotel.id}`}
    >
      <div className="card-image-wrap">
        <img
          src={hotel.image_url}
          alt={hotel.name}
          className="hotel-image"
          loading="lazy"
        />
        <div className="card-badge-rating" data-testid={`hotel-rating-${hotel.id}`}>
          <Star size={14} className="star-icon" />
          <span>{hotel.rating || 4.8}</span>
        </div>

        {hotel.advisory && (
          <div className="card-badge-advisory" title={hotel.advisory.recommendation}>
            <Sparkles size={12} />
            <span>{hotel.advisory.climate.split('(')[0]}</span>
          </div>
        )}
      </div>

      <div className="card-body">
        <div className="card-location" data-testid={`hotel-location-${hotel.id}`}>
          <MapPin size={14} />
          <span>{hotel.location}</span>
        </div>

        <h3 className="card-title" data-testid={`hotel-name-${hotel.id}`}>{hotel.name}</h3>
        <p className="card-desc">{hotel.description}</p>

        {/* Amenities preview */}
        <div className="amenities-preview" data-testid={`hotel-amenities-${hotel.id}`}>
          {(hotel.amenities || []).slice(0, 3).map((amenity, idx) => (
            <span key={idx} className="amenity-tag">
              <Check size={12} className="check-icon" />
              <span>{amenity}</span>
            </span>
          ))}
          {(hotel.amenities || []).length > 3 && (
            <span className="amenity-more">+{hotel.amenities.length - 3} more</span>
          )}
        </div>

        <div className="card-divider" />

        <div className="card-footer">
          <div className="price-box">
            <span className="price-label">Price per night</span>
            <div className="price-amount" data-testid={`hotel-price-${hotel.id}`}>
              ₹{parseFloat(hotel.room_price_per_night).toLocaleString('en-IN')}
            </div>
            <div className="availability-status" data-testid={`hotel-availability-${hotel.id}`}>
              {isAvailable ? (
                <span className="avail-badge avail-in-stock">
                  {availableRooms} {availableRooms === 1 ? 'room' : 'rooms'} left
                </span>
              ) : (
                <span className="avail-badge avail-sold-out">
                  <AlertTriangle size={12} /> Sold Out
                </span>
              )}
            </div>
          </div>

          <div className="card-actions">
            <button
              className="btn-secondary"
              onClick={() => onSelectHotel(hotel)}
              data-testid={`btn-view-details-${hotel.id}`}
            >
              Details
            </button>
            <button
              className="btn-primary"
              disabled={!isAvailable}
              onClick={() => onBookDirectly(hotel)}
              data-testid={`btn-book-hotel-${hotel.id}`}
            >
              <span>Book</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {qaMode && (
          <div className="qa-locator-info">
            <code>[data-testid="hotel-card-{hotel.id}"]</code>
          </div>
        )}
      </div>
    </article>
  );
}

