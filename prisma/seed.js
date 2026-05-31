// /backend/prisma/seed.js
//
// 模擬一個真實運作中的社區管理委員會場景：
//   - 三棟大樓共 32 戶（其中 3 戶尚未綁帳號）
//   - 6 位管理員，含已停用帳號（採英文名 + 中文頭銜）
//   - 6 場會議：年度區權人會議（已完成、進行中、預定）、修繕案首次召集流會 + 重新召集會議、一場取消
//   - 12 條提案，含通過 / 否決 / 高度爭議三種型態
//   - 報到紀錄具備時間分布與 QR / 手動混合
//   - 投票紀錄保證僅出席者投票，且票數對得上同意比例與門檻

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

const hash = (pw) => bcrypt.hash(pw, 10);
const daysAgo = (n, hour = 19, min = 0) => {
  const d = new Date(Date.now() - n * 86400000);
  d.setHours(hour, min, 0, 0);
  return d;
};
const daysFromNow = (n, hour = 19, min = 0) => {
  const d = new Date(Date.now() + n * 86400000);
  d.setHours(hour, min, 0, 0);
  return d;
};
const addMinutes = (date, mins) => new Date(date.getTime() + mins * 60000);

async function clean() {
  await prisma.voteLog.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.meetingAttendanceLog.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.resident.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.community.deleteMany();
}

async function main() {
  console.log('🌱 Seeding database');
  await clean();

  // ============================================================
  // Community
  // ============================================================
  const community = await prisma.community.create({
    data: {
      name: '信義之星社區',
      description:
        '位於台北市信義區的三棟住宅大樓，共 32 戶。由住戶選任之管理委員會負責社區事務之決議與執行。',
      logoUrl: 'https://example.com/communities/xinyi-star/logo.png',
    },
  });

  // ============================================================
  // 管理員（英文名 + 中文頭銜）
  // ============================================================
  const [superAdmin, chair, viceChair, asstJennifer, asstDavid, formerChair] = await Promise.all([
    prisma.adminUser.create({
      data: {
        communityId: community.id,
        username: 'admin001',
        password: await hash('test1234'),
        email: 'admin001@example.com',
        displayName: 'Daniel 系統管理員',
        role: 'admin',
        isActive: true,
      },
    }),
    prisma.adminUser.create({
      data: {
        communityId: community.id,
        username: 'm.thompson',
        password: await hash('manager123'),
        email: 'michael.thompson@example.com',
        displayName: 'Michael 主委',
        role: 'manager',
        isActive: true,
      },
    }),
    prisma.adminUser.create({
      data: {
        communityId: community.id,
        username: 's.mitchell',
        password: await hash('manager123'),
        email: 'sarah.mitchell@example.com',
        displayName: 'Sarah 副主委',
        role: 'manager',
        isActive: true,
      },
    }),
    prisma.adminUser.create({
      data: {
        communityId: community.id,
        username: 'j.rodriguez',
        password: await hash('assist123'),
        email: 'jennifer.rodriguez@example.com',
        displayName: 'Jennifer 會議助理',
        role: 'meeting_assistant',
        isActive: true,
      },
    }),
    prisma.adminUser.create({
      data: {
        communityId: community.id,
        username: 'd.park',
        password: await hash('assist123'),
        email: 'david.park@example.com',
        displayName: 'David 會議助理',
        role: 'meeting_assistant',
        isActive: true,
      },
    }),
    prisma.adminUser.create({
      data: {
        communityId: community.id,
        username: 'r.wilson',
        password: await hash('disabled123'),
        email: 'robert.wilson@example.com',
        displayName: 'Robert 前主委（已停用）',
        role: 'manager',
        isActive: false,
      },
    }),
  ]);

  // ============================================================
  // 住戶（32 戶；前兩戶使用測試者實際信箱以驗證 SMTP）
  // ============================================================
  const residentSeeds = [
    // A 棟 — 高樓層、大坪數
    { code: 'A0301', sqm: 45.20, name: '張凱翔', username: 'resident.a0301', email: 'jeje898281@gmail.com' },
    { code: 'A0302', sqm: 42.80, name: '陳怡君', username: 'resident.a0302', email: 'ctkho0828@gmail.com' },
    { code: 'A0501', sqm: 48.10, name: '林宗翰', username: 'resident.a0501', email: 'resident.a0501@example.com' },
    { code: 'A0502', sqm: 45.50, name: '王思婷', username: 'resident.a0502', email: 'resident.a0502@example.com' },
    { code: 'A0701', sqm: 50.30, name: '吳俊宏', username: 'resident.a0701', email: 'resident.a0701@example.com' },
    { code: 'A0702', sqm: 47.90, name: '蔡淑芬', username: 'resident.a0702', email: 'resident.a0702@example.com' },
    { code: 'A0901', sqm: 55.40, name: '黃文豪', username: 'resident.a0901', email: 'resident.a0901@example.com' },
    { code: 'A0902', sqm: 52.20, name: '楊麗華', username: 'resident.a0902', email: 'resident.a0902@example.com' },
    { code: 'A1101', sqm: 62.80, name: '劉建良', username: 'resident.a1101', email: 'resident.a1101@example.com' },
    { code: 'A1102', sqm: 60.50, name: '謝佩珊', username: 'resident.a1102', email: 'resident.a1102@example.com' },

    // B 棟 — 中段標準戶
    { code: 'B0201', sqm: 32.10, name: '鄭家豪', username: 'resident.b0201', email: 'resident.b0201@example.com' },
    { code: 'B0202', sqm: 30.80, name: '許雅雯', username: 'resident.b0202', email: 'resident.b0202@example.com' },
    { code: 'B0401', sqm: 33.50, name: '潘志強', username: 'resident.b0401', email: 'resident.b0401@example.com' },
    { code: 'B0402', sqm: 32.40, name: '簡宜君', username: 'resident.b0402', email: 'resident.b0402@example.com' },
    { code: 'B0601', sqm: 35.20, name: '蘇正雄', username: 'resident.b0601', email: 'resident.b0601@example.com' },
    { code: 'B0602', sqm: 33.90, name: '高麗珠', username: 'resident.b0602', email: 'resident.b0602@example.com' },
    { code: 'B0801', sqm: 36.70, name: '馬建興', username: 'resident.b0801', email: 'resident.b0801@example.com' },
    { code: 'B0802', sqm: 34.50, name: '彭素芬', username: 'resident.b0802', email: 'resident.b0802@example.com' },
    { code: 'B1001', sqm: 38.10, name: '邱俊傑', username: 'resident.b1001', email: 'resident.b1001@example.com' },
    { code: 'B1002', sqm: 36.40, name: '葉宛真', username: 'resident.b1002', email: 'resident.b1002@example.com' },

    // C 棟 — 低樓層、小坪數
    { code: 'C0101', sqm: 22.30, name: '阮志明', username: 'resident.c0101', email: 'resident.c0101@example.com' },
    { code: 'C0102', sqm: 21.50, name: '柯曉雯', username: 'resident.c0102', email: 'resident.c0102@example.com' },
    { code: 'C0201', sqm: 24.10, name: '賴家興', username: 'resident.c0201', email: 'resident.c0201@example.com' },
    { code: 'C0202', sqm: 23.40, name: '范佩玲', username: 'resident.c0202', email: 'resident.c0202@example.com' },
    { code: 'C0301', sqm: 25.80, name: '游文宏', username: 'resident.c0301', email: 'resident.c0301@example.com' },
    { code: 'C0302', sqm: 24.60, name: '羅淑惠', username: 'resident.c0302', email: 'resident.c0302@example.com' },
    { code: 'C0401', sqm: 26.10, name: '丁建良', username: 'resident.c0401', email: 'resident.c0401@example.com' },
    { code: 'C0402', sqm: 25.40, name: '杜美玲', username: 'resident.c0402', email: 'resident.c0402@example.com' },
    { code: 'C0501', sqm: 27.20, name: '宋志偉', username: 'resident.c0501', email: 'resident.c0501@example.com' },

    // 三戶尚未綁帳號
    { code: 'C0502', sqm: 26.40, name: 'C0502 戶（未綁帳號）', username: null, email: null },
    { code: 'C0601', sqm: 28.00, name: 'C0601 戶（未綁帳號）', username: null, email: null },
    { code: 'B1201', sqm: 39.50, name: 'B1201 戶（未綁帳號）', username: null, email: null },
  ];

  const residents = [];
  for (const r of residentSeeds) {
    residents.push(
      await prisma.resident.create({
        data: {
          communityId: community.id,
          code: r.code,
          residentSqm: r.sqm,
          username: r.username,
          password: r.username ? await hash(`${r.code.toLowerCase()}123`) : null,
          email: r.email,
        },
      }),
    );
  }

  const totalSqm = residents.reduce((s, r) => s + r.residentSqm, 0);
  const totalUnits = residents.length;
  console.log(`  · 共 ${totalUnits} 戶 · 總坪數 ${totalSqm.toFixed(2)}`);

  // 把住戶分群以便不同會議反映出不同的出席行為（積極 / 偶爾 / 從不）
  const byCode = (code) => residents.find((r) => r.code === code);
  const activeAttendees = [
    'A0301','A0501','A0502','A0701','A0901','A0902','A1101','A1102',
    'B0201','B0401','B0601','B0801','B1001',
    'C0101','C0201','C0301','C0401','C0501',
  ].map(byCode); // 18 戶：出席率最高
  const occasionalAttendees = [
    'A0302','A0702','B0202','B0402','B0602','B0802','B1002',
    'C0102','C0202','C0302','C0402',
  ].map(byCode); // 11 戶：僅偶爾出席年度大會
  // 剩餘 3 戶為未綁帳號，不出席

  // ============================================================
  // 會議
  //
  // 門檻欄位為「比例」：sqmThreshold = 出席坪數 / 總坪數 應達多少
  //                  residentThreshold = 出席戶數 / 總戶數 應達多少
  // 首次召集會議依公寓大廈管理條例為 2/3（0.667），重新召集會議放寬至 1/5（0.2）
  // 一般決議過半（0.5），重大決議（如外牆拉皮、修改規約）需 3/4 表決同意
  // ============================================================

  // --- 會議 1：113 年度區分所有權人會議（已完成、達門檻）---
  const m1Start = daysAgo(75, 19, 0);
  const agm2024 = await prisma.meeting.create({
    data: {
      name: '113 年度區分所有權人會議',
      date: m1Start,
      status: 'completed',
      sqmThreshold: 0.667,
      residentThreshold: 0.667,
      communityId: community.id,
      createAdminUserId: chair.id,
    },
  });

  // --- 會議 2：外牆拉皮首次召集（流會）---
  const m2Start = daysAgo(45, 19, 30);
  const facadeAttempt = await prisma.meeting.create({
    data: {
      name: '外牆拉皮修繕工程臨時會（首次召集）',
      date: m2Start,
      status: 'cancelled', // 流會：未達 2/3 法定出席門檻
      sqmThreshold: 0.667,
      residentThreshold: 0.667,
      communityId: community.id,
      createAdminUserId: chair.id,
    },
  });

  // --- 會議 3：外牆拉皮重新召集（已完成、低門檻通過）---
  const m3Start = daysAgo(30, 19, 30);
  const facadeReconvened = await prisma.meeting.create({
    data: {
      name: '外牆拉皮修繕工程臨時會（重新召集）',
      date: m3Start,
      status: 'completed',
      sqmThreshold: 0.2,
      residentThreshold: 0.2,
      communityId: community.id,
      createAdminUserId: chair.id,
    },
  });

  // --- 會議 4：年中臨時會議（已完成、含否決案）---
  const m4Start = daysAgo(10, 19, 0);
  const midYearExtra = await prisma.meeting.create({
    data: {
      name: '年中臨時會議（安全與設施改善）',
      date: m4Start,
      status: 'completed',
      sqmThreshold: 0.5,
      residentThreshold: 0.5,
      communityId: community.id,
      createAdminUserId: viceChair.id,
    },
  });

  // --- 會議 5：上半年度檢討會議（進行中）---
  const m5Start = new Date();
  m5Start.setHours(19, 0, 0, 0);
  const ongoingMeeting = await prisma.meeting.create({
    data: {
      name: '114 年度上半年度檢討會議',
      date: m5Start,
      status: 'ongoing',
      sqmThreshold: 0.5,
      residentThreshold: 0.5,
      communityId: community.id,
      createAdminUserId: chair.id,
    },
  });

  // --- 會議 6：第三季財務檢討（預定）---
  const upcomingQ3 = await prisma.meeting.create({
    data: {
      name: '第三季財務檢討會議',
      date: daysFromNow(21, 19, 30),
      status: 'pending',
      sqmThreshold: 0.5,
      residentThreshold: 0.5,
      communityId: community.id,
      createAdminUserId: viceChair.id,
    },
  });

  // ============================================================
  // 報到紀錄
  // ============================================================
  // 報到時間落在會議前 40 分鐘至開始後 20 分鐘之間
  // ~75% QR 掃碼（isManual=false），~25% 手動補登
  async function attend(meeting, attendees, handler, opts = {}) {
    const { manualIndices = new Set(), spreadMinutes = 60, startOffset = -40 } = opts;
    const total = attendees.length;
    for (let i = 0; i < total; i++) {
      const offset = startOffset + (i / total) * spreadMinutes;
      await prisma.meetingAttendanceLog.create({
        data: {
          meetingId: meeting.id,
          residentId: attendees[i].id,
          createAdminUserId: handler.id,
          isManual: manualIndices.has(i),
          checkedInAt: addMinutes(meeting.date, offset),
        },
      });
    }
  }

  // 會議 1：積極 18 戶全到 + 偶爾 8 戶 = 26 戶（81% 出席，達 2/3）
  const m1Attendees = [...activeAttendees, ...occasionalAttendees.slice(0, 8)];
  await attend(agm2024, m1Attendees, asstJennifer, {
    manualIndices: new Set([3, 11, 18, 23]),
  });

  // 會議 2：僅積極中 11 戶到場（34% 出席，未達 2/3，流會）
  const m2Attendees = activeAttendees.slice(0, 11);
  await attend(facadeAttempt, m2Attendees, asstDavid, {
    manualIndices: new Set([2, 7]),
    spreadMinutes: 30,
  });

  // 會議 3：積極 16 戶 + 偶爾 4 戶 = 20 戶（63% 出席，遠超 1/5）
  const m3Attendees = [...activeAttendees.slice(0, 16), ...occasionalAttendees.slice(0, 4)];
  await attend(facadeReconvened, m3Attendees, asstDavid, {
    manualIndices: new Set([5, 12, 17]),
  });

  // 會議 4：積極 15 戶 + 偶爾 5 戶 = 20 戶（63% 出席）
  const m4Attendees = [...activeAttendees.slice(0, 15), ...occasionalAttendees.slice(0, 5)];
  await attend(midYearExtra, m4Attendees, asstJennifer, {
    manualIndices: new Set([4, 10, 16, 19]),
  });

  // 會議 5（進行中）：目前已到積極 12 戶（37%）
  const m5Attendees = activeAttendees.slice(0, 12);
  await attend(ongoingMeeting, m5Attendees, asstJennifer, {
    manualIndices: new Set([1, 8]),
    spreadMinutes: 50,
  });

  // ============================================================
  // 提案與投票
  //
  // 投票結果直接呼應出席分布；含一案流會無表決、一案否決、一案高度爭議過關、一案尚未開放表決
  // ============================================================
  async function castVotes(proposal, meeting, attendees, distribution, supervisor, voteStartOffsetMin = 60) {
    const { agree, disagree, voidCount = 0 } = distribution;
    const total = agree + disagree + voidCount;
    if (total > attendees.length) {
      throw new Error(`Vote count ${total} exceeds attendee count ${attendees.length} for ${proposal.title}`);
    }
    const voteWindowStart = addMinutes(meeting.date, voteStartOffsetMin);
    for (let i = 0; i < total; i++) {
      let result = 'void';
      if (i < agree) result = 'agree';
      else if (i < agree + disagree) result = 'disagree';
      await prisma.voteLog.create({
        data: {
          proposalId: proposal.id,
          residentId: attendees[i].id,
          result,
          createAdminUserId: supervisor.id,
          votedAt: addMinutes(voteWindowStart, i * 0.5),
        },
      });
    }
  }

  // ---- 會議 1 提案（26 出席）----
  const p_m1_1 = await prisma.proposal.create({
    data: {
      meetingId: agm2024.id,
      title: '承認 112 年度財務報表暨管委會工作報告',
      content:
        '經外部記帳士查核之 112 年度收支結算表、資產負債表與管委會年度工作報告，業已於會議手冊附件一公告，提請住戶承認。',
      sqmThreshold: 0.5,
      residentThreshold: 0.5,
      createAdminUserId: chair.id,
    },
  });
  const p_m1_2 = await prisma.proposal.create({
    data: {
      meetingId: agm2024.id,
      title: '管理費自 114 年 1 月起每坪自 80 元調整為 88 元',
      content:
        '近兩年清潔外包與保全人事成本持續上漲，管委會檢視收支結構後，建議調整管理費 10%，每月社區公共基金預估可增收約 14,000 元，俾維持原服務水準。',
      sqmThreshold: 0.5,
      residentThreshold: 0.5,
      createAdminUserId: chair.id,
    },
  });
  const p_m1_3 = await prisma.proposal.create({
    data: {
      meetingId: agm2024.id,
      title: '改選 114~115 年度第十一屆管理委員會委員',
      content:
        '依規約規定改選主委、副主委及委員共 5 名。候選人名單與經歷簡介詳會議手冊附件二，現場記名投票。',
      sqmThreshold: 0.5,
      residentThreshold: 0.5,
      createAdminUserId: viceChair.id,
    },
  });
  const p_m1_4 = await prisma.proposal.create({
    data: {
      meetingId: agm2024.id,
      title: '社區公共光纖網路自 500Mbps 升級為 2Gbps',
      content:
        '與現有電信業者重新議約，將社區公設區域光纖速率提升 4 倍，每月加收費用約 3,000 元，自管理費支應。',
      sqmThreshold: 0.5,
      residentThreshold: 0.5,
      createAdminUserId: viceChair.id,
    },
  });
  await castVotes(p_m1_1, agm2024, m1Attendees, { agree: 24, disagree: 1, voidCount: 1 }, asstJennifer, 30);
  await castVotes(p_m1_2, agm2024, m1Attendees, { agree: 15, disagree: 9, voidCount: 2 }, asstJennifer, 50); // 爭議勉強過半
  await castVotes(p_m1_3, agm2024, m1Attendees, { agree: 23, disagree: 2, voidCount: 1 }, asstJennifer, 75);
  await castVotes(p_m1_4, agm2024, m1Attendees, { agree: 18, disagree: 6, voidCount: 2 }, asstJennifer, 100);

  // ---- 會議 2 流會（無表決）----
  await prisma.proposal.create({
    data: {
      meetingId: facadeAttempt.id,
      title: '通過外牆拉皮修繕工程合約（金額 1,200 萬元）— 因流會未表決',
      content:
        '原議案擬將外牆拉皮工程交由「鼎峰營造股份有限公司」承攬，工期 6 個月。因本次會議出席比例僅 34%，未達區分所有權人 2/3 之法定出席門檻，宣告流會，本案順延至重新召集會議處理。',
      sqmThreshold: 0.667,
      residentThreshold: 0.667,
      createAdminUserId: chair.id,
    },
  });

  // ---- 會議 3 重新召集（20 出席）----
  const p_m3_1 = await prisma.proposal.create({
    data: {
      meetingId: facadeReconvened.id,
      title: '通過外牆拉皮修繕工程合約並交由鼎峰營造承攬',
      content:
        '前次會議因出席不足流會，本次依公寓大廈管理條例第 32 條重新召集，出席門檻放寬為 1/5。本案屬重大決議，須出席人數 3/4 同意方可通過。經比價評估，鼎峰營造於價格、保固條件與既往實績均優於其他兩家投標廠商。',
      sqmThreshold: 0.75,
      residentThreshold: 0.75,
      createAdminUserId: chair.id,
    },
  });
  const p_m3_2 = await prisma.proposal.create({
    data: {
      meetingId: facadeReconvened.id,
      title: '依坪數比例分攤外牆修繕基金，每坪 4,500 元並分 18 期繳納',
      content:
        '外牆修繕工程經費部分由公共基金支應，不足款項依各戶所有權坪數比例分攤。住戶得申請暫緩繳納，由管委會就個案審議。',
      sqmThreshold: 0.5,
      residentThreshold: 0.5,
      createAdminUserId: chair.id,
    },
  });
  await castVotes(p_m3_1, facadeReconvened, m3Attendees, { agree: 16, disagree: 3, voidCount: 1 }, asstDavid, 45); // 80% 同意 → 達 3/4
  await castVotes(p_m3_2, facadeReconvened, m3Attendees, { agree: 13, disagree: 6, voidCount: 1 }, asstDavid, 75);

  // ---- 會議 4 年中臨時會（20 出席，含否決案）----
  const p_m4_1 = await prisma.proposal.create({
    data: {
      meetingId: midYearExtra.id,
      title: '社區大門門禁系統升級為人臉辨識',
      content:
        '將現有感應卡式門禁升級為人臉辨識系統，涵蓋 A、B、C 三棟大廳共 6 處出入口，預算約 90 萬元。原感應卡保留作為備援，住戶可自由選擇是否註冊生物辨識。',
      sqmThreshold: 0.5,
      residentThreshold: 0.5,
      createAdminUserId: chair.id,
    },
  });
  const p_m4_2 = await prisma.proposal.create({
    data: {
      meetingId: midYearExtra.id,
      title: '消防設備年度檢修委外案，委由全安消防工程承攬',
      content:
        '依法須委外辦理消防安全設備檢修申報。共收三家投標，全安消防工程為符合資格之最低標，三年期合約年度預算 8.5 萬元。',
      sqmThreshold: 0.5,
      residentThreshold: 0.5,
      createAdminUserId: viceChair.id,
    },
  });
  const p_m4_3 = await prisma.proposal.create({
    data: {
      meetingId: midYearExtra.id,
      title: 'C 棟頂樓改建為住戶專屬交誼空間（本案否決）',
      content:
        '提案將 C 棟頂樓閒置空間改建為住戶交誼區，含座椅、烤肉設備及遮陽結構，預算 250 萬元。會議中多位委員與住戶對噪音、消防疏散與長期維護成本提出疑慮。',
      sqmThreshold: 0.5,
      residentThreshold: 0.5,
      createAdminUserId: viceChair.id,
    },
  });
  await castVotes(p_m4_1, midYearExtra, m4Attendees, { agree: 14, disagree: 5, voidCount: 1 }, asstJennifer, 35);
  await castVotes(p_m4_2, midYearExtra, m4Attendees, { agree: 18, disagree: 1, voidCount: 1 }, asstJennifer, 60);
  await castVotes(p_m4_3, midYearExtra, m4Attendees, { agree: 7, disagree: 12, voidCount: 1 }, asstJennifer, 85); // 否決

  // ---- 會議 5 進行中（12 出席）----
  const p_m5_1 = await prisma.proposal.create({
    data: {
      meetingId: ongoingMeeting.id,
      title: '地下停車場照明全面更換為節能 LED',
      content:
        '將 B1、B2 停車場既有日光燈管更換為節能 LED 燈具。預估每年可節省電費 12 萬元，工程預算 45 萬元，自公共基金支應。',
      sqmThreshold: 0.5,
      residentThreshold: 0.5,
      createAdminUserId: viceChair.id,
    },
  });
  const p_m5_2 = await prisma.proposal.create({
    data: {
      meetingId: ongoingMeeting.id,
      title: '社區健身房新增跑步機 2 台、飛輪 2 台',
      content:
        '社區健身房使用率提高，現有器材不敷需求。預算 18 萬元，由北峰健身器材供應並提供三年到府維修服務。',
      sqmThreshold: 0.5,
      residentThreshold: 0.5,
      createAdminUserId: viceChair.id,
    },
  });
  const p_m5_3 = await prisma.proposal.create({
    data: {
      meetingId: ongoingMeeting.id,
      title: '修改規約：禁止住戶將戶內出租為 30 日以下短期租賃',
      content:
        '近期多戶反映短租客出入對社區安寧與安全造成困擾，提案修改規約，明定禁止 30 日以下短期出租。本案屬規約變更，須出席人數 3/4 以上同意方可通過。',
      sqmThreshold: 0.75,
      residentThreshold: 0.75,
      createAdminUserId: chair.id,
    },
  });
  // 進行中：前兩案已投票完畢；第三案為高門檻爭議案，議程尚未走到
  await castVotes(p_m5_1, ongoingMeeting, m5Attendees, { agree: 10, disagree: 1, voidCount: 1 }, asstJennifer, 25);
  await castVotes(p_m5_2, ongoingMeeting, m5Attendees, { agree: 9, disagree: 2, voidCount: 1 }, asstJennifer, 50);

  console.log('✅ Seed 完成');
  console.log('');
  console.log('=== 概要 ===');
  console.log(`社區     ：${community.name}`);
  console.log(`管理員    ：6 位（1 系統管理員 / 2 委員 / 2 助理 / 1 停用）`);
  console.log(`住戶     ：${residents.length} 戶（3 戶未綁帳號）`);
  console.log(`會議     ：1 流會、3 已完成、1 進行中、1 預定`);
  console.log(`提案     ：12 條（1 流會未表決、1 否決、1 尚未開放、9 通過）`);
  console.log('');
  console.log('=== 管理員登入 ===');
  console.log('admin001     / test1234      （系統管理員）');
  console.log('m.thompson   / manager123    （主委 Michael）');
  console.log('s.mitchell   / manager123    （副主委 Sarah）');
  console.log('j.rodriguez  / assist123     （會議助理 Jennifer）');
  console.log('d.park       / assist123     （會議助理 David）');
  console.log('r.wilson     / disabled123   （已停用，登入應被拒絕）');
  console.log('');
  console.log('=== 住戶登入 ===');
  console.log('username = resident.<門牌小寫>   password = <門牌小寫>123');
  console.log('例：resident.a0301 / a0301123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
