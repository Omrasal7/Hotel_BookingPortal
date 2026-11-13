import React from 'react';
import { Compass, BookOpen, ShieldCheck, Bug } from 'lucide-react';

export default function Navbar({ onOpenManageBooking, qaMode, setQaMode }) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-badge">
            <Compass className="brand-icon" size={26} />
          </div>
          <div>
            <div className="brand-title">THOMAS COOK</div>
            <div className="brand-subtitle">HOTEL BOOKING PORTAL</div>
          </div>
        </div>

        <div className="navbar-actions">
          <button
            className={`btn-qa-toggle ${qaMode ? 'active' : ''}`}
            onClick={() => setQaMode(!qaMode)}
            title="Toggle QA Engineer Inspection Mode & Test Locators"
            data-testid="btn-toggle-qa-mode"
          >
            <Bug size={16} />
            <span>{qaMode ? 'QA Mode ON' : 'QA Mode'}</span>
          </button>

          <button
            className="btn-nav-outline"
            onClick={onOpenManageBooking}
            data-testid="btn-manage-booking-nav"
          >
            <BookOpen size={16} />
            <span>Manage / Cancel Booking</span>
          </button>
        </div>
      </div>
    </header>
  );
}

