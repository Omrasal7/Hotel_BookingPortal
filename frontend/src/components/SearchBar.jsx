import React, { useState } from 'react';
import { Search, MapPin, Calendar, RotateCcw, AlertCircle } from 'lucide-react';

export default function SearchBar({
  location,
  setLocation,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  onSearch,
  onReset
}) {
  const [dateError, setDateError] = useState('');

  // Formatter for today's ISO date string
  const getTodayISO = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDateError('');

    if (checkInDate && checkOutDate) {
      if (checkInDate < getTodayISO()) {
        setDateError('Check-in date cannot be in the past.');
        return;
      }
      if (checkOutDate <= checkInDate) {
        setDateError('Check-out date must be strictly after check-in date.');
        return;
      }
    }

    onSearch();
  };

  return (
    <section className="search-section" data-testid="search-section">
      <div className="search-container">
        <div className="search-title-wrap">
          <h2>Find Your Perfect Stay with Thomas Cook</h2>
          <p>Handpicked luxury resorts, heritage palaces, and modern corporate suites across India</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="search-form" data-testid="search-form" noValidate>
          {/* Location field */}
          <div className="form-group search-location-group">
            <label htmlFor="search-location">
              <MapPin size={16} /> Destination
            </label>
            <input
              id="search-location"
              data-testid="input-search-location"
              type="text"
              placeholder="e.g. Goa, Jaipur, Mumbai, Manali..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Check-in Date */}
          <div className="form-group">
            <label htmlFor="search-checkin">
              <Calendar size={16} /> Check-in Date
            </label>
            <input
              id="search-checkin"
              data-testid="input-checkin-date"
              type="date"
              min={getTodayISO()}
              value={checkInDate}
              onChange={(e) => {
                setCheckInDate(e.target.value);
                setDateError('');
              }}
            />
          </div>

          {/* Check-out Date */}
          <div className="form-group">
            <label htmlFor="search-checkout">
              <Calendar size={16} /> Check-out Date
            </label>
            <input
              id="search-checkout"
              data-testid="input-checkout-date"
              type="date"
              min={checkInDate || getTodayISO()}
              value={checkOutDate}
              onChange={(e) => {
                setCheckOutDate(e.target.value);
                setDateError('');
              }}
            />
          </div>

          {/* Buttons */}
          <div className="form-group btn-group-search">
            <button
              type="submit"
              className="btn-primary btn-search"
              data-testid="btn-search-hotels"
            >
              <Search size={18} />
              <span>Search Hotels</span>
            </button>

            <button
              type="button"
              className="btn-reset"
              onClick={() => {
                setDateError('');
                onReset();
              }}
              title="Reset Search Filters"
              data-testid="btn-reset-search"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </form>

        {dateError && (
          <div className="search-error-banner" data-testid="search-error-message">
            <AlertCircle size={16} />
            <span>{dateError}</span>
          </div>
        )}
      </div>
    </section>
  );
}

