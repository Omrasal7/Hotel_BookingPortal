const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class BookingModalPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.modal = By.css('[data-testid="booking-modal"]');
    this.guestNameInput = By.css('[data-testid="input-guest-name"]');
    this.guestEmailInput = By.css('[data-testid="input-guest-email"]');
    this.checkInInput = By.css('[data-testid="input-booking-checkin"]');
    this.checkOutInput = By.css('[data-testid="input-booking-checkout"]');
    this.totalAmountText = By.css('[data-testid="price-total-amount"]');
    this.discountRow = By.css('[data-testid="price-discount-row"]');
    this.confirmBookingBtn = By.css('[data-testid="btn-confirm-booking"]');
    this.cancelModalBtn = By.css('[data-testid="btn-cancel-booking-modal"]');
    this.errorBanner = By.css('[data-testid="booking-error-banner"]');
    this.qaFillBtn = By.css('[data-testid="btn-qa-fill-demo-data"]');
  }

  async isModalDisplayed() {
    return await this.isElementPresent(this.modal);
  }

  async fillGuestDetails(name, email) {
    await this.sendKeys(this.guestNameInput, name);
    await this.sendKeys(this.guestEmailInput, email);
  }

  async setDates(checkIn, checkOut) {
    await this.setDateInput(this.checkInInput, checkIn);
    await this.setDateInput(this.checkOutInput, checkOut);
    await this.driver.sleep(600); // allow quote calculation
  }

  async getTotalAmount() {
    await this.waitForVisible(this.totalAmountText);
    return await this.getText(this.totalAmountText);
  }

  async isDiscountApplied() {
    return await this.isElementPresent(this.discountRow);
  }

  async confirmBooking() {
    await this.click(this.confirmBookingBtn);
  }

  async getErrorMessage() {
    await this.waitForVisible(this.errorBanner);
    return await this.getText(this.errorBanner);
  }
}

module.exports = BookingModalPage;

