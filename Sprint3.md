# EVENT LEAF

# Team Members

## Frontend
Shane George Thomas  
Atul Arun  

## Backend
Vivek Chenganassery  
Pritika Kannapiran  

We have completed the following CR for this sprint.
# User Stories

## Backend (API)
- Vivek Chenganassery  
  [FE][BE]Adding Favorites/Saved events into profile page and rectifying API for the same - 6 story points


- Pritika Kannapiran  
  BE: Sustainability score - 5 story points


## Frontend (UI)
- Atul Arun
<BR> UI, BE Integration – Event Creation - 6 story points


- Shane George Thomas  
UI: Login Validation - 3 story points 
<BR>UI, API: Edit Profile and Settings - 5 story points 

# What issues your team planned to address?

This sprint focused on enhancing core user functionality and integrating sustainability-driven features for the EventHub platform. The team planned to address front-to-back event creation by integrating the UI with backend APIs, including a "Sustainability Score" engine that calculates eco-impact metrics and provides actionable green tips. On the user experience side, the plan included implementing robust client-side login validation for email and password security, developing a comprehensive profile and settings dashboard for personal and notification management, and launching a "Saved Events" feature to improve user engagement and event discovery.

# Unit test - Frontend
The frontend unit tests focus on verifying the core user journey for creating and discovering events, with a heavy emphasis on sustainability features. For the Event Creation Wizard, tests validate the multi-step navigation, form validation logic, and the calculation of the eco-score based on digital ticketing and venue choices. Discover and Detail tests ensure that filtering mechanisms, specifically for eco-conscious criteria and timeframes work correctly, while confirming that event details and media links render accurately when transitioning from the discovery feed to the individual event view.

# Unit test - Backend

#### **Domain & Logic Validation**
* **Green Metrics Validation:** Verifies that sustainability scores stay within valid ranges ($0$–$100$) and flags invalid negative inputs or boundary violations for attendee counts.
* **Overall Score Calculation:** Validates the mathematical logic for combining component scores, testing decimal values, zeros, and maximums.
* **Eco-Friendly Determination:** Tests the strict $\ge 70$ threshold logic to ensure events are correctly labeled as "eco-friendly."
* **Green Verification Service:** Checks business rules where combinations of eco-certified venues and digital flags (like paperless ticketing) determine "green" status.

#### **API & Handler Testing**
* **Event & Venue Handlers:** Verifies standard CRUD operations, ensuring malformed JSON returns `400`, missing records return `404`, and successful actions return `200` or `204`.
* **Favorite/Saved Events:** Validates authorization requirements (`401`), prevents saving unpublished drafts, and ensures user-event mappings are persisted correctly.
* **Data Serialization:** Performs JSON roundtrip tests to ensure UUIDs and nested metrics objects survive serialization without data loss.

#### **Calendar & Integration Services**
* **iCalendar (ICS) Generation:** Validates RFC 5545 compliance, including 75-character property folding, special character escaping, and UID formatting.
* **Timezone & Scheduling:** Ensures event times are accurately parsed into specific timezones (defaulting to `America/New_York`) and converted to RFC3339 strings.
* **Google Calendar Integration:** Confirms the service handles missing credentials gracefully and correctly maps internal event data to Google-compatible formats.
* **Repository Helpers:** Tests utility functions like `NullIfEmpty` to ensure correct database mapping for optional fields.
# Which ones were successfully completed?

All tickets were successfully completed.

# Which ones didn’t and why?

# Backend readme
https://github.com/Atul71/EventLeaf/blob/main/api/README.md

# Links to YouTube videos

Integrated Video - https://youtu.be/qWiMNvqef34

Link to the board
https://github.com/users/Atul71/projects/5/views/1
