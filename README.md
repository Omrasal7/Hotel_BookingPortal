# Thomas Cook Hotel Booking Portal:

> **Assignment Submission for:** Automation Engineer Intern  
> **Company:** Thomas Cook (India) Limited  
> **Candidate Focus:** Quality Assurance & Test Automation Engineering (Selenium WebDriver, REST API Testing, Postman, CI/CD)  
> **Effort Spent:** ~14 hours (Design, Architecture, Web App, Page Object Model Selenium Framework, API Test Suite, Postman Collection, CI/CD Pipeline, and STLC Documentation)


---
## Screenshot
<img width="1920" height="930" alt="image" src="https://github.com/user-attachments/assets/fa1b0174-8c40-4318-b712-83066c07ccd1" />

---
<img width="1920" height="924" alt="image" src="https://github.com/user-attachments/assets/28d7cb59-56a4-4883-9ea5-a4920373cfa1" />

---

<img width="1920" height="973" alt="image" src="https://github.com/user-attachments/assets/2c052ead-9944-4081-b5b5-87090920aa8f" />

---

<img width="1588" height="842" alt="image" src="https://github.com/user-attachments/assets/a9a5e7ff-e58a-4d25-a66a-c2207d8a916f" />

---

<img width="1053" height="546" alt="image" src="https://github.com/user-attachments/assets/1e8fde46-0b03-4b1d-a785-be8452a15bbf" />

---

<img width="920" height="827" alt="image" src="https://github.com/user-attachments/assets/8eb3d769-e274-499f-bbb2-89703292ece9" />

---

## 🌟 Project Highlights for Automation Engineer Evaluators

This project is built with a primary emphasis on **Software Quality Assurance and Test Automation Engineering**:
1. **Full Automation Test Coverage**:
   - **Selenium WebDriver (JavaScript POM)**: 13 End-to-End browser test scenarios covering the full user booking journey, search, date validation edge cases, and cancellation.
   - **Jest + Supertest API Suite**: 23 automated integration & logic test cases validating status codes, contract schemas, price calculations, and overbooking prevention.
   - **Postman API Test Suite**: Fully exported collection with environment variables and assertions (`pm.test()`).
2. **Design For Testability (DFT)**:
   - All interactive UI elements are instrumented with standardized `data-testid` attributes.
   - Dedicated **QA Mode toggle button** in the UI navigation bar highlighting test locators and providing one-click test data injection.
3. **Continuous Integration (CI/CD)**:
   - Pre-configured GitHub Actions workflow (`.github/workflows/test-automation.yml`) executing API tests and headless Selenium runs on PR/push.
4. **Complete STLC Documentation**:
   - Master Test Plan (`docs/TEST_PLAN.md`), Detailed Test Cases Matrix (`docs/TEST_CASES.md`), and Defect Reports (`docs/BUG_REPORT_SAMPLE.md`).

---

## 🎬 Demo & Workflow Video

- Test case walkthrough: https://drive.google.com/file/d/1EC1SSPtbw2Tq1Sw3h020jXlKXfWZrq_j/view?usp=sharing
- Workflow illustration: https://drive.google.com/file/d/19oPFjwmvXWJgtg4ROF-hkgkcZyK2VRuG/view?usp=sharing

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React (Vite), Lucide Icons, Vanilla CSS Design System
- **Database**: MySQL 8.0 (with automatic embedded SQLite fallback for instant zero-config evaluation)
- **E2E Automation**: Selenium WebDriver 4.x (Chrome), Page Object Model (POM)
- **API Automation**: Jest, Supertest, Postman Collection
- **CI/CD Pipeline**: GitHub Actions

---

## 🚀 Quick Start Guide (Run Locally)

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later
- [Google Chrome](https://www.google.com/chrome/) installed
- (Optional) MySQL Server 8.0+

---

### Step 1: Install Dependencies
From the project root directory, install all required dependencies:

```bash
# 1. Install root dependencies (concurrently)
npm install

# 2. Install backend dependencies
cd backend && npm install && cd ..

# 3. Install frontend dependencies
cd frontend && npm install && cd ..

# 4. Install automation test dependencies
cd automation-tests && npm install && cd ..
```

### Step 2: Database Configuration (MySQL or Instant SQLite)

#### Option A: Instant Zero-Config SQLite (Default - Recommended for fast grading)
No database setup is required! The backend automatically initializes and seeds 6 sample hotels into an embedded SQLite database on first launch.

#### Option B: MySQL 8.0 Setup (If evaluating with MySQL)
1. Ensure your MySQL service is running.
2. Create the database and import schema and sample seed data:
   ```bash
   mysql -u root -p < backend/database/schema.sql
   mysql -u root -p < backend/database/seed.sql
   ```
3. Update `backend/.env` with your MySQL credentials:
   ```env
   DB_DIALECT=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=hotel_booking_db
   ```
4. Or run the migration script: `npm run db:init`

---


### Step 3: Run the Application

From the root directory, start both the backend API (port 5000) and frontend (port 5173) simultaneously:

```bash
npm start
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Hotels REST API**: [http://localhost:5000/api/hotels](http://localhost:5000/api/hotels)

---


## 🧪 Running Automated Test Suites

### 1. Run REST API & Business Logic Automated Tests (Jest)
Runs 23 automated tests covering date boundary validation, pricing logic, discount calculations, booking creation, retrieval, cancellation, and overbooking prevention:

```bash
npm run test:api
```

To view code coverage:
```bash
npm run test:api:coverage
```


---

### 2. Run Selenium WebDriver End-to-End Tests

Ensure the application is running (`npm start`), then open a new terminal:

#### 🐍 A. Python Selenium WebDriver Suite (PyTest + POM + Visual HTML Report)
```bash
# Run headless (Fast, generates reports/test_execution_report.html)
npm run test:python

# Or run directly with Python:
cd automation-tests-python
python run_tests.py

# Run in headed mode (watch Chrome open and execute live):
set HEADLESS=false && python run_tests.py
```
*After running, open `automation-tests-python/reports/test_execution_report.html` in your browser to view the visual execution report with pass/fail charts!*

#### 🌐 B. JavaScript Selenium WebDriver Suite (Optional Alternative)
```bash
npm run test:e2e
npm run test:e2e:headless
```

---

### 3. Run All Tests Combined
```bash
npm run test:all
```


---

### 4. Running Postman API Collection
1. Open Postman.
2. Click **Import** and select the two files in the `postman/` folder:
   - `postman/Thomas_Cook_Hotel_Booking_API.postman_collection.json`
   - `postman/Thomas_Cook_Hotel_Booking_Env.postman_environment.json`
3. Select the **Thomas Cook Local Environment**.
4. Click **Run Collection** to execute all requests with built-in assertions.

---

## 📁 Repository Structure

```
Hotelbooking_portal/
├── backend/
│   ├── database/
│   │   ├── schema.sql             # MySQL DDL schema
│   │   ├── seed.sql               # Sample seed data for 6 hotels
│   │   └── initDb.js              # Migration runner
│   ├── src/
│   │   ├── config/db.js           # Multi-dialect database adapter (MySQL + SQLite)
│   │   ├── controllers/           # hotelController & bookingController
│   │   ├── models/                # Data queries & availability algorithms
│   │   ├── routes/                # Express API routes
│   │   ├── utils/dateUtils.js     # Date validations, pricing, discount calculations
│   │   └── app.js                 # Express application export
│   ├── tests/
│   │   ├── api.test.js            # REST API integration tests (Supertest)
│   │   └── bookingLogic.test.js   # Unit tests for pricing & date rules
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # React UI components (SearchBar, HotelCard, etc.)
│   │   ├── services/api.js        # REST client services
│   │   ├── App.jsx
│   │   └── App.css
│   ├── index.html
│   └── vite.config.js
├── automation-tests/              # Selenium WebDriver Test Framework
│   ├── config/selenium.config.js  # Chrome configuration & options
│   ├── pages/                     # Page Object Model (POM) classes
│   │   ├── BasePage.js
│   │   ├── HomePage.js
│   │   ├── BookingModalPage.js
│   │   ├── ConfirmationModalPage.js
│   │   └── ManageBookingPage.js
│   ├── specs/                     # Test scenario specifications
│   │   ├── 01_hotel_search.spec.js
│   │   ├── 02_booking_flow.spec.js
│   │   ├── 03_validation_edge_cases.spec.js
│   │   └── 04_booking_cancellation.spec.js
│   ├── reports/                   # Execution reports and failure screenshots
│   └── run-selenium-tests.js      # Main test runner
├── postman/                       # Postman test collection & environment
├── docs/
│   ├── TEST_PLAN.md               # Master Test Plan following IEEE 829 standards
│   ├── TEST_CASES.md              # Detailed Test Cases & Traceability Matrix (28 cases)
│   ├── BUG_REPORT_SAMPLE.md       # Professional defect reports caught during testing
│   └── AUTOMATION_FRAMEWORK.md    # Framework architecture & POM design guide
├── .github/workflows/
│   └── test-automation.yml        # GitHub Actions CI/CD workflow
├── DESIGN.md                      # Comprehensive System Design document
├── README.md                      # Project setup & execution guide
└── package.json                   # Root package configuration
```

---

## 🎁 Surprise Feature: Thomas Cook "Flexi-Stay" & Dynamic Loyalty Engine

1. **Dynamic Long-Stay Loyalty Discount**: Bookings of 4 or more nights automatically qualify for a **10% Thomas Cook loyalty discount**, calculated and itemized transparently on the backend and frontend.
2. **Destination Weather & Travel Packing Advisory**: Displays seasonal climate insights and packing tips tailored for each city (e.g. Goa, Jaipur, Manali, Munnar).
3. **48-Hour Free Cancellation Guarantee**: Explicit assurance window with one-click cancellation and instant inventory restoration.

---

## ⏱️ Time Spent & Unfinished Items

- **Approximate Time Spent**: ~10 Hours
  - Architecture & Database Setup: 2 hours
  - Backend REST API & Validation Engine: 3 hours
  - Frontend React UI & Design System: 1 hours
  - Selenium WebDriver POM Automation Suite: 2 hours
  - Jest & Postman API Automation Suites: 1.5 hours
  - Documentation (Test Plan, Test Cases, Design, Bug Reports): 1 hours

- **Unfinished Items (Deferred for future iterations)**:
  - Multi-room booking support in a single order (currently 1 room per booking as permitted).
  - Cross-browser grid testing on Firefox/Safari (currently configured for Google Chrome).
  - Automated PDF receipt generation.

---


## 📝 Disclosures

AI developer tools (Google Gemini / Antigravity) were utilized for code scaffolding, boilerplate setup, and test case ideation. All architectural decisions, testing logic, validation boundaries, and edge cases were authored, reviewed, and verified by the candidate.

