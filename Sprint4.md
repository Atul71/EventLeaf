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
Vivek Chenganassery
[BE] Organizer ticket check-in API (QR / ticket number) - #56

## Frontend (UI)
Pritika Kannapiran
[FE] Impact History – View Organizer Impact History - #48

## Full Stack (FE + BE)
Atul Arun
[FE][BE] QR Code Generation for Ticket System - #45

Shane George Thomas
[FE][BE] Payment Gateway – Secure Checkout & Mock Validator - #50
[CI/CD] Automated Quality Gate Pipeline - #51

# What issues your team planned to address?
This sprint focused on closing the loop on the end-to-end attendee and organizer journey by delivering a fully paperless ticketing flow and giving organizers visibility into the sustainability impact of their work. The team planned to deliver a secure mock payment gateway with realistic checkout UX and backend validation against a mock card database, QR code generation that ties each successful purchase to a unique, scannable ticket, and a corresponding organizer-side check-in API to validate those tickets at the door. On the organizer experience side, the plan included an Impact History page that surfaces aggregate sustainability metrics (eco-friendly events, transit-enabled venues, digital ticketing/check-in counts, estimated paper saved) along with per-event impact scores. To stabilize the platform during the code freeze, the team also planned to stand up an automated quality gate pipeline in GitHub Actions covering backend, frontend, and end-to-end tests on every pull request.

# Unit test - Frontend
The frontend unit tests focus on the new paperless checkout journey and the organizer impact view. For the Payment Gateway, tests validate the mock credit card form, including formatting (spaces every 4 digits), expiry/CVV validation, error states for invalid or expired cards, and the loading state during the simulated handshake with the backend. QR Code rendering tests confirm that a unique QR is displayed in the user's ticket view after a successful purchase and that the ticket page handles missing or invalid QR data gracefully. Impact History tests verify auth-gated routing (unauthenticated users redirected to login), correct rendering of the summary section (totals for events created, eco-friendly events, transit-enabled venues, digital ticketing/check-in count, estimated paper saved), per-event table rows with title/date/status/capacity/impact score and indicators, the empty state when an organizer has no events, and the error state when the API call fails.

# Unit test - Backend
Payment & Transaction Logic
Mock Card Validation: Verifies that valid test cards (e.g., 4242 4242 4242 4242) return 200 OK with a transaction_id, while invalid or insufficient-funds cards (e.g., 5555 5555 5555 4444) return 402 Payment Required with the appropriate error message.
Amount & CVV Handling: Tests boundary cases for transaction amounts and CVV format validation, ensuring malformed payloads return 400.

# Ticketing & QR Generation
Unique Ticket ID: Validates that each successful purchase generates a unique ticket identifier and that duplicates are rejected.
QR Encoding: Tests that the QR payload encodes the ticket ID correctly and can be decoded back to a valid ticket record.
Persistence: Confirms ticket and QR references are stored and retrievable via the API.

# Check-in API
QR / Ticket Number Lookup: Verifies that scanned QR codes and ticket numbers map to the correct event and attendee.
Authorization: Ensures only the organizer of the event can check in tickets for that event (401/403 on mismatch).
Idempotency: Confirms that a ticket cannot be checked in twice and returns a clear conflict response on re-scan.

# CI/CD Pipeline
Workflow Triggers: Validates that the GitHub Actions workflow runs on push and pull_request to main and develop.
Backend Suite: Confirms go test ./... runs with the -race flag and against a postgres:alpine service container for integration tests.
Frontend Suite: Confirms Vitest/Jest component tests, tsc type checking, and eslint linting all run and fail the build on regressions.
E2E Green Path: Validates the Playwright/Cypress flow from login → finding a Green Auditorium event → mock purchase → QR generation.

# Which ones were successfully completed?
All tickets were successfully completed.

# Which ones didn't and why?
N/A — all planned tickets shipped this sprint.

# Backend readme

# Links to YouTube videos
