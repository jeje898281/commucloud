# Notification Worker Fix — Design Spec

**Date:** 2026-05-29  
**Status:** Approved

## Problem

The notification worker (`infra/worker/index.js`) exists and is wired into docker-compose, but two issues prevent it from working:

1. **BullMQ version mismatch** — worker uses `v2.4.0`, backend uses `v5.53.0`. Different major versions use incompatible internal queue data structures; the worker cannot read jobs enqueued by the backend.
2. **Missing SMTP env vars** — `.env.dev` and `.env.prod` have no `SMTP_*` entries; nodemailer cannot connect to Gmail.

## Scope

Fix only what is broken. No architectural changes.

## Changes

### 1. `infra/worker/package.json`
- Bump `bullmq` from `^2.0.0` to `^5.53.0` to match the backend.

### 2. `infra/worker/index.js`
- Add `maxRetriesPerRequest: null` to the IORedis connection options. BullMQ v5 requires this; without it the worker throws on startup.

### 3. `infra/.env.dev`
- Add the following SMTP env vars for Gmail:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=<gmail address>
  SMTP_PASS=<16-char app password>
  SMTP_FROM=<gmail address>
  ```

### 4. `infra/worker/notificationWorker.js`
- Delete this file. It is an unused draft; the entry point is `index.js`. It also incorrectly references `../backend/src/config/redis` which is not mounted in the worker container.

## Out of Scope

- Email provider changes (SendGrid, Mailgun)
- Dev-mode hot reload (nodemon) for the worker
- Queue monitoring UI (Bull Board)
- Production `.env.prod` SMTP values (user sets these manually)

## Verification

After changes, `docker-compose -f docker-compose.dev.yml up worker` should start without errors, and calling `POST /api/meetings/:meetingId/notify` should result in a real email delivered to each resident with an email address.
