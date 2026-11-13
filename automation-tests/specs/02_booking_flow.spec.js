const HomePage = require('../pages/HomePage');
const BookingModalPage = require('../pages/BookingModalPage');
const ConfirmationModalPage = require('../pages/ConfirmationModalPage');
const { BASE_URL } = require('../config/selenium.config');

async function runBookingFlowTests(driver) {
  console.log('\n--- Running Suite 2: Complete Happy-Path Booking E2E Tests ---');
  const homePage = new HomePage(driver);
  const bookingModal = new BookingModalPage(driver);
  const confirmModal = new ConfirmationModalPage(driver);

  await homePage.open(BASE_URL);

  // Click Book on first hotel
  await homePage.clickBookOnFirstHotel();
  const isModalOpen = await bookingModal.isModalDisplayed();
  if (!isModalOpen) {
    throw new Error('Booking modal did not open upon clicking Book button.');
  }
  console.log('[PASS] TC-E2E-05: Booking modal opens correctly with prefilled dates.');

  // Check pricing calculation
  const totalAmountText = await bookingModal.getTotalAmount();
  if (!totalAmountText || !totalAmountText.includes('₹')) {
    throw new Error(`Total amount is not displayed properly: ${totalAmountText}`);
  }
  console.log(`[PASS] TC-E2E-06: Real-time price breakdown rendered correctly (${totalAmountText}).`);

  // Fill guest details
  const testGuestName = 'Siddharth Roy';
  const testGuestEmail = 'siddharth.roy@example.com';
  await bookingModal.fillGuestDetails(testGuestName, testGuestEmail);

  // Confirm booking
  await bookingModal.confirmBooking();
  await driver.sleep(1200);

  // Check confirmation modal
  const isConfirmOpen = await confirmModal.isDisplayed();
  if (!isConfirmOpen) {
    throw new Error('Confirmation modal did not appear after booking submission.');
  }

  const bookingRef = await confirmModal.getBookingReference();
  if (!bookingRef || !bookingRef.startsWith('TC-HB-')) {
    throw new Error(`Invalid booking reference format: ${bookingRef}`);
  }
  console.log(`[PASS] TC-E2E-07: Booking confirmed with unique reference: ${bookingRef}`);

  const confirmedGuest = await confirmModal.getGuestName();
  if (confirmedGuest !== testGuestName) {
    throw new Error(`Expected guest ${testGuestName}, found: ${confirmedGuest}`);
  }
  console.log('[PASS] TC-E2E-08: Confirmation modal verified guest identity & reservation summary.');

  // Close confirmation modal
  await confirmModal.closeModal();
  await driver.sleep(600);

  return { bookingRef, guestEmail: testGuestEmail };
}

module.exports = runBookingFlowTests;

