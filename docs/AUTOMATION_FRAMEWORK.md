# Selenium WebDriver Test Automation Framework Guide

## 1. Overview
This automation framework is built using **Python (PyTest + Selenium WebDriver)** alongside **JavaScript/Node.js**, designed around the **Page Object Model (POM)** architectural pattern. It delivers robust, maintainable, and resilient UI automation tests for the **Thomas Cook Hotel Booking Portal**.

---

## 2. Directory Layout & Architecture (Python Framework)

```
automation-tests-python/
├── pages/                       # Page Object Model classes
│   ├── base_page.py             # Reusable explicit waits, React safe date input, screenshot capture
│   ├── home_page.py             # Search, filter, listing locators & actions
│   ├── booking_modal_page.py    # Booking form, date pickers, price assertions
│   ├── confirmation_modal_page.py # Reference code verification
│   └── manage_booking_page.py   # Retrieval and cancellation actions
├── tests/                       # PyTest Test Specifications
│   ├── conftest.py              # Pytest fixtures (WebDriver lifecycle, headless toggle, screenshot hooks)
│   ├── test_hotel_search.py     # Search, filters, date boundary validation
│   ├── test_booking_flow.py     # End-to-end happy path booking
│   ├── test_pricing_discount.py # 10% Long-Stay discount surprise feature
│   └── test_cancellation.py     # Booking lookup, unauthorized email check, cancellation
├── reports/                     # Visual HTML execution reports & failure screenshots
│   └── test_execution_report.html
├── pytest.ini                   # PyTest configuration
├── requirements.txt             # Python dependencies (selenium, pytest, pytest-html)
└── run_tests.py                 # Runner script with colored terminal output
```

---

## 3. Key Design Patterns & Engineering Highlights

### 3.1 Page Object Model (POM)
- Web elements and user interactions are encapsulated within Page classes.
- Test specs contain zero raw XPath or CSS selectors; they interact with clean domain methods like `homePage.searchHotels('Goa')` and `bookingModal.confirmBooking()`.

### 3.2 Robust Synchronization (Explicit Dynamic Waits)
- Avoids fragile `Thread.sleep` / fixed timeouts.
- Uses Selenium's `until.elementLocated()` and `until.elementIsVisible()` in `BasePage.js` to wait dynamically for DOM mutations and React asynchronous state re-renders.

### 3.3 Testability & Locator Strategy
- Standardized `data-testid` attributes are integrated directly into React components (e.g. `data-testid="input-search-location"`, `data-testid="btn-confirm-booking"`).
- Tests are decoupled from visual styling changes (class names or layout restructuring).

### 3.4 Automated Screenshot Capture on Failure
- If any assertion or interaction fails, `BasePage.captureScreenshot(testName)` captures the exact browser viewport state and stores it in `automation-tests/reports/screenshots/` for immediate debugging.

---

## 4. Execution Commands

### Prerequisites
- Node.js v18+
- Google Chrome browser installed
- Both Backend (`http://localhost:5000`) and Frontend (`http://localhost:5173`) running.

### 1. Run in Interactive Headed Mode (Watch browser execute)
```bash
cd automation-tests
npm run test:e2e
```

### 2. Run in Headless Mode (For CI/CD Pipelines)
```bash
cd automation-tests
npm run test:e2e:headless
```

### 3. From Project Root
```bash
# Run Backend API tests and the Python Selenium E2E suite
npm run test:all
```


