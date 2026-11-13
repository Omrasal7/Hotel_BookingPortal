# Thomas Cook Hotel Booking Portal - System Design & Quality Architecture

| Document | DESIGN.md |
| :--- | :--- |
| **Candidate Role** | Automation Engineer Intern |
| **Company** | Thomas Cook (India) Limited |
| **Stack** | Node.js (Express), React (Vite), SQLite / MySQL, Selenium WebDriver, Jest, Supertest |

---

## 1. System Architecture

The portal has a React frontend, an Express API, and a relational database. In local development, Vite serves the frontend on port 5173 and proxies `/api` requests to the backend on port 5000.

```text
[ React / Vite frontend ]
           | JSON over HTTP
           v
[ Express API: routes and controllers ]
           | parameterized SQL
           v
[ SQLite by default; optional MySQL ]
```

The frontend handles hotel search, date selection, price display, and booking modals. It calls the API through the service functions in `frontend/src/services/api.js`. Key controls have `data-testid` attributes for Selenium tests.

The API routes requests to hotel or booking controllers. The controllers validate input and use the models for database queries. Date validation, price calculation, destination advisories, and booking-reference generation are in `backend/src/utils/dateUtils.js`. Booking prices are calculated on the server; the browser does not submit a total price.

SQLite is the default local database. If `DB_DIALECT=mysql` is configured, the application attempts to connect to MySQL and falls back to SQLite if that connection fails. The MySQL schema is in `backend/database/schema.sql`; the SQLite schema is initialized in `backend/src/config/db.js`.

The repository includes Jest and Supertest API/unit tests, a JavaScript Selenium suite, and a Python Selenium suite. The UI also has a QA mode with sample guest details to make manual and automated test runs easier.

---

## 2. Database Design & Relationships

The schema has two core tables: `hotels` and `bookings`. A hotel can have many bookings, and each booking refers to one hotel. Each booking request in the current API is for one room.

```text
hotels.id (primary key)  1 ---- many  bookings.hotel_id (foreign key)
```

### `hotels`

The hotel row stores its name, location, description, amenities, nightly price, total room count, rating, image URL, and creation time. The MySQL schema uses JSON for amenities and has an index on location.

### `bookings`

A booking stores its unique reference, hotel ID, guest name and email, check-in and check-out dates, number of nights, base amount, discount amount, total amount, status, creation time, and optional cancellation time.

### Constraints and indexes

- `booking_reference` is unique.
- `hotel_id` references `hotels.id` with `ON DELETE RESTRICT`. A hotel cannot be deleted while any booking row refers to it, including a cancelled booking.
- MySQL defines `idx_ref_email` on `(booking_reference, guest_email)` and `idx_hotel_dates` on `(hotel_id, status, check_in_date, check_out_date)`.
- The MySQL schema uses `DECIMAL` for prices and an `ENUM` for booking status. The SQLite initializer uses `REAL` for prices and `TEXT` for status, and does not define all the same indexes.
- Date ordering and price arithmetic are checked in application code. The database schema does not define CHECK constraints for date order or amount reconciliation.

---

## 3. REST API Design

The API is mounted under `/api`. Responses are JSON. Successful responses generally include `success` and `data`; errors include `success` and `message`. The optional `errors` array appears on some input-validation responses, but is not present in every error response.

| Method | Endpoint | Purpose | Success code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Return service health and active database dialect. | `200 OK` |
| `GET` | `/api/hotels` | List hotels, optionally filtered by location and stay dates. | `200 OK` |
| `GET` | `/api/hotels/:id` | Return one hotel's details and optional date availability. | `200 OK` |
| `POST` | `/api/bookings/quote` | Validate dates and return a price quote and current availability. | `200 OK` |
| `POST` | `/api/bookings` | Validate and create a booking for one room. | `201 Created` |
| `POST` | `/api/bookings/retrieve` | Find a booking by reference and guest email. | `200 OK` |
| `POST` | `/api/bookings/:id/cancel` | Cancel a confirmed booking. The UI sends the booking reference and email. | `200 OK` |

Invalid input and unavailable dates return `400`; missing hotels or bookings return `404`; unexpected errors return `500`. The cancel controller also permits an ID-only lookup if the reference and email are not both included. That behavior is a security limitation and should not be treated as the intended authorization flow.

---

## 4. Booking Logic & Availability

### Date validation

The API expects dates in `YYYY-MM-DD` format. Check-in cannot be before the server's local current date, and check-out must be later than check-in, giving at least one night. The number of nights is the difference between the two parsed dates. The code uses JavaScript `Date` parsing and does not round-trip the date components, so an impossible calendar date may be normalized rather than rejected.

### Price calculation

The backend calculates the base amount as nightly price multiplied by nights. Stays of four or more nights get a 10% discount. It rounds amounts to two decimal places and returns the base amount, discount amount, discount reason, and total. The booking endpoint calculates the price again when it creates the booking.

### Availability

A confirmed booking overlaps the requested stay when its check-in is before the requested check-out and its check-out is after the requested check-in. This treats check-out as an unused night, so one guest can check out on the day the next guest checks in.

The model counts confirmed booking rows that overlap any part of the requested range, then subtracts that count from the hotel's `total_rooms`. Cancelled bookings are excluded. This simple count can report too few rooms when existing bookings overlap different parts of a longer requested stay; it does not calculate peak occupancy day by day.

The availability check and booking insert are separate operations. The application checks capacity for sequential requests, but it does not guarantee capacity if requests arrive at the same time. Two requests for the last room could both pass the check before either insert completes.

### Cancellation

Cancellation changes a confirmed booking to `CANCELLED` and records `cancelled_at`. Availability queries count only `CONFIRMED` bookings, so the cancelled booking no longer reduces the displayed availability. A conditional update prevents a second successful cancellation of the same booking.

---

## 5. Surprise Features

### Long-stay discount

Stays of four nights or more receive a 10% discount. The backend calculates the discount and includes its reason in the quote. The price breakdown is shown in the booking modal. The pricing helper is covered by Jest tests, including the four-night threshold.

### Destination advisory

Hotel responses include a destination advisory with a climate description and a packing or activity suggestion for supported cities. These values are a hard-coded lookup in `dateUtils.js`; they are not live weather data.

### Cancellation behavior

Guests can cancel a confirmed booking through Manage Booking. Cancellation changes its status and removes it from availability counts. The project does not process refunds or enforce a cancellation deadline.

---

## 6. Simultaneous Bookings

The current implementation checks availability and then inserts a booking as separate database operations, without an atomic reservation step. If two users submit requests for the last available room at the same time, both may see the room as available and both may be confirmed.

The API test that fills a hotel's rooms sends requests sequentially and verifies that the next request is rejected. It checks the capacity boundary for sequential requests; it does not test simultaneous requests or prevent the race described above.

---

## 7. Design Decisions & Trade-offs

| Decision | Alternative considered | Reason and trade-off |
| :--- | :--- | :--- |
| React frontend with an Express JSON API | A server-rendered application | Keeps browser interaction and API logic separate. The frontend must handle loading and API errors. |
| SQLite by default with optional MySQL | MySQL required for every run | Makes local setup simpler. The fallback can hide a MySQL connection problem, and the two schemas are not identical. |
| Hotel-level `total_rooms` count | Individual room records or per-date inventory | Keeps the example small, but does not support room types, room assignment, or precise occupancy calculations. |
| Selenium Page Object Model | Selectors repeated in each test | Keeps page locators separate from test steps. Page objects still need updates when the UI changes. |
| `data-testid` attributes on key controls | CSS classes or XPath selectors | Separates many test selectors from styling, but the attributes still need consistent coverage and maintenance. |

---

## 8. Limitations & Future Improvements

The current project demonstrates search, quotes, one-room bookings, retrieval, cancellation, and automated tests. Before using it as a production booking service, I would address these gaps:

1. Make date validation reject impossible calendar dates and define the business timezone.
2. Make inventory handling safe for simultaneous requests and calculate occupancy more precisely for different stay ranges.
3. Require verified booking identity for cancellations. The current ID-only fallback should not be used in production.
4. Add a cancellation deadline and refund process only if the product needs that policy.
5. Align the SQLite and MySQL schemas and add migrations and database constraints.
6. Add room categories, multi-room booking, customer accounts, payments, confirmation emails, and operational monitoring as the product needs them.
7. Replace static destination tips with maintained content and identify when the information was last updated.
8. Add load and cross-browser testing as separate test improvements; current automated tests do not cover those areas.
