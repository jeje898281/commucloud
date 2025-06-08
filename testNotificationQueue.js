// testNotificationQueue.js
const notificationQueue = require('./src/queue/notificationQueue');

async function test() {
    try {
        const emailTo = 'test@example.com';
        const subject = '測試通知';
        const body = '這是一封測試郵件，確認隊列運作正常。';
        const job = await notificationQueue.add('test-email', {
            to: emailTo,
            subject: subject,
            body: body
        });
        console.log('✅ meeting-notify jobId =', job.id);
        process.exit(0);
    } catch (err) {
        console.error('❌ meeting-notify job failed:', err);
        process.exit(1);
    }
}

test();
