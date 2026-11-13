# Thomas Cook Hotel Booking Portal — System Design & Quality Architecture Document

| Document | DESIGN.md |
| :--- | :--- |
| **Candidate Role** | Automation Engineer Intern |
| **Company** | Thomas Cook (India) Limited |
| **Stack** | Node.js (Express), React (Vite), MySQL / SQLite, Selenium WebDriver, Jest, Supertest |

---

## 1. System Architecture

The application is structured into a clean three-tier architecture with a strong focus on separation of responsibilities, contract testability, and automated validation:

```
[ Client Layer (React / Vite) ]
         │
         │  REST / JSON (Port 5173 -> Proxy -> Port 5000)
         ▼
[ Application Layer (Node.js / Express REST API) ]
  ├── Routing Layer (/api/hotels, /api/bookings, /api/health)
  ├── Validation & Pricing Engine (dateUtils.js)
  ├── Business Logic Controllers (hotelController.js, bookingController.js)
  └── Data Access Layer (hotelModel.js, bookingModel.js)
         │
         │  SQL Queries & Parameterized Statements
         ▼
[ Persistence Layer (MySQL 8.0 / Embedded SQLite Fallback) ]
  ├── hotels (Properties, Capacity, Amenities JSON, Base Pricing)
  └── bookings (Confirmed & Cancelled Reservations, References, Dates)
```

### How the Components Interact:
1. **Frontend (React)**: Handles user interaction, date selections, client-side input formatting, dynamic price previews, and modal state management. Interactive DOM elements are tagged with `data-testid` attributes to maximize automated testability with Selenium WebDriver.
2. **Backend (Node.js & Express REST API)**: Validates input integrity, performs atomic availability calculations, computes pricing strictly server-side (preventing price tampering), and manages state transitions.
3. **Database (MySQL)**: Stores relational data with foreign key constraints, unique reference indexes, and date range indexes. For zero-friction evaluation and test execution, an embedded SQLite adapter is also provided that boots instantly if MySQL is not initialized.
4. **Automated Test Harness**:
   - **Jest + Supertest**: Verifies API status codes, response schemas, and availability algorithms.
   - **Selenium WebDriver (POM)**: Drives Chrome to validate full end-to-end user journeys (Search -> Reserve -> Confirm -> Retrieve -> Cancel).

---

## 2. Database Design & Relationships

The database is designed with two core entities: `hotels` and `bookings`.

```
┌─────────────────────────────────┐           ┌───────────────────────────────────┐
│             hotels              │           │             bookings              │
├─────────────────────────────────┤           ├───────────────────────────────────┤
│ id (INT PK AUTO_INCREMENT)      │1         *│ id (INT PK AUTO_INCREMENT)        │
│ name (VARCHAR 255)              ├───────────┤ hotel_id (INT FK -> hotels.id)    │
│ location (VARCHAR 100)          │           │ booking_reference (VARCHAR UNIQUE)│
│ description (TEXT)              │           │ guest_name (VARCHAR 150)          │
│ amenities (JSON / TEXT)         │           │ guest_email (VARCHAR 150)         │
│ room_price_per_night (DECIMAL)  │           │ check_in_date (DATE)              │
│ total_rooms (INT)               │           │ check_out_date (DATE)             │
│ rating (DECIMAL 2,1)            │           │ total_nights (INT)                │
│ image_url (VARCHAR 500)         │           │ base_amount (DECIMAL 10,2)        │
│ created_at (TIMESTAMP)          │           │ discount_amount (DECIMAL 10,2)    │
└─────────────────────────────────┘           │ total_amount (DECIMAL 10,2)       │
                                              │ status (ENUM: CONFIRMED,CANCELLED)│
                                              │ created_at (TIMESTAMP)           │
                                              │ cancelled_at (DATETIME NULL)      │
                                              └───────────────────────────────────┘
```

### Constraints & Indexes:
- `booking_reference`: Enforced as `UNIQUE` to prevent colliding reservation codes.
- `hotel_id`: Foreign key reference to `hotels.id` with `ON DELETE RESTRICT` ensuring hotel records with active bookings cannot be accidentally orphaned.
- Composite Index `idx_hotel_dates` on `(hotel_id, status, check_in_date, check_out_date)` enables high-speed evaluation of overlapping stays.
- Index `idx_ref_email` on `(booking_reference, guest_email)` for fast booking retrieval.

---

## 3. REST API Design

All endpoints follow RESTful conventions and return standardized JSON responses:

| Method | Endpoint | Description | Request Body / Query Params | Success Code |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status probe | None | `200 OK` |
| `GET` | `/api/hotels` | Browse and filter hotels | `?location=Goa&checkInDate=...&checkOutDate=...` | `200 OK` |
| `GET` | `/api/hotels/:id` | View hotel details & availability | `?checkInDate=...&checkOutDate=...` | `200 OK` |
| `POST` | `/api/bookings/quote` | Calculate real-time price & discount | `{ hotel_id, check_in_date, check_out_date }` | `200 OK` |
| `POST` | `/api/bookings` | Book one room | `{ hotel_id, guest_name, guest_email, check_in_date, check_out_date }` | `201 Created` |
| `POST` | `/api/bookings/retrieve` | Lookup reservation | `{ booking_reference, guest_email }` | `200 OK` |
| `POST` | `/api/bookings/:id/cancel`| Cancel booking & release room | `{ booking_reference, guest_email }` | `200 OK` |

### Consistent Error Response Format:
```json
{
  "success": false,
  "message": "Check-out date must be strictly after check-in date (minimum 1 night stay).",
  "errors": []
}
```

---

## 4. Booking Logic & Availability Calculation

### 4.1 Date Validation Rules
1. Format validated to standard `YYYY-MM-DD`.
2. Check-in date cannot be in the past:  
   $$\text{check\_in} \ge \text{today}$$
3. Check-out date must be strictly after check-in:  
   $$\text{check\_out} > \text{check\_in} \implies \text{nights} \ge 1$$

### 4.2 Handling Overlapping Stays
A critical business requirement is preventing room inventory exhaustion. Two date intervals $[A_{\text{in}}, A_{\text{out}})$ and $[B_{\text{in}}, B_{\text{out}})$ overlap if and only if:
$$\text{Overlap} \iff A_{\text{in}} < B_{\text{out}} \land A_{\text{out}} > B_{\text{in}}$$

In SQL:
```sql
SELECT COUNT(*) as count 
FROM bookings 
WHERE hotel_id = ? 
  AND status = 'CONFIRMED'
  AND check_in_date < :requestedCheckOut 
  AND check_out_date > :requestedCheckIn;
```
- Available Rooms = `total_rooms - overlapping_booked_count`.
- If `available_rooms <= 0`, booking is rejected with `400 Bad Request: "No rooms available for the selected dates."`.
- **Adjacent Dates (Check-out Day = Next Guest Check-in Day)**: Because strict inequalities (`<` and `>`) are used, a guest checking out on December 15th does **not** conflict with a guest checking in on December 15th!

### 4.3 Cancellation Logic
When a booking is cancelled:
1. `status` is transitioned from `'CONFIRMED'` to `'CANCELLED'`.
2. `cancelled_at` is stamped with `CURRENT_TIMESTAMP`.
3. Because the availability query filters strictly for `status = 'CONFIRMED'`, the room capacity is **immediately released back into the available pool** for future guests.

---

## 5. Surprise Feature: "Thomas Cook Flexi-Stay Guarantee & Dynamic Long-Stay Loyalty Engine"

### What the Feature Does:
1. **Dynamic Long-Stay Loyalty Discount**: Travelers booking an extended stay of 4 or more nights automatically receive a **10% Thomas Cook loyalty discount**, calculated and itemized transparently in the price breakdown.
2. **Destination Weather & Packing Advisory**: Tailored seasonal travel tips (climate description, recommended clothing/essentials) for each destination (e.g. Goa, Manali, Jaipur) to enrich the booking journey.
3. **Guaranteed 48-Hour Free Cancellation Window**: Clear policy badge reassuring customers of full refunds and instant release if cancelled up to 48 hours prior to check-in.

### Why Chosen:
In travel and hotel booking, pricing transparency and cancellation flexibility are the two primary customer friction points. This feature provides direct financial incentive for longer vacations while removing booking anxiety.

### How Implemented:
- Backend pricing engine in `src/utils/dateUtils.js` (`calculateStayPricing()`) computes `discount_amount` and attaches `discountReason`.
- Stored in the database `bookings` table as `discount_amount` and `total_amount` for financial auditability.
- Fully validated via automated Jest unit test `TC-PRC-02` and Selenium E2E test `TC-E2E-10`.

---

## 6. Simultaneous Bookings & Race Condition Handling

### The Problem:
When only 1 room remains and two users simultaneously submit a booking request for overlapping dates, a naive "read-then-write" sequence could lead to **overbooking (overselling inventory beyond total capacity)**.

### Current Implementation & Production Approaches:
1. **Application-Level Availability Guard**:
   Before inserting a booking, `createBooking` executes an atomic availability check.
2. **Database Transactions with Row-Level Locking (`SELECT FOR UPDATE`)**:
   In production MySQL with InnoDB, the transaction is wrapped with:
   ```sql
   START TRANSACTION;
   SELECT total_rooms FROM hotels WHERE id = ? FOR UPDATE;
   -- Count active overlapping bookings
   -- If count >= total_rooms: ROLLBACK and throw OverbookedException
   -- Else: INSERT INTO bookings ...; COMMIT;
   ```
   This serializes concurrent transactions on the hotel row, guaranteeing that the second transaction sees the updated booking count and is safely rejected.
3. **Pessimistic vs. Optimistic Locking**:
   - For high-volume flash sales, Redis distributed locks (`Redlock`) with a temporary 10-minute inventory reservation hold can be placed while the user finalizes details.

---

## 7. Design Decisions & Trade-Offs

| Decision | Alternative Considered | Why Selected |
| :--- | :--- | :--- |
| **Node.js + Express** | Java + Spring Boot | As specified in the candidate's profile, Node.js allows rapid delivery of a testable REST API with zero Spring Boot boilerplate, aligning directly with the Automation Engineer role where JavaScript/Node is the primary stack for Selenium and modern test harnesses. |
| **Selenium WebDriver with Page Object Model** | Ad-hoc Selenium scripts | POM provides strict separation of page locators from test logic, ensuring maintainable, reusable, and robust test suites that don't break when UI elements change. |
| **Hybrid MySQL / SQLite Data Layer** | MySQL only | The database schema and scripts are 100% MySQL 8.0 compliant (`schema.sql` and `seed.sql`), but the Node adapter gracefully falls back to an embedded SQLite instance if the evaluator does not have MySQL running locally, preventing setup bottlenecks. |
| **Standardized `data-testid` Attributes** | XPath or CSS Class Selectors | XPath and CSS classes change with styling redesigns. `data-testid` attributes create an immutable contract between development and test automation. |

---

## 8. Limitations and Future Improvements

With additional engineering time, the following enhancements would be added:
1. **Multi-Room & Room Category Selection**: Support for Deluxe, Suite, and Standard categories per hotel.
2. **Selenium Grid / Dockerized Cross-Browser Execution**: Running tests simultaneously on Chrome, Firefox, and Edge via Docker containers.
3. **Email Notification Service**: Real-time confirmation emails with PDF receipts sent via Nodemailer / SendGrid.
4. **Performance / Load Testing**: K6 or JMeter test scripts to simulate 500 simultaneous booking requests to benchmark database transaction lock contention.

