import pytest
from pages.home_page import HomePage
from pages.booking_modal_page import BookingModalPage

class TestPricingDiscount:
    """Test Suite 3: Surprise Feature - 10% Long-Stay Loyalty Discount."""

    def test_surprise_feature_loyalty_discount_applied(self, driver, base_url, future_dates):
        home = HomePage(driver).open(base_url)
        home.click_book_first_hotel()

        booking_modal = BookingModalPage(driver)
        assert booking_modal.is_modal_open()

        # Set 5 nights stay (qualifies for 10% loyalty discount)
        booking_modal.set_stay_dates(
            check_in=future_dates["check_in"],
            check_out=future_dates["long_check_out"]
        )

        assert booking_modal.is_discount_applied(), "10% Long-Stay Loyalty Discount badge should appear for 4+ nights stay"

        booking_modal.close_modal()

