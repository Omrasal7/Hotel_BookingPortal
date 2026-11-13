import time
import pytest
from pages.home_page import HomePage
from pages.booking_modal_page import BookingModalPage
from pages.confirmation_modal_page import ConfirmationModalPage

class TestBookingFlow:
    """Test Suite 2: Complete Happy-Path Booking Lifecycle."""

    def test_complete_booking_journey(self, driver, base_url, future_dates):
        home = HomePage(driver).open(base_url)
        home.click_book_first_hotel()

        booking_modal = BookingModalPage(driver)
        assert booking_modal.is_modal_open(), "Booking modal should open upon clicking Book"

        # Check pricing calculation is rendered
        total_price = booking_modal.get_total_amount()
        assert "₹" in total_price, f"Total amount format should include ₹, got: {total_price}"

        # Enter guest details
        guest_name = "Vikram Rathore"
        guest_email = "vikram.rathore@example.com"
        booking_modal.fill_guest_details(guest_name, guest_email)

        # Confirm booking
        booking_modal.confirm_booking()
        time.sleep(1.2)

        # Verify confirmation modal
        confirm_modal = ConfirmationModalPage(driver)
        assert confirm_modal.is_modal_open(), "Confirmation modal must appear after submission"

        reference_code = confirm_modal.get_reference_code()
        assert reference_code.startswith("TC-HB-"), f"Reference should follow TC-HB- format, got: {reference_code}"

        confirmed_name = confirm_modal.get_confirmed_guest_name()
        assert confirmed_name == guest_name, f"Expected {guest_name}, got {confirmed_name}"

        confirm_modal.close_modal()

