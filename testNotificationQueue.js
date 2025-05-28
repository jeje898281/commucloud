// testNotificationQueue.js
const notificationQueue = require('./src/queue/notificationQueue');

async function test() {
    try {
        const job = await notificationQueue.add('test-email', {
            to: 'test@example.com',
            subject: '測試通知',
            body: '這是一封測試郵件，確認隊列運作正常。'
        });
        console.log('✅ 通知任務已推入，jobId =', job.id);
        process.exit(0);
    } catch (err) {
        console.error('❌ 推送通知任務失敗：', err);
        process.exit(1);
    }
}

test();
