const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class ManageBookingPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.modal = By.css('[data-testid="manage-booking-modal"]');
    this.referenceInput = By.css('[data-testid="input-manage-reference"]');
    this.emailInput = By.css('[data-testid="input-manage-email"]');
    this.retrieveBtn = By.css('[data-testid="btn-retrieve-booking"]');
    this.resultContainer = By.css('[data-testid="manage-booking-result"]');
    this.statusConfirmed = By.css('[data-testid="retrieved-status-confirmed"]');
    this.statusCancelled = By.css('[data-testid="retrieved-status-cancelled"]');
    this.initiateCancelBtn = By.css('[data-testid="btn-initiate-cancel"]');
    this.confirmCancelBtn = By.css('[data-testid="btn-confirm-cancel"]');
    this.successBanner = By.css('[data-testid="manage-success-banner"]');
    this.errorBanner = By.css('[data-testid="manage-error-banner"]');
    this.closeBtn = By.css('[data-testid="btn-close-manage-modal"]');
  }

  async isDisplayed() {
    return await this.isElementPresent(this.modal);
  }

  async lookupBooking(reference, email) {
    await this.sendKeys(this.referenceInput, reference);
    await this.sendKeys(this.emailInput, email);
    await this.click(this.retrieveBtn);
  }

  async isResultDisplayed() {
    return await this.isElementPresent(this.resultContainer);
  }

  async isStatusConfirmed() {
    return await this.isElementPresent(this.statusConfirmed);
  }

  async isStatusCancelled() {
    return await this.isElementPresent(this.statusCancelled);
  }

  async cancelBooking() {
    await this.click(this.initiateCancelBtn);
    await this.waitForVisible(this.confirmCancelBtn);
    await this.click(this.confirmCancelBtn);
  }

  async getSuccessMessage() {
    await this.waitForVisible(this.successBanner);
    return await this.getText(this.successBanner);
  }

  async getErrorMessage() {
    await this.waitForVisible(this.errorBanner);
    return await this.getText(this.errorBanner);
  }

  async closeModal() {
    await this.click(this.closeBtn);
  }
}

module.exports = ManageBookingPage;

