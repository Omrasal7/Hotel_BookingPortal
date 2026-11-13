const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function createDriver() {
  const options = new chrome.Options();
  const isHeadless = process.env.HEADLESS === 'true' || process.env.CI === 'true';

  if (isHeadless) {
    options.addArguments('--headless=new');
  }

  options.addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1280,800',
    '--disable-extensions'
  );

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000 });
  return driver;
}

module.exports = {
  createDriver,
  BASE_URL: process.env.BASE_URL || 'http://localhost:5173'
};

