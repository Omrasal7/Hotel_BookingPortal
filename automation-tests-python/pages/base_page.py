import os
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class BasePage:
    """Base class for all Page Objects with reusable Selenium actions and explicit waits."""

    def __init__(self, driver, timeout=10):
        self.driver = driver
        self.timeout = timeout
        self.wait = WebDriverWait(driver, timeout)

    def wait_for_presence(self, locator):
        return self.wait.until(EC.presence_of_element_located(locator))

    def wait_for_visible(self, locator):
        return self.wait.until(EC.visibility_of_element_located(locator))

    def click(self, locator):
        element = self.wait.until(EC.element_to_be_clickable(locator))
        element.click()

    def send_keys(self, locator, text):
        element = self.wait_for_visible(locator)
        element.clear()
        element.send_keys(text)

    def set_date_input(self, locator, date_string):
        """Sets HTML5 date input safely triggering React synthetic events."""
        element = self.wait_for_visible(locator)
        script = """
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
            if (nativeSetter) {
                nativeSetter.call(arguments[0], arguments[1]);
            } else {
                arguments[0].value = arguments[1];
            }
            arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
            arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
        """
        self.driver.execute_script(script, element, date_string)

    def get_text(self, locator):
        element = self.wait_for_visible(locator)
        return element.text

    def is_displayed(self, locator, timeout=3):
        try:
            WebDriverWait(self.driver, timeout).until(EC.visibility_of_element_located(locator))
            return True
        except (TimeoutException, NoSuchElementException):
            return False

    def is_present(self, locator, timeout=3):
        try:
            WebDriverWait(self.driver, timeout).until(EC.presence_of_element_located(locator))
            return True
        except (TimeoutException, NoSuchElementException):
            return False

    def capture_screenshot(self, name):
        screenshots_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports", "screenshots")
        os.makedirs(screenshots_dir, exist_ok=True)
        file_path = os.path.join(screenshots_dir, f"{name}_{int(time.time())}.png")
        self.driver.save_screenshot(file_path)
        return file_path

