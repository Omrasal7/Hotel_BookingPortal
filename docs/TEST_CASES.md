# Thomas Cook Hotel Booking Portal — Test Cases & Traceability Matrix

| Test Suite | Total Cases | Automated | Manual |
| :--- | :--- | :--- | :--- |
| **Hotel Browsing & Search** | 6 | 6 | — |
| **Date & Boundary Validation** | 6 | 6 | — |
| **Pricing Engine & Surprise Feature** | 5 | 5 | — |
| **Booking Creation & Capacity** | 4 | 4 | — |
| **Retrieval & Cancellation** | 5 | 5 | — |
| **Total** | **26** | **26 (100%)** | — |

---

## 1. Hotel Browsing & Search Scenarios

| Test ID | Test Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Type | Automation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-SRCH-01** | Verify initial hotel listing displays at least 5 hotels | App running, DB seeded | 1. Navigate to `/`<br>2. Count rendered hotel cards | Default | At least 5 hotels displayed with title, location, image, price, rating | Positive | Selenium & Jest |
| **TC-SRCH-02** | Search hotels by exact location keyword | On home page | 1. Enter "Goa" in location<br>2. Click Search | Location: "Goa" | Only hotels in Goa are returned | Positive | Selenium & Jest |
| **TC-SRCH-03** | Search hotels with case-insensitive matching | On home page | 1. Enter "jAiPuR"<br>2. Click Search | Location: "jAiPuR" | Returns "The Grand Heritage Palace" in Jaipur | Boundary | Jest |
| **TC-SRCH-04** | Search for non-existent destination | On home page | 1. Enter "Antarctica"<br>2. Click Search | Location: "Antarctica" | Displays friendly empty state: "No Hotels Found" | Negative | Selenium |
| **TC-SRCH-05** | Reset search filters restores default listings | Filters applied | 1. Click Reset button | — | Search input cleared, all original hotels reloaded | Positive | Selenium |
| **TC-SRCH-06** | View hotel details modal | Hotel list displayed | 1. Click "Details" button on hotel card | First hotel card | Modal opens showing full description, amenities, and weather advisory | Positive | Selenium |

---

## 2. Date & Input Boundary Validation (BVA / EP)

| Test ID | Test Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Type | Automation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-DATE-01** | Check-in date in the past must be rejected | Booking/Search open | 1. Set check-in date to yesterday<br>2. Submit | Check-in: `today - 1 day` | Validation error: "Check-in date cannot be in the past." | Negative (BVA) | Selenium & Jest |
| **TC-DATE-02** | Check-in date set to today (valid boundary) | Booking/Search open | 1. Set check-in to today<br>2. Set check-out to tomorrow | Check-in: `today`<br>Check-out: `today + 1` | Accepted, total nights = 1 | Boundary (BVA) | Jest |
| **TC-DATE-03** | Check-out date same as check-in (0 nights) | Booking/Search open | 1. Set check-in and check-out to same day | `check_in == check_out` | Validation error: "Check-out date must be strictly after check-in date" | Negative (BVA) | Selenium & Jest |
| **TC-DATE-04** | Check-out date before check-in | Booking/Search open | 1. Set check-out earlier than check-in | Check-in: `today + 5`<br>Check-out: `today + 2` | Validation error: "Check-out date must be strictly after check-in date" | Negative | Selenium & Jest |
| **TC-VAL-01** | Missing guest name in booking form | Booking modal open | 1. Leave guest name blank<br>2. Click Confirm | Name: `""`, Email: `test@ex.com` | Submission blocked with required error | Negative | Selenium & Jest |
| **TC-VAL-02** | Invalid guest email format | Booking modal open | 1. Enter malformed email<br>2. Click Confirm | Email: `notanemail` | Rejected with email validation error message | Negative | Selenium & Jest |

---

## 3. Pricing Engine & Surprise Feature (Long-Stay Loyalty Discount)

| Test ID | Test Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Type | Automation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-PRC-01** | Short stay pricing calculation (1 to 3 nights) | Booking modal open | 1. Select 3 nights stay<br>2. Inspect price breakdown | Hotel price: ₹4,000<br>Nights: 3 | Base: ₹12,000, Discount: ₹0, Total: ₹12,000 | Positive | Selenium & Jest |
| **TC-PRC-02** | Long stay pricing (Surprise Feature: 10% discount on 4+ nights) | Booking modal open | 1. Select 5 nights stay<br>2. Inspect price breakdown | Hotel price: ₹3,500<br>Nights: 5 | Base: ₹17,500, Discount: ₹1,750 (10%), Total: ₹15,750 | Positive | Selenium & Jest |
| **TC-PRC-03** | Boundary testing on discount threshold (3 vs 4 nights) | API quote endpoint | 1. Request quote for 3 nights<br>2. Request quote for 4 nights | Nights: 3 vs 4 | 3 nights: 0% discount<br>4 nights: exactly 10% discount | Boundary | Jest |
| **TC-PRC-04** | Client-side price tampering resistance | API POST `/bookings` | 1. Send client payload with `total_amount: 1` | Body: `{ total_amount: 1 }` | Backend calculates total server-side and ignores client tampering | Security | Jest |
| **TC-PRC-05** | Destination weather advisory lookup | Detail modal | 1. Select hotel in Goa, Manali, Jaipur | Location | Correct climate and travel packing advisory rendered | Positive | Selenium & Jest |

---

## 4. Booking Creation & Availability

| Test ID | Test Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Type | Automation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-BOK-01** | Successful booking flow (Happy Path) | Available rooms > 0 | 1. Select hotel<br>2. Enter name & email<br>3. Confirm | Valid details | 201 Created; returns unique reference (`TC-HB-XXXXXX`) | Positive | Selenium & Jest |
| **TC-BOK-02** | Overlapping stay calculation | 1 confirmed booking exists | 1. Search availability with dates overlapping existing stay | Overlapping dates | Available room count decrements by 1 | Positive | Jest |
| **TC-BOK-03** | Adjacent stay dates (No overlap) | Booking exists `[10th - 15th]` | 1. Query availability for `[15th - 18th]` | Check-in on same day previous guest checks out | No overlap counted; room is available on checkout day | Boundary | Jest |
| **TC-BOK-04** | Sequential capacity boundary | Hotel capacity = 5 rooms | 1. Create 5 bookings for identical dates<br>2. Attempt a 6th booking | 6th booking request | 400 Bad Request: "No rooms available for the selected dates." | Boundary (Sold-out) | Jest |

The current automated capacity test sends requests sequentially. Simultaneous requests are not tested; the current implementation may confirm more bookings than the room capacity under that race.

---

## 5. Booking Retrieval & Cancellation Flow

| Test ID | Test Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Type | Automation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-CNL-01** | Retrieve booking with reference and email | Confirmed booking exists | 1. Enter valid ref & email<br>2. Click Find | Valid ref + email | Returns booking with status "CONFIRMED" | Positive | Selenium & Jest |
| **TC-CNL-02** | Retrieve booking with mismatched email | Confirmed booking exists | 1. Enter valid ref but wrong email<br>2. Click Find | Wrong email | 404 Not Found: "No matching booking found" | Security / Negative | Selenium & Jest |
| **TC-CNL-03** | Cancel confirmed booking | Booking retrieved | 1. Click "Cancel Reservation"<br>2. Confirm in modal dialog | Valid booking | Status changes to "CANCELLED"; timestamp recorded | Positive | Selenium & Jest |
| **TC-CNL-04** | Room availability release verification | Booking cancelled | 1. Query availability for same dates after cancellation | Same dates | Available room count increases by 1 | Regression | Selenium & Jest |
| **TC-CNL-05** | Repeat cancellation prevention | Booking already cancelled | 1. Send cancel request on already cancelled booking | Already cancelled ID | 400 Bad Request: "This booking has already been cancelled" | Negative | Jest |

