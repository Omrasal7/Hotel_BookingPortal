from selenium.webdriver.common.by import By
from .base_page import BasePage

class ConfirmationModalPage(BasePage):
    """Page Object for Booking Confirmation Dialog."""

    MODAL = (By.CSS_SELECTOR, "[data-testid='booking-confirmation-modal']")
    REFERENCE_CODE = (By.CSS_SELECTOR, "[data-testid='booking-reference-code']")
    GUEST_NAME = (By.CSS_SELECTOR, "[data-testid='confirm-guest-name']")
    HOTEL_NAME = (By.CSS_SELECTOR, "[data-testid='confirm-hotel-name']")
    CLOSE_BTN = (By.CSS_SELECTOR, "[data-testid='btn-close-confirmation']")

    def is_modal_open(self):
        return self.is_displayed(self.MODAL)

    def get_reference_code(self):
        return self.get_text(self.REFERENCE_CODE)

    def get_confirmed_guest_name(self):
        return self.get_text(self.GUEST_NAME)

    def close_modal(self):
        self.click(self.CLOSE_BTN)

