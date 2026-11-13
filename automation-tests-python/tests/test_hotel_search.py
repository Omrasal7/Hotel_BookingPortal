import pytest
from pages.home_page import HomePage

class TestHotelSearch:
    """Test Suite 1: Hotel Browsing, Location Filter, and Date Validation Boundary."""

    def test_homepage_loads_with_minimum_hotels(self, driver, base_url):
        home = HomePage(driver).open(base_url)
        count = home.get_hotel_count()
        assert count >= 5, f"Expected at least 5 hotels to be displayed, found {count}"

    def test_search_by_destination_goa(self, driver, base_url):
        home = HomePage(driver).open(base_url)
        home.search_hotels(location="Goa")
        count = home.get_hotel_count()
        assert count >= 1, "Expected at least 1 hotel to be returned for location 'Goa'"

    def test_reset_search_filters(self, driver, base_url):
        home = HomePage(driver).open(base_url)
        initial_count = home.get_hotel_count()
        home.search_hotels(location="Goa")
        home.reset_search()
        reset_count = home.get_hotel_count()
        assert reset_count == initial_count, f"Reset should restore all {initial_count} hotels, but found {reset_count}"

    def test_checkout_before_checkin_validation_error(self, driver, base_url, future_dates):
        home = HomePage(driver).open(base_url)
        # Attempt to search with check-out earlier than check-in
        home.search_hotels(
            location=None,
            check_in=future_dates["check_out"],  # Later date
            check_out=future_dates["check_in"]   # Earlier date
        )
        error_msg = home.get_search_error()
        assert "strictly after" in error_msg.lower(), f"Expected date validation error, received: {error_msg}"

