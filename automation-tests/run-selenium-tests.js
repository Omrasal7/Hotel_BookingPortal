const { createDriver } = require('./config/selenium.config');
const runSearchTests = require('./specs/01_hotel_search.spec');
const runBookingFlowTests = require('./specs/02_booking_flow.spec');
const runValidationEdgeCases = require('./specs/03_validation_edge_cases.spec');
const runCancellationTests = require('./specs/04_booking_cancellation.spec');

async function main() {
  console.log('================================================================');
  console.log('  THOMAS COOK HOTEL BOOKING PORTAL - E2E TEST AUTOMATION SUITE  ');
  console.log('  Role Focus: Automation Engineer Intern (Selenium WebDriver)    ');
  console.log('================================================================');

  let driver = null;
  const startTime = Date.now();
  let passedCount = 0;
  let failedCount = 0;

  try {
    console.log('Initializing Chrome Selenium WebDriver...');
    driver = await createDriver();
    console.log('WebDriver initialized successfully.');

    // Suite 1: Search & Date Validation
    await runSearchTests(driver);
    passedCount += 4;

    // Suite 2: Booking Happy Path
    const { bookingRef, guestEmail } = await runBookingFlowTests(driver);
    passedCount += 4;

    // Suite 3: Validation Edge Cases & Surprise Feature
    await runValidationEdgeCases(driver);
    passedCount += 2;

    // Suite 4: Retrieval & Cancellation Flow
    await runCancellationTests(driver, bookingRef, guestEmail);
    passedCount += 3;

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n================================================================');
    console.log('                 AUTOMATION TEST RUN SUMMARY                    ');
    console.log('================================================================');
    console.log(`Total Test Scenarios Executed : ${passedCount + failedCount}`);
    console.log(`Passed                        : ${passedCount}`);
    console.log(`Failed                        : ${failedCount}`);
    console.log(`Execution Time                : ${duration}s`);
    console.log('Verdict                       : ALL AUTOMATION TESTS PASSED! ✅');
    console.log('================================================================\n');

    process.exit(0);
  } catch (err) {
    failedCount++;
    console.error('\n❌ AUTOMATION TEST FAILURE OCCURRED:');
    console.error(err.message);

    if (driver) {
      try {
        const BasePage = require('./pages/BasePage');
        const bp = new BasePage(driver);
        const screenshotPath = await bp.captureScreenshot(`failure_${Date.now()}`);
        console.log(`📸 Failure screenshot saved at: ${screenshotPath}`);
      } catch (screenshotErr) {
        console.error('Failed to capture failure screenshot:', screenshotErr.message);
      }
    }

    process.exit(1);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

main();

