import time
import pytest
from pages.home_page import HomePage
from pages.booking_modal_page import BookingModalPage
from pages.confirmation_modal_page import ConfirmationModalPage
from pages.manage_booking_page import ManageBookingPage

class TestCancellation:
    """Test Suite 4: Booking Retrieval Security & Cancellation Flow."""

    def test_unauthorized_email_lookup_fails(self, driver, base_url):
        home = HomePage(driver).open(base_url)
        home.open_manage_booking()

        manage_page = ManageBookingPage(driver)
        assert manage_page.is_modal_open()

        # Lookup with fake details
        manage_page.lookup_booking("TC-HB-INVALID", "wrong@example.com")
        assert manage_page.has_error(), "Lookup with invalid email/ref should display error banner"

        manage_page.close_modal()

    def test_booking_retrieval_and_cancellation(self, driver, base_url, future_dates):
        home = HomePage(driver).open(base_url)
        home.click_book_first_hotel()

        # 1. Book room
        booking_modal = BookingModalPage(driver)
        guest_email = "pooja.verma@example.com"
        booking_modal.fill_guest_details("Pooja Verma", guest_email)
        booking_modal.confirm_booking()
        time.sleep(1.2)

        # 2. Extract reference
        confirm_modal = ConfirmationModalPage(driver)
        booking_ref = confirm_modal.get_reference_code()
        confirm_modal.close_modal()
        time.sleep(0.5)

        # 3. Open Manage Booking and Lookup
        home.open_manage_booking()
        manage_page = ManageBookingPage(driver)
        manage_page.lookup_booking(booking_ref, guest_email)

        assert manage_page.is_booking_found(), "Valid booking should be found"
        assert manage_page.is_confirmed(), "Initial status must be CONFIRMED"

        # 4. Cancel Reservation
        manage_page.cancel_reservation()
        assert manage_page.is_cancelled(), "Status must transition to CANCELLED upon cancellation"

        manage_page.close_modal()

