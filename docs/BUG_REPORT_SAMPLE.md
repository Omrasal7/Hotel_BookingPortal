# Sample QA Defect Reports (STLC Artifact)

These defect reports represent actual bugs caught and resolved during the automated and exploratory testing phases of the **Thomas Cook Hotel Booking Portal**.

---

### Defect Report 1: Overlapping Check-out and Check-in Date Availability Defect

| Field | Detail |
| :--- | :--- |
| **Defect ID** | **BUG-TC-001** |
| **Title** | Room availability mistakenly counts guest checking out on the same day as an overlap |
| **Severity** | High (S2) |
| **Priority** | High (P2) |
| **Component** | Backend / Availability Query Engine (`hotelModel.js`) |
| **Reported By** | Om Rasal |
| **Status** | **RESOLVED & VERIFIED** |

#### Description
When querying hotel room availability for a stay starting on `2026-12-15`, an existing booking ending on `2026-12-15` was counted as overlapping when using `<=` and `>=` comparison operators. In hotel operations, when Guest A checks out at 11:00 AM on the 15th, Guest B can check in at 2:00 PM on the 15th.

#### Steps to Reproduce
1. Create a booking for Hotel 1 with dates `2026-12-10` to `2026-12-15`.
2. Search room availability for Hotel 1 for `2026-12-15` to `2026-12-18`.
3. Observe available room count.

#### Expected Result
The room should be available on `2026-12-15` (no overlap with previous guest checking out).

#### Actual Result
Available room count was decremented because condition used `<= / >=` instead of `< / >`.

#### Root Cause & Fix
Updated SQL overlap logic to strict inequality:
```sql
-- Correct condition:
WHERE check_in_date < ? AND check_out_date > ?
-- params: [requestedCheckOut, requestedCheckIn]
```
Verified with automated test `TC-BOK-03`.

---

### Defect Report 2: Past Check-in Date Allowed on Search Submission

| Field | Detail |
| :--- | :--- |
| **Defect ID** | **BUG-TC-002** |
| **Title** | UI allowed search submission with past check-in date without warning banner |
| **Severity** | Medium (S3) |
| **Priority** | Medium (P3) |
| **Component** | Frontend / `SearchBar.jsx` |
| **Reported By** | QA Automation Engineer |
| **Status** | **RESOLVED & VERIFIED** |

#### Steps to Reproduce
1. Open Hotel Search page.
2. Manually input or paste past date `2025-01-01` into check-in field.
3. Click "Search Hotels".

#### Expected Result
Search should be prevented and inline validation banner should alert: *"Check-in date cannot be in the past."*

#### Actual Result
Search request was dispatched to backend, resulting in a 400 error rather than catching it on client first.

#### Fix
Added client-side validation guard in `SearchBar.jsx` and `BookingModal.jsx` checking `checkInDate < todayISO`. Automated test added in `01_hotel_search.spec.js`.

---

### Defect Report 3: Client-side Price Manipulation Vulnerability

| Field | Detail |
| :--- | :--- |
| **Defect ID** | **BUG-TC-003** |
| **Title** | Backend previously accepted client-supplied `total_amount` in POST `/api/bookings` |
| **Severity** | Critical (S1 - Security/Financial) |
| **Priority** | High (P1) |
| **Component** | Backend / `bookingController.js` |
| **Reported By** | QA Automation Engineer |
| **Status** | **RESOLVED & VERIFIED** |

#### Description
During security boundary testing of POST `/api/bookings`, a tampered payload containing `{"total_amount": 1.00}` was submitted.

#### Fix
The controller now enforces that `total_amount`, `base_amount`, and `discount_amount` are strictly calculated server-side using `calculateStayPricing(hotel.room_price_per_night, totalNights)`. Any client-passed price field is ignored. Automated test added in `TC-PRC-04`.

