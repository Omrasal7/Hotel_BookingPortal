import time
from selenium.webdriver.common.by import By
from .base_page import BasePage

class BookingModalPage(BasePage):
    """Page Object for the Reservation Modal."""

    MODAL = (By.CSS_SELECTOR, "[data-testid='booking-modal']")
    GUEST_NAME = (By.CSS_SELECTOR, "[data-testid='input-guest-name']")
    GUEST_EMAIL = (By.CSS_SELECTOR, "[data-testid='input-guest-email']")
    CHECKIN_INPUT = (By.CSS_SELECTOR, "[data-testid='input-booking-checkin']")
    CHECKOUT_INPUT = (By.CSS_SELECTOR, "[data-testid='input-booking-checkout']")
    TOTAL_AMOUNT = (By.CSS_SELECTOR, "[data-testid='price-total-amount']")
    DISCOUNT_ROW = (By.CSS_SELECTOR, "[data-testid='price-discount-row']")
    CONFIRM_BTN = (By.CSS_SELECTOR, "[data-testid='btn-confirm-booking']")
    CANCEL_BTN = (By.CSS_SELECTOR, "[data-testid='btn-cancel-booking-modal']")
    ERROR_BANNER = (By.CSS_SELECTOR, "[data-testid='booking-error-banner']")

    def is_modal_open(self):
        return self.is_displayed(self.MODAL)

    def fill_guest_details(self, name, email):
        self.send_keys(self.GUEST_NAME, name)
        self.send_keys(self.GUEST_EMAIL, email)

    def set_stay_dates(self, check_in, check_out):
        self.set_date_input(self.CHECKIN_INPUT, check_in)
        self.set_date_input(self.CHECKOUT_INPUT, check_out)
        time.sleep(0.6)  # allow backend price quote calculation

    def get_total_amount(self):
        return self.get_text(self.TOTAL_AMOUNT)

    def is_discount_applied(self):
        return self.is_displayed(self.DISCOUNT_ROW, timeout=2)

    def confirm_booking(self):
        self.click(self.CONFIRM_BTN)

    def close_modal(self):
        self.click(self.CANCEL_BTN)

