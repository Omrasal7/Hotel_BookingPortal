const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class ConfirmationModalPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.modal = By.css('[data-testid="booking-confirmation-modal"]');
    this.referenceCode = By.css('[data-testid="booking-reference-code"]');
    this.hotelName = By.css('[data-testid="confirm-hotel-name"]');
    this.guestName = By.css('[data-testid="confirm-guest-name"]');
    this.guestEmail = By.css('[data-testid="confirm-guest-email"]');
    this.totalAmount = By.css('[data-testid="confirm-total-amount"]');
    this.closeBtn = By.css('[data-testid="btn-close-confirmation"]');
    this.goToManageBtn = By.css('[data-testid="btn-go-to-manage"]');
  }

  async isDisplayed() {
    return await this.isElementPresent(this.modal);
  }

  async getBookingReference() {
    await this.waitForVisible(this.referenceCode);
    return await this.getText(this.referenceCode);
  }

  async getGuestName() {
    return await this.getText(this.guestName);
  }

  async closeModal() {
    await this.click(this.closeBtn);
  }

  async clickManageBooking() {
    await this.click(this.goToManageBtn);
  }
}

module.exports = ConfirmationModalPage;

