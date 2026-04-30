# EventLeaf

EventLeaf is a full-stack eco-focused event management platform that helps organizers run sustainable events and helps attendees discover and support them through a fully digital experience.

## Project Description

EventLeaf is a full-stack eco-focused event management platform designed to reduce the environmental impact of organizing and attending events. Traditional event planning often relies on paper-based workflows, inefficient logistics, and limited visibility into sustainability practices. EventLeaf addresses these challenges by digitizing end-to-end event operations while enabling organizers to design, label, and promote eco-friendly events.

For organizers, EventLeaf simplifies the creation and management of sustainable events through fully digital workflows for event setup, ticketing, and attendance tracking. While creating an event, organizers can opt in to mark their event as eco-friendly by selecting sustainability-focused attributes such as paperless ticketing, digital check-ins, waste reduction practices, or environmentally responsible venue choices. These selections allow organizers to communicate their sustainability efforts clearly to attendees. Real-time ticket sales, revenue analytics, and QR-code-based check-ins further reduce paper usage while providing actionable insights into event performance.

For attendees, EventLeaf enables eco-conscious event discovery and participation through a seamless digital experience. Users can browse and search for events, filter or prioritize eco-friendly events, receive personalized recommendations based on interests, and purchase tickets online with digital confirmations instead of printed passes. Events can be added directly to personal calendars such as Google Calendar, promoting a fully paperless event journey.

By allowing organizers to explicitly classify and manage eco-friendly events and enabling attendees to discover and support them, EventLeaf encourages sustainable event practices while delivering a modern, efficient experience for all users.

## Requirements

To run and use this application locally, install:

- `Git`
- `Go` (recommended `1.22+`)
- `Node.js` (recommended `20+`) and `npm`
- `PostgreSQL` (running locally or remotely)

## Key Dependencies

### Backend (`/api`)
- `gin-gonic/gin` (HTTP server and routing)
- `jackc/pgx` (PostgreSQL access)
- `google/uuid` (ID generation)

### Frontend (`/ui/eventleaf-ui`)
- `react`, `react-dom`
- `react-router-dom`
- `vite`
- `typescript`
- `cypress` (E2E)
- `vitest` (unit/integration tests)
- `react-payment-inputs` (checkout form UX)

## Project Structure

- `api/` - backend (Go)
- `ui/eventleaf-ui/` - frontend app, Cypress tests

## Setup and Run

### 1) Clone repository

```bash
git clone <your-repo-url>
cd EventLeaf
```

### 2) Install dependencies

Frontend:

```bash
cd ui/eventleaf-ui
npm install
```

Backend:

```bash
cd ../../api
go mod download
```

### 3) Configure environment

Set backend environment variables (DB connection, server config, etc.) before running the API.

### 4) Start backend

```bash
cd api
go run ./cmd/server
```

### 5) Start frontend

In a new terminal:

```bash
cd ui/eventleaf-ui
npm run dev
```

Frontend default URL: `http://localhost:5173`

## How to Use the Application

- Open `http://localhost:5173`
- Sign up or log in
- Discover events at `/events`
- Open event details at `/events/:eventId`
- Buy tickets through the ticket modal (mock payment in dev)
- Organizer flows:
  - Dashboard: `/organizer`
  - Create event: `/organizer/events/create`
  - Analytics: `/organizer/analytics`
- Profile and impact:
  - `/profile`
  - `/profile/impact-history`

## Testing

### Frontend tests

```bash
cd ui/eventleaf-ui
npm test
```

### Cypress (headless)

```bash
cd ui/eventleaf-ui
npx cypress run --browser electron
```

### Cypress (interactive)

```bash
cd ui/eventleaf-ui
npm run cypress:open
```

## Mock Payment Cards (Development Only)

Use these cards in checkout (or `POST /api/v1/payments`).

### Working cards

- `4242 4242 4242 4242` | Exp `12/30` | CVV `123`
- `4111 1111 1111 1111` | Exp `11/29` | CVV `111`
- `4012 8888 8888 1881` | Exp `10/28` | CVV `222`
- `3782 822463 10005` | Exp `09/27` | CVV `321`
- `6011 1111 1111 1117` | Exp `08/29` | CVV `456`
- `3530 1113 3330 0000` | Exp `07/31` | CVV `654`
- `3056 930902 5904` | Exp `06/28` | CVV `777`
- `5200 8282 8282 8210` | Exp `04/30` | CVV `888`

### Error-case cards

- `5555 5555 5555 4444` | Exp `01/23` | CVV `999` -> `Card expired`
- `4000 0000 0000 0002` | Exp `05/26` | CVV `100` -> `Insufficient funds` for totals above `$50`

## Team

- Atul Arun
- Pritika Kannapiran
- Vivek Chenganassery
- Shane George Thomas

## Roles

Each team member contributes to both frontend and backend development, alternating responsibilities throughout project sprints.

## Development Workflow

### Branches

- Start from the linked issue and create your branch from the ticket workflow so PRs remain traceable.
- Branch naming format: `feature/ticketID-work-to-be-done`
- Example: `feature/BE101-search-implementation`

### Pull Requests

- Raise a PR, get teammate review, then merge to `main`.
- PR naming format: `Ticket-ID: Work that is done`
- Example: `BE-101: Implemented Search Feature`

## Members
Atul Arun
<br> Pritika Kannapiran
<br> Vivek Chenganassery
<br> Shane George Thomas## Roles
<br> Each team member will contribute to both frontend and backend development, alternating responsibilities throughout the project sprints.

# Development Guide
## Folder Structure
- `/api` contains files related to backend development (Go).
- `/ui` contains files related to frontend development (React using TypeScript).## Branches
- When starting development, open the linked issue, click "create a branch", pull the branch onto your local, and start development. 
This ensures that all branches and PRs are tracked within the ticket#### Branch naming format: `feature/ticketID-work-to-be-done`- eg: `feature/
BE101-search-implementation`## Pull Requests
Once the branch is ready to be merged, raise a PR with your teammate, get it approved, and then merge to 'main'PR naming convention: `Ticket-ID: Work 
that is done`
- eg: `BE-101: Implemented Search Feature`Use these cards against `POST /api/v1/payments` or the ticket checkout modal.- `4242 4242 4242 4242` | Exp: 
`12/30` | CVV: `123` | Expected: Success
- `4111 1111 1111 1111` | Exp: `11/29` | CVV: `111` | Expected: Success
- `4012 8888 8888 1881` | Exp: `10/28` | CVV: `222` | Expected: Success
- `3782 822463 10005` | Exp: `09/27` | CVV: `321` | Expected: Success
- `6011 1111 1111 1117` | Exp: `08/29` | CVV: `456` | Expected: Success
- `3530 1113 3330 0000` | Exp: `07/31` | CVV: `654` | Expected: Success
- `3056 930902 5904` | Exp: `06/28` | CVV: `777` | Expected: Success
- `5200 8282 8282 8210` | Exp: `04/30` | CVV: `888` | Expected: Success- `5555 5555 5555 4444` | Exp: `01/23` | CVV: `999` | Expected: `Card expired`
- `4000 0000 0000 0002` | Exp: `05/26` | CVV: `100` | Expected: `Insufficient funds` for totals over `$50`
