const HomePage = require('../pages/HomePage');
const ManageBookingPage = require('../pages/ManageBookingPage');
const { BASE_URL } = require('../config/selenium.config');

async function runCancellationTests(driver, bookingRef, guestEmail) {
  console.log('\n--- Running Suite 4: Booking Retrieval & Cancellation E2E Tests ---');
  const homePage = new HomePage(driver);
  const managePage = new ManageBookingPage(driver);

  await homePage.open(BASE_URL);
  await homePage.openManageBookingModal();

  const isModalOpen = await managePage.isDisplayed();
  if (!isModalOpen) {
    throw new Error('Manage booking modal failed to open.');
  }

  // Test 1: Negative lookup with invalid email
  await managePage.lookupBooking(bookingRef, 'wrong@example.com');
  await driver.sleep(600);
  const isErr = await managePage.isElementPresent(managePage.errorBanner);
  if (!isErr) {
    throw new Error('Expected error message for mismatched email during lookup.');
  }
  console.log('[PASS] TC-E2E-11: Retrieval securely rejects unauthorized email.');

  // Test 2: Successful retrieval with valid reference & email
  await managePage.lookupBooking(bookingRef, guestEmail);
  await driver.sleep(800);
  const isFound = await managePage.isResultDisplayed();
  if (!isFound) {
    throw new Error('Valid booking was not retrieved.');
  }
  const isConfirmed = await managePage.isStatusConfirmed();
  if (!isConfirmed) {
    throw new Error('Expected retrieved booking status to be CONFIRMED.');
  }
  console.log('[PASS] TC-E2E-12: Successfully retrieved booking record in CONFIRMED state.');

  // Test 3: Cancel reservation and verify status changes to CANCELLED
  await managePage.cancelBooking();
  await driver.sleep(1000);

  const isCancelled = await managePage.isStatusCancelled();
  if (!isCancelled) {
    throw new Error('Booking status did not change to CANCELLED after cancellation.');
  }
  console.log('[PASS] TC-E2E-13: Booking successfully cancelled and marked CANCELLED in real-time.');

  await managePage.closeModal();
  await driver.sleep(600);
}

module.exports = runCancellationTests;

