# TES Tour Management Platform

TES Tour is a web platform for managing end-to-end tour operations: customer booking, payment processing, itinerary handling, employee assignment, and live trip tracking.  
It is built as a full-stack Next.js application with a MySQL backend.

## Project Snapshot

- **Purpose:** digitize and centralize tour operations that were previously handled across separate manual steps.
- **Primary users:** customers, admin team, HR/operations employees, drivers, and tour guides.
- **Core outcomes:** faster booking workflow, clearer assignment visibility, payment traceability, and better operational monitoring.

## Scope and Current Features

### Customer-facing
- Account registration and login with email verification.
- Browse tours and create bookings.
- Payment initialization and verification flow (Chapa integration supported).
- Booking history and booking status visibility.
- Refund request submission.
- Trip rating and review submission.

### Operations and admin
- Employee registration and role management (admin, employee, tour guide, driver).
- Vehicle and driver management.
- Tour guide assignment and assignment checks.
- Booking oversight via dashboard views.
- Change request handling for booking or itinerary updates.

### Trip execution
- Tour start/end flow APIs.
- Destination and location tracking endpoints.
- Live tracking support for map-based monitoring.
- Itinerary and custom itinerary request endpoints.

## Technical Stack

- **Frontend + Backend:** Next.js (App Router), React, TypeScript
- **Database:** MySQL (`mysql2`)
- **Auth/Security:** JWT (`jsonwebtoken`), password hashing (`bcryptjs`)
- **Payments:** Chapa API
- **Maps and location UI:** Google Maps / Leaflet stack
- **Email:** Nodemailer-based verification email workflow
- **Testing:** Vitest + Playwright

## Repository Structure

```text
tes/
  app/                  # Next.js routes, pages, and API endpoints
  components/           # UI components
  lib/                  # Domain services, auth, db, integrations
  scripts/              # SQL and setup/maintenance scripts
  tests/                # Integration/security/E2E tests
```

## Local Setup

### 1) Prerequisites
- Node.js 20+
- npm
- MySQL server (XAMPP/local MySQL is fine)
- A database named `tes_tour`

### 2) Install dependencies

```bash
cd tes
npm install
```

### 3) Configure environment variables

Create `tes/.env.local` and set values similar to the following:

```env
# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES=7d

# Database
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=tes_tour

# Payments 
CHAPA_SECRET_KEY=your_chapa_secret_key

# Maps 
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Email (use one provider block)
EMAIL_FROM="TES Tour <noreply@testour.com>"

# Option A: Gmail
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_gmail_app_password

# Option B: Generic SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

# Option C: Mailtrap (testing)
MAILTRAP_USER=
MAILTRAP_PASS=
```

### 4) Database bootstrap
- Import one of the provided SQL base files (for example `tes/tes_tour(new).sql`) into MySQL.
- Run any additional scripts needed for your feature scope from `tes/scripts/`.

### 5) Run development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Test Commands

```bash
npm run lint
npm run test
npm run test:integration
npm run test:security
npm run test:e2e
```

## Operational Notes

- Performance-related SQL improvements are documented in `README_PERFORMANCE.md`.
- Email setup and troubleshooting are documented in `EMAIL_CONFIGURATION_GUIDE.md` and `EMAIL_VERIFICATION_SETUP.md`.
- GPS/tracking setup references are available in `GPS_SETUP_GUIDE.md` and related tracking docs.

## Risks and Dependencies to Watch

- Payment reliability depends on external Chapa availability and credentials.
- Map and live tracking quality depend on API keys, location permissions, and network stability.
- Production readiness requires secure secrets management and a stable SMTP provider.

## Suggested Next Delivery Milestones

- Finalize deployment environment and secret management.
- Complete regression pass across booking, payment, refund, and assignment workflows.
- Confirm monitoring/alerting plan for payment and tracking failures.
- Produce a short user-facing operations guide for admin and support teams.
