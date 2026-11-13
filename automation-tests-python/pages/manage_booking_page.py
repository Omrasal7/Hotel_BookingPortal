import time
from selenium.webdriver.common.by import By
from .base_page import BasePage

class ManageBookingPage(BasePage):
    """Page Object for Booking Retrieval and Cancellation."""

    MODAL = (By.CSS_SELECTOR, "[data-testid='manage-booking-modal']")
    REF_INPUT = (By.CSS_SELECTOR, "[data-testid='input-manage-reference']")
    EMAIL_INPUT = (By.CSS_SELECTOR, "[data-testid='input-manage-email']")
    RETRIEVE_BTN = (By.CSS_SELECTOR, "[data-testid='btn-retrieve-booking']")
    RESULT_CONTAINER = (By.CSS_SELECTOR, "[data-testid='manage-booking-result']")
    STATUS_CONFIRMED = (By.CSS_SELECTOR, "[data-testid='retrieved-status-confirmed']")
    STATUS_CANCELLED = (By.CSS_SELECTOR, "[data-testid='retrieved-status-cancelled']")
    INITIATE_CANCEL = (By.CSS_SELECTOR, "[data-testid='btn-initiate-cancel']")
    CONFIRM_CANCEL = (By.CSS_SELECTOR, "[data-testid='btn-confirm-cancel']")
    ERROR_BANNER = (By.CSS_SELECTOR, "[data-testid='manage-error-banner']")
    SUCCESS_BANNER = (By.CSS_SELECTOR, "[data-testid='manage-success-banner']")
    CLOSE_BTN = (By.CSS_SELECTOR, "[data-testid='btn-close-manage-modal']")

    def is_modal_open(self):
        return self.is_displayed(self.MODAL)

    def lookup_booking(self, reference, email):
        self.send_keys(self.REF_INPUT, reference)
        self.send_keys(self.EMAIL_INPUT, email)
        self.click(self.RETRIEVE_BTN)
        time.sleep(0.6)

    def is_booking_found(self):
        return self.is_displayed(self.RESULT_CONTAINER)

    def is_confirmed(self):
        return self.is_displayed(self.STATUS_CONFIRMED)

    def is_cancelled(self):
        return self.is_displayed(self.STATUS_CANCELLED)

    def cancel_reservation(self):
        self.click(self.INITIATE_CANCEL)
        time.sleep(0.3)
        self.click(self.CONFIRM_CANCEL)
        time.sleep(0.8)

    def has_error(self):
        return self.is_displayed(self.ERROR_BANNER)

    def close_modal(self):
        self.click(self.CLOSE_BTN)

