// src/queue/notificationQueue.js
const { Queue } = require('bullmq');
const redis = require('../config/redis');  // 重用剛做好的 redis client

/**
 * 通知列隊：負責處理寄信提醒的工作
 * 名稱取 "notification" 或更具體的 "meeting-notify"
 */
const notificationQueue = new Queue('notification', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,              // 最多重試 3 次
        backoff: { type: 'exponential', delay: 5000 },  // 指數退避
        removeOnComplete: true,   // 完成後自動清除工作
        removeOnFail: false       // 保留失敗記錄以便除錯
    }
});

module.exports = notificationQueue;
