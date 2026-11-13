import time
from selenium.webdriver.common.by import By
from .base_page import BasePage

class HomePage(BasePage):
    """Page Object for Hotel Browsing & Search page."""

    # Locators
    LOCATION_INPUT = (By.CSS_SELECTOR, "[data-testid='input-search-location']")
    CHECKIN_INPUT = (By.CSS_SELECTOR, "[data-testid='input-checkin-date']")
    CHECKOUT_INPUT = (By.CSS_SELECTOR, "[data-testid='input-checkout-date']")
    SEARCH_BTN = (By.CSS_SELECTOR, "[data-testid='btn-search-hotels']")
    RESET_BTN = (By.CSS_SELECTOR, "[data-testid='btn-reset-search']")
    HOTEL_CARDS = (By.CSS_SELECTOR, ".hotel-card")
    SEARCH_ERROR = (By.CSS_SELECTOR, "[data-testid='search-error-message']")
    MANAGE_NAV_BTN = (By.CSS_SELECTOR, "[data-testid='btn-manage-booking-nav']")

    def open(self, base_url="http://localhost:5173"):
        self.driver.get(base_url)
        self.wait_for_visible(self.SEARCH_BTN)
        return self

    def search_hotels(self, location=None, check_in=None, check_out=None):
        if location is not None:
            self.send_keys(self.LOCATION_INPUT, location)
        if check_in:
            self.set_date_input(self.CHECKIN_INPUT, check_in)
        if check_out:
            self.set_date_input(self.CHECKOUT_INPUT, check_out)
        self.click(self.SEARCH_BTN)
        time.sleep(0.5)

    def reset_search(self):
        self.click(self.RESET_BTN)
        time.sleep(0.5)

    def get_hotel_count(self):
        time.sleep(0.5)
        cards = self.driver.find_elements(*self.HOTEL_CARDS)
        return len(cards)

    def click_book_first_hotel(self):
        first_book_btn = (By.CSS_SELECTOR, ".hotel-card:first-child [data-testid^='btn-book-hotel-']")
        self.click(first_book_btn)

    def click_details_first_hotel(self):
        first_details_btn = (By.CSS_SELECTOR, ".hotel-card:first-child [data-testid^='btn-view-details-']")
        self.click(first_details_btn)

    def open_manage_booking(self):
        self.click(self.MANAGE_NAV_BTN)

    def get_search_error(self):
        return self.get_text(self.SEARCH_ERROR)

