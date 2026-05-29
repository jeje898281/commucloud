# Notification Worker Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the existing notification worker so it actually processes queued jobs and sends emails via Gmail SMTP.

**Architecture:** The worker is a standalone Node.js process in `infra/worker/`, separate from the backend. It connects to the same Redis instance, subscribes to the `notification` BullMQ queue, and sends emails via nodemailer when jobs arrive. docker-compose already wires it up; only version alignment and SMTP config are missing.

**Tech Stack:** BullMQ v5, IORedis v5, nodemailer, Gmail SMTP (port 587 / STARTTLS)

---

## File Map

| File | Action | Reason |
|------|--------|--------|
| `infra/worker/package.json` | Modify | Bump bullmq `^2.0.0` → `^5.53.0` |
| `infra/worker/index.js` | Modify | Add `maxRetriesPerRequest: null` to Redis connection |
| `infra/.env.dev` | Modify | Add SMTP_* env vars |
| `infra/worker/notificationWorker.js` | Delete | Unused draft, wrong redis path |

---

### Task 1: Bump BullMQ version in worker

**Files:**
- Modify: `infra/worker/package.json`

BullMQ v2 and v5 use different internal Redis key formats. The worker must match the backend's version or it will never see any jobs.

- [ ] **Step 1: Update package.json**

Open `infra/worker/package.json` and change the bullmq dependency:

```json
{
  "name": "community-worker-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "bullmq": "^5.53.0",
    "ioredis": "^5.0.0",
    "nodemailer": "^6.0.0",
    "dotenv": "^16.0.0"
  }
}
```

- [ ] **Step 2: Reinstall dependencies**

```bash
cd /Users/zhangdingkai/community-app-workspace/infra/worker
pnpm install
```

Expected: `pnpm-lock.yaml` updated, `bullmq@5.x.x` appears in lock file.

Verify:
```bash
grep "^bullmq@" pnpm-lock.yaml
```
Expected output contains `bullmq@5.` not `bullmq@2.`.

- [ ] **Step 3: Commit**

```bash
cd /Users/zhangdingkai/community-app-workspace/infra/worker
git add package.json pnpm-lock.yaml
git commit -m "fix: bump worker bullmq to v5 to match backend"
```

---

### Task 2: Fix IORedis connection config for BullMQ v5

**Files:**
- Modify: `infra/worker/index.js`

BullMQ v5 requires `maxRetriesPerRequest: null` on the IORedis connection, otherwise it throws `"ERR_UNHANDLED_ERROR: connect ECONNREFUSED"` or `"maxRetriesPerRequest is not null"` on startup.

- [ ] **Step 1: Update the Redis connection in index.js**

Replace the current connection line:

```js
const connection = new IORedis(process.env.REDIS_URL);
```

With:

```js
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});
```

Full updated `infra/worker/index.js`:

```js
require('dotenv').config();
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const nodemailer = require('nodemailer');

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const notificationWorker = new Worker(
  'notification',
  async job => {
    const { to, subject, text } = job.data;
    console.log(`✉️ [notification] Sending to ${to} (job ${job.id})`);
    await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, text });
    console.log(`✅ [notification] Sent to ${to}`);
  },
  { connection }
);

notificationWorker.on('failed', (job, err) => {
  console.error(`❌ [notification] Job ${job.id} failed:`, err);
});

notificationWorker.on('completed', job => {
  console.log(`🎉 [notification] Job ${job.id} completed`);
});

console.log('🚀 Worker started, listening on notification queue');
```

- [ ] **Step 2: Commit**

```bash
git add infra/worker/index.js
git commit -m "fix: add maxRetriesPerRequest null for bullmq v5 compatibility"
```

---

### Task 3: Add SMTP env vars to .env.dev

**Files:**
- Modify: `infra/.env.dev`

The worker reads `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` at startup. Without these, nodemailer will fail to connect.

- [ ] **Step 1: Get your Gmail App Password**

If you haven't already, go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords), create a new app password (select "Mail" + "Other"), and copy the 16-character code.

- [ ] **Step 2: Add SMTP vars to infra/.env.dev**

Append to the end of `infra/.env.dev`:

```
# 📧 Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=your-gmail@gmail.com
```

Replace `your-gmail@gmail.com` with your actual Gmail address and `xxxx xxxx xxxx xxxx` with the App Password (spaces are fine, Gmail ignores them).

- [ ] **Step 3: Verify .env.dev is in .gitignore**

```bash
cat /Users/zhangdingkai/community-app-workspace/infra/.gitignore 2>/dev/null || grep ".env" /Users/zhangdingkai/community-app-workspace/.gitignore 2>/dev/null
```

If `.env.dev` is NOT listed, add it before committing anything:

```bash
echo ".env.dev" >> /Users/zhangdingkai/community-app-workspace/infra/.gitignore
echo ".env.prod" >> /Users/zhangdingkai/community-app-workspace/infra/.gitignore
git add infra/.gitignore
git commit -m "chore: ensure env files are gitignored"
```

**Do NOT commit `.env.dev` itself** — it contains credentials.

---

### Task 4: Delete the orphaned worker draft

**Files:**
- Delete: `infra/worker/notificationWorker.js`

This file references `../backend/src/config/redis` which is not mounted in the worker container and would crash on require. The real entry point is `index.js`.

- [ ] **Step 1: Delete the file**

```bash
rm /Users/zhangdingkai/community-app-workspace/infra/worker/notificationWorker.js
```

- [ ] **Step 2: Commit**

```bash
git add -u infra/worker/notificationWorker.js
git commit -m "chore: remove unused notificationWorker.js draft"
```

---

### Task 5: End-to-end verification

No code changes — verify everything works together.

- [ ] **Step 1: Start the worker service**

```bash
cd /Users/zhangdingkai/community-app-workspace/infra
docker-compose -f docker-compose.dev.yml up worker --build
```

Expected output:
```
worker_1  | 🚀 Worker started, listening on notification queue
```

No errors about `maxRetriesPerRequest` or Redis connection refused.

- [ ] **Step 2: Trigger a notification**

In a separate terminal, call the notification endpoint (replace `<meetingId>` and `<token>`):

```bash
curl -X POST http://localhost:3000/api/meetings/<meetingId>/notify \
  -H "Authorization: Bearer <token>"
```

Expected response:
```json
{ "queued": <number> }
```

- [ ] **Step 3: Confirm worker logs**

Back in the worker terminal, you should see:

```
✉️ [notification] Sending to resident@example.com (job 1)
✅ [notification] Sent to resident@example.com
🎉 [notification] Job 1 completed
```

And the recipient should receive the email in their inbox.
