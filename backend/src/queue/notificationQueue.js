// src/queue/notificationQueue.js
const { Queue } = require('bullmq');
const redis = require('../config/redis');

const notificationQueue = new Queue('notification', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false
    }
});

module.exports = notificationQueue;
