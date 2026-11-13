import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AutomationBanner from './components/AutomationBanner';
import SearchBar from './components/SearchBar';
import HotelCard from './components/HotelCard';
import HotelDetailModal from './components/HotelDetailModal';
import BookingModal from './components/BookingModal';
import BookingConfirmation from './components/BookingConfirmation';
import ManageBookingModal from './components/ManageBookingModal';
import { fetchHotels } from './services/api';
import { Loader2, AlertCircle, Building2, ShieldCheck, Award } from 'lucide-react';
import './App.css';

export default function App() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search parameters
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  // Modals state
  const [detailHotel, setDetailHotel] = useState(null);
  const [bookingHotel, setBookingHotel] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);

  // QA Mode for Test Automation Engineers
  const [qaMode, setQaMode] = useState(false);

  // Load hotels on mount and search
  const loadHotels = async (loc = location, inDate = checkInDate, outDate = checkOutDate) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchHotels(loc, inDate, outDate);
      if (res.success) {
        setHotels(res.data);
      } else {
        setError(res.message || 'Failed to load hotels.');
      }
    } catch (err) {
      setError('Unable to reach server. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set default check-in (tomorrow) and check-out (4 days later to showcase long-stay discount)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const checkout = new Date(today);
    checkout.setDate(today.getDate() + 4);

    const checkInStr = tomorrow.toISOString().split('T')[0];
    const checkOutStr = checkout.toISOString().split('T')[0];

    setCheckInDate(checkInStr);
    setCheckOutDate(checkOutStr);

    loadHotels('', checkInStr, checkOutStr);
  }, []);

  const handleSearch = () => {
    loadHotels(location, checkInDate, checkOutDate);
  };

  const handleReset = () => {
    setLocation('');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const checkout = new Date(today);
    checkout.setDate(today.getDate() + 4);

    const checkInStr = tomorrow.toISOString().split('T')[0];
    const checkOutStr = checkout.toISOString().split('T')[0];

    setCheckInDate(checkInStr);
    setCheckOutDate(checkOutStr);
    loadHotels('', checkInStr, checkOutStr);
  };

  const handleBookingSuccess = (newBooking) => {
    setBookingHotel(null);
    setConfirmedBooking(newBooking);
    // Refresh availability
    loadHotels(location, checkInDate, checkOutDate);
  };

  return (
    <div className={`app-root ${qaMode ? 'qa-active' : ''}`}>
      {/* Navigation Bar */}
      <Navbar
        onOpenManageBooking={() => setShowManageModal(true)}
        qaMode={qaMode}
        setQaMode={setQaMode}
      />

      {/* QA Inspection Banner */}
      <AutomationBanner qaMode={qaMode} />

      {/* Search Bar Section */}
      <SearchBar
        location={location}
        setLocation={setLocation}
        checkInDate={checkInDate}
        setCheckInDate={setCheckInDate}
        checkOutDate={checkOutDate}
        setCheckOutDate={setCheckOutDate}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-container">
          {/* Header Row */}
          <div className="listing-header">
            <div>
              <h2 className="section-title">
                {location ? `Hotels in "${location}"` : 'Featured Hotels & Resorts'}
              </h2>
              <p className="section-sub">
                {checkInDate && checkOutDate
                  ? `Showing room availability for stay: ${checkInDate} to ${checkOutDate}`
                  : 'Select dates to view guaranteed room availability'}
              </p>
            </div>
            <div className="hotel-count-badge" data-testid="hotel-count-badge">
              <Building2 size={16} />
              <span>{hotels.length} Properties Available</span>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="loading-state" data-testid="loading-state">
              <Loader2 size={36} className="spinner" />
              <p>Finding available hotels and checking live room capacity...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-banner" data-testid="error-banner">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Hotels Grid */}
          {!loading && !error && hotels.length > 0 && (
            <div className="hotels-grid" data-testid="hotels-grid">
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  qaMode={qaMode}
                  onSelectHotel={(h) => setDetailHotel(h)}
                  onBookDirectly={(h) => setBookingHotel(h)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && hotels.length === 0 && (
            <div className="empty-state" data-testid="empty-hotels-state">
              <Building2 size={48} className="empty-icon" />
              <h3>No Hotels Found</h3>
              <p>We couldn't find any hotels matching "{location}". Try searching for Goa, Jaipur, Mumbai, or Manali.</p>
              <button className="btn-primary" onClick={handleReset}>
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-left">
            <strong>Thomas Cook (India) Limited</strong>
            <p>Hotel Booking Portal - Automation Engineering Interview Assignment</p>
          </div>
          <div className="footer-right">
            <span className="footer-badge"><ShieldCheck size={14} /> Check availability for your dates</span>
            <span className="footer-badge"><Award size={14} /> 10% off stays of 4+ nights</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {detailHotel && (
        <HotelDetailModal
          hotel={detailHotel}
          onClose={() => setDetailHotel(null)}
          onProceedToBook={(h) => {
            setDetailHotel(null);
            setBookingHotel(h);
          }}
        />
      )}

      {bookingHotel && (
        <BookingModal
          hotel={bookingHotel}
          defaultCheckIn={checkInDate}
          defaultCheckOut={checkOutDate}
          qaMode={qaMode}
          onClose={() => setBookingHotel(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {confirmedBooking && (
        <BookingConfirmation
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
          onOpenManageBooking={() => {
            setConfirmedBooking(null);
            setShowManageModal(true);
          }}
        />
      )}

      {showManageModal && (
        <ManageBookingModal
          onClose={() => setShowManageModal(false)}
          onBookingCancelled={() => loadHotels(location, checkInDate, checkOutDate)}
        />
      )}
    </div>
  );
}

