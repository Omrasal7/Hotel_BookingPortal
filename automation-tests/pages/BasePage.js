const { By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

class BasePage {
  constructor(driver, timeout = 10000) {
    this.driver = driver;
    this.timeout = timeout;
  }

  async waitForElement(locator) {
    return await this.driver.wait(until.elementLocated(locator), this.timeout);
  }

  async waitForVisible(locator) {
    const el = await this.waitForElement(locator);
    await this.driver.wait(until.elementIsVisible(el), this.timeout);
    return el;
  }

  async click(locator) {
    const el = await this.waitForVisible(locator);
    await this.driver.wait(until.elementIsEnabled(el), this.timeout);
    await el.click();
  }

  async sendKeys(locator, text) {
    const el = await this.waitForVisible(locator);
    await el.clear();
    await el.sendKeys(text);
  }

  async setDateInput(locator, dateString) {
    const el = await this.waitForVisible(locator);
    await this.driver.executeScript((element, val) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (nativeSetter) {
        nativeSetter.call(element, val);
      } else {
        element.value = val;
      }
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }, el, dateString);
  }

  async getText(locator) {
    const el = await this.waitForVisible(locator);
    return await el.getText();
  }

  async isElementPresent(locator) {
    try {
      const elements = await this.driver.findElements(locator);
      return elements.length > 0;
    } catch {
      return false;
    }
  }

  async captureScreenshot(filename) {
    const screenshotsDir = path.join(__dirname, '../reports/screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    const image = await this.driver.takeScreenshot();
    const filePath = path.join(screenshotsDir, `${filename}.png`);
    fs.writeFileSync(filePath, image, 'base64');
    return filePath;
  }
}

module.exports = BasePage;

