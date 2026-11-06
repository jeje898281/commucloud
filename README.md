# CommuCloud — Frontend

Admin console for **CommuCloud**, a web app that runs condominium owners' meetings (區分所有權人會議): resident check-in, proposal voting, and live quorum tracking by both headcount and floor area.

Committee staff use it on a laptop or phone during the meeting: scan a resident's QR code at the door, scan paper ballots as votes are cast, and watch the attendance summary update against the legal thresholds.

| Repository | Role |
| --- | --- |
| [community-app-backend](https://github.com/jeje898281/community-app-backend) | Express API, PostgreSQL schema, job producer |
| **community-app-frontend** (this repo) | React admin console and QR scanning pages |
| [community-app-infra](https://github.com/jeje898281/community-app-infra) | Docker Compose stacks and the email worker |

## What staff can do

| Page | Purpose |
| --- | --- |
| Meetings | Create meetings and set the headcount and floor-area thresholds |
| Residents | Manage units, floor area and email; bulk import from a spreadsheet |
| QR codes | Generate check-in QR codes for every resident and download them as a ZIP |
| Scan / Manual check-in | Check residents in with the camera, or by hand when a code is missing |
| Summary | Attendance count and floor-area percentage against the meeting thresholds |
| Proposals / Ballots | Create proposals and print one QR ballot per resident and option |
| Vote scan | Scan ballots to record votes with the supervising staff member |
| Notify | Preview and send meeting notices to residents by email |
| Admin users | Create sub-accounts with `admin`, `manager` or `meeting_assistant` roles |

Pages and actions are hidden or disabled according to the signed-in user's role, and the API enforces the same rules.

## Tech stack

React 18 · React Router 6 · Vite 5 · Axios · html5-qrcode · JSZip · Nginx (production image)

## Project structure

```
src/
  pages/        route-level screens (auth, meetings, admin)
  components/   modals, scanner, layout, route guards
  contexts/     auth and current-meeting state
  services/     Axios client with JWT interceptor
  utils/        role permissions, toasts, JWT helpers
  styles/       design tokens and page styles
```

## Getting started

Start the API first (see [community-app-backend](https://github.com/jeje898281/community-app-backend)), or bring up the whole stack with [community-app-infra](https://github.com/jeje898281/community-app-infra).

```bash
pnpm install
pnpm dev          # http://localhost:5173, proxies /api to VITE_API_TARGET (default http://localhost:3000)
```

Production build:

```bash
pnpm build        # outputs dist/
```

`Dockerfile.prod` builds the app and serves `dist/` with Nginx. [`nginx.conf`](nginx.conf) disables caching for `index.html`, caches hashed assets for a year, and proxies `/api/` to the backend service inside the Docker network.
