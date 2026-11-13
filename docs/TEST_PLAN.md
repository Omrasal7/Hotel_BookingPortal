# Thomas Cook Hotel Booking Portal — Test Automation Strategy & Master Test Plan

| Project | Thomas Cook Hotel Booking Portal |
| :--- | :--- |
| **Role Applied** | Automation Engineer Intern |
| **Company** | Thomas Cook (India) Limited |
| **Document Version** | 1.0.0 (Release Candidate) |
| **Frameworks** | Selenium WebDriver (JavaScript POM), Jest, Supertest, Postman |
| **Author** | QA / Automation Engineering Candidate |

---

## 1. Executive Summary & Objective

The primary objective of this Test Plan is to define the testing strategy, test automation architecture, scope, methodologies, and quality gates for the **Thomas Cook Hotel Booking Portal**. 

As an **Automation Engineer**, the goal is to guarantee software quality, verify business logic correctness (pricing calculation, date boundaries, room availability tracking, and cancellations), and provide repeatable, high-speed automated regression test suites at both the **REST API level** and the **End-to-End Browser UI level**.

---

## 2. Scope of Testing

### 2.1 In-Scope Items
- **Hotel Browsing & Discovery**:
  - Listing verification of 5+ sample hotels with complete attributes (description, location, amenities, price per night).
  - Search filtering by destination keyword (case-insensitive substring matching).
- **Date & Pricing Validation Rules**:
  - Validation that check-in date is not in the past (`check_in >= today`).
  - Validation that check-out date is strictly after check-in (`check_out > check_in`, min 1 night).
  - Backend calculation of total booking amount (`nights * price_per_night`).
  - **Surprise Feature**: 10% Thomas Cook Long-Stay Loyalty Discount for stays >= 4 nights.
- **Inventory & Room Availability Management**:
  - Accurate calculation of overlapping stays:  
    $$\text{Overlap} \iff \text{existing.check\_in} < \text{requested.check\_out} \land \text{existing.check\_out} > \text{requested.check\_in}$$
  - Prevention of bookings beyond maximum hotel room capacity (Sold-out boundary).
  - Real-time room release upon booking cancellation.
- **Booking Lifecycle**:
  - Unique booking reference code generation (`TC-HB-XXXXXX`).
  - Booking lookup by reference code and case-insensitive email.
  - Cancellation through the management flow and cancellation timestamping.
- **Known Inventory Limitation**:
  - Capacity is checked for sequential requests. Simultaneous requests may both pass the check; this behavior is not covered by the current automated tests.

### 2.2 Out-of-Scope Items
- Credit card / payment gateway processing (as stated in assignment brief).
- User authentication / role-based admin dashboard.
- Third-party hotel GDS (Global Distribution System) feeds.

---

## 3. Test Automation Pyramid & Framework Architecture

The testing strategy adheres strictly to the **Agile Test Automation Pyramid**:

```
        / \
       /   \        E2E UI Automation (Selenium WebDriver + POM)
      / UI  \       - 13 E2E Scenarios (Search, Booking, Cancel, Boundary)
     /-------\
    /   API   \     REST API & Integration Tests (Jest + Supertest)
   /  Testing  \    - 23 Automated API & Logic Tests + Postman Suite
  /-------------\
 /  Unit Tests   \  Pricing & Date Utility Functions
/_________________\
```

### 3.1 Selenium WebDriver E2E Framework (Page Object Model)
- **Design Pattern**: Page Object Model (POM) separating page element locators and user actions from test assertion specs.
  - `BasePage.js`: Driver management, dynamic explicit waits (`until.elementLocated`), screenshot capture on failure.
  - `HomePage.js`: Search bar, destination dropdown, hotel cards, navigation.
  - `BookingModalPage.js`: Guest inputs, stay dates, real-time price summary calculation.
  - `ConfirmationModalPage.js`: Booking reference code extraction and verification.
  - `ManageBookingPage.js`: Reference + email lookup and cancellation workflow.
- **Testability Locator Strategy**: Key interactive controls use `data-testid` attributes (e.g., `data-testid="btn-confirm-booking"`) so tests do not depend only on styling selectors.
- **Execution Modes**: Supports interactive headed mode for demonstration and headless mode (`--headless=new`) for headless CI/CD execution.

### 3.2 API Automation & Postman Collection
- Automated API test suite built with **Jest & Supertest** executing against live Express routes.
- Fully exported **Postman Collection** (`Thomas_Cook_Hotel_Booking_API.postman_collection.json`) with pre-request scripts, environment variable chaining, and assertions (`pm.test()`).

---

## 4. Test Environment & Tools Matrix

| Layer | Tool / Library | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Web Browser** | Google Chrome | v120+ / Latest | Target browser for E2E testing |
| **Web Automation** | Selenium WebDriver | v4.27.0 | Automated browser test execution |
| **API Testing** | Jest + Supertest | v29.7.0 / v7.0.0 | REST API automated verification |
| **Manual & API Testing** | Postman | v10+ | API exploratory testing & collection runner |
| **CI/CD** | GitHub Actions | v4 | Automated test pipeline on PR / Push |
| **Test Design** | BVA & Equivalence Partitioning | — | Test design techniques |

---

## 5. Defect Severity & Priority Classification

Defects identified during automated and exploratory testing are categorized as:
- **Critical (P1/S1)**: Overbooking beyond capacity, incorrect pricing calculation, inability to confirm booking.
- **Major (P2/S2)**: Date validation failure (allowing past check-in), cancellation not releasing availability.
- **Minor (P3/S3)**: UI alignment inconsistency, typo in destination travel tip.

---

## 6. Exit Criteria for Release

1. Critical booking, pricing, and validation scenarios pass in the relevant suites.
2. The 23 Jest and Supertest API and booking logic tests pass.
3. The Selenium WebDriver scenarios pass in the mode being used for evaluation.
4. Known limitations, including simultaneous booking behavior, are documented accurately for the evaluator.

