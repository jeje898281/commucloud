const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 開始建立 seed 資料");

  // 建立社區
  const community = await prisma.community.create({
    data: {
      name: '示範社區',
      description: '這是一個測試用社區',
      logoUrl: 'https://example.com/logo.png'
    }
  });

  // 建立管理者
  const admin = await prisma.adminUser.upsert({
    where: { username: 'admin001' },
    update: {},
    create: {
      username: 'admin001',
      password: await bcrypt.hash('test1234', 10),
      role: 'admin',
      displayName: 'user001',
      communityId: community.id
    }
  });

  // 建立兩位住戶
  const resident1 = await prisma.resident.upsert({
    where: { username: 'zhangsan' },
    update: {},
    create: {
      communityId: community.id,
      code: 'A101',
      residentSqm: 33.56,
      username: 'zhangsan',
      password: await bcrypt.hash('zhangsan123', 10),
      email: 'jeje898281@gmail.com'
    }
  });

  const resident2 = await prisma.resident.upsert({
    where: { username: 'lisi' },
    update: {},
    create: {
      communityId: community.id,
      code: 'B202',
      residentSqm: 28.40,
      username: 'lisi',
      password: await bcrypt.hash('lisi123', 10),
      email: 'ctkho0828@gmail.com'
    }
  });

  // 建立一場會議
  const meeting = await prisma.meeting.create({
    data: {
      name: '第一屆社區大會',
      date: new Date(),
      status: 'pending',
      sqmThreshold: 50.0,
      residentThreshold: 0.5,
      createAdminUserId: admin.id,
      communityId: community.id
    }
  });

  // 建立報到紀錄
  await prisma.meetingAttendanceLog.create({
    data: {
      meetingId: meeting.id,
      residentId: resident1.id,
      createAdminUserId: admin.id,
      isManual: false
    }
  });

  // 建立一則提案
  const proposal = await prisma.proposal.create({
    data: {
      meetingId: meeting.id,
      title: '同意更新社區門禁系統',
      content: '建議更換為人臉辨識門禁，提高安全性',
      sqmThreshold: 50.0,
      residentThreshold: 0.5,
      createAdminUserId: admin.id
    }
  });

  // 建立一筆投票
  await prisma.voteLog.create({
    data: {
      proposalId: proposal.id,
      residentId: resident1.id,
      result: 'agree',
      createAdminUserId: admin.id
    }
  });

  console.log('✅ 全部 seed 資料建立完成');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
