// src/queue/reportQueue.js
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const connection = new IORedis(process.env.REDIS_URL || "redis://redis:6379");

const reportQueue = new Queue('report', { connection });
module.exports = reportQueue;
