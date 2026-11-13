const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class HomePage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.locationInput = By.css('[data-testid="input-search-location"]');
    this.checkInInput = By.css('[data-testid="input-checkin-date"]');
    this.checkOutInput = By.css('[data-testid="input-checkout-date"]');
    this.searchBtn = By.css('[data-testid="btn-search-hotels"]');
    this.resetBtn = By.css('[data-testid="btn-reset-search"]');
    this.hotelCards = By.css('.hotel-card');
    this.manageBookingNavBtn = By.css('[data-testid="btn-manage-booking-nav"]');
    this.searchErrorBanner = By.css('[data-testid="search-error-message"]');
    this.emptyState = By.css('[data-testid="empty-hotels-state"]');
  }

  async open(url = 'http://localhost:5173') {
    await this.driver.get(url);
    await this.waitForVisible(this.searchBtn);
  }

  async searchHotels(location, checkIn, checkOut) {
    if (location !== undefined) {
      await this.sendKeys(this.locationInput, location);
    }
    if (checkIn) {
      await this.setDateInput(this.checkInInput, checkIn);
    }
    if (checkOut) {
      await this.setDateInput(this.checkOutInput, checkOut);
    }
    await this.click(this.searchBtn);
  }

  async resetSearch() {
    await this.click(this.resetBtn);
  }

  async getHotelCount() {
    await this.driver.sleep(800); // allow react state update
    const elements = await this.driver.findElements(this.hotelCards);
    return elements.length;
  }

  async clickBookOnFirstHotel() {
    const bookBtnLocator = By.css('.hotel-card:first-child [data-testid^="btn-book-hotel-"]');
    await this.click(bookBtnLocator);
  }

  async clickViewDetailsOnFirstHotel() {
    const detailsBtnLocator = By.css('.hotel-card:first-child [data-testid^="btn-view-details-"]');
    await this.click(detailsBtnLocator);
  }

  async openManageBookingModal() {
    await this.click(this.manageBookingNavBtn);
  }

  async getSearchErrorMessage() {
    return await this.getText(this.searchErrorBanner);
  }
}

module.exports = HomePage;

