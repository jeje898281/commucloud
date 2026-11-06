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
