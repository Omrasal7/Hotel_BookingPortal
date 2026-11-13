const HomePage = require('../pages/HomePage');
const { BASE_URL } = require('../config/selenium.config');

async function runSearchTests(driver) {
  console.log('\n--- Running Suite 1: Hotel Search & Date Validation E2E Tests ---');
  const homePage = new HomePage(driver);
  await homePage.open(BASE_URL);

  // Test 1: Verify home page loads and displays initial hotels
  const initialCount = await homePage.getHotelCount();
  if (initialCount < 5) {
    throw new Error(`Expected at least 5 hotels on initial load, found: ${initialCount}`);
  }
  console.log(`[PASS] TC-E2E-01: Home page loads with ${initialCount} hotels.`);

  // Test 2: Search hotels by destination 'Goa'
  await homePage.searchHotels('Goa');
  await driver.sleep(600);
  const goaCount = await homePage.getHotelCount();
  if (goaCount === 0) {
    throw new Error('Expected at least 1 hotel in Goa, found 0.');
  }
  console.log(`[PASS] TC-E2E-02: Location search filtered hotels to Goa (${goaCount} result).`);

  // Test 3: Reset search filters
  await homePage.resetSearch();
  await driver.sleep(600);
  const resetCount = await homePage.getHotelCount();
  if (resetCount !== initialCount) {
    throw new Error(`Expected reset to show ${initialCount} hotels, found ${resetCount}`);
  }
  console.log('[PASS] TC-E2E-03: Reset button successfully restores all hotel listings.');

  // Test 4: Negative validation - checkout before checkin
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 5);
  const checkoutBefore = new Date();
  checkoutBefore.setDate(checkoutBefore.getDate() + 2);

  const checkInStr = tomorrow.toISOString().split('T')[0];
  const checkOutStr = checkoutBefore.toISOString().split('T')[0];

  await homePage.searchHotels(undefined, checkInStr, checkOutStr);
  const errorText = await homePage.getSearchErrorMessage();
  if (!errorText || !errorText.includes('strictly after')) {
    throw new Error(`Expected error for invalid dates, received: "${errorText}"`);
  }
  console.log('[PASS] TC-E2E-04: UI prevents search when checkout date is before checkin date.');
}

module.exports = runSearchTests;

