import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ─── Users (Team Members) ──────────────────────────────────────────────────

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "נועם לויגנר",
        phone: "052-123-4567",
        initials: "נל",
        role: "agent",
        color: "#5e7768",
      },
    }),
    prisma.user.create({
      data: {
        name: "שירה כהן",
        phone: "054-234-5678",
        initials: "שכ",
        role: "agent",
        color: "#5e7768",
      },
    }),
    prisma.user.create({
      data: {
        name: "יונתן אבישי",
        phone: "050-345-6789",
        initials: "יא",
        role: "agent",
        color: "#e4b85c",
      },
    }),
    prisma.user.create({
      data: {
        name: "רוני ברק",
        phone: "053-456-7890",
        initials: "רב",
        role: "agent",
        color: "#e4b85c",
      },
    }),
    prisma.user.create({
      data: {
        name: "מיכל ברק",
        phone: "058-567-8901",
        initials: "MB",
        role: "agent",
        color: "#e4b85c",
      },
    }),
    prisma.user.create({
      data: {
        name: "זיבי שמש",
        phone: "052-678-9012",
        initials: "AS",
        role: "agent",
        color: "#d98282",
      },
    }),
    prisma.user.create({
      data: {
        name: "תמר גולן",
        phone: "054-789-0123",
        initials: "TG",
        role: "agent",
        color: "#d98282",
      },
    }),
    prisma.user.create({
      data: {
        name: "עומר דוד",
        phone: "050-890-1234",
        initials: "OD",
        role: "agent",
        color: "#d98282",
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // ─── Monthly Snapshot ──────────────────────────────────────────────────────

  const snapshot = await prisma.monthlySnapshot.create({
    data: {
      month: "2026-01",
      totalRevenue: 6931000,
      dealsCount: 229,
      avgDealSize: 30574,
      avgCloseTime: 4,
    },
  });

  // Service breakdowns
  await prisma.serviceBreakdown.createMany({
    data: [
      { serviceName: "כרטיס ועמידים", revenuePercent: 26, color: "#5a7c5f", monthlySnapshotId: snapshot.id },
      { serviceName: "ביטוח וחסכון", revenuePercent: 25, color: "#7d9d7e", monthlySnapshotId: snapshot.id },
      { serviceName: "הלוואות וניכיון", revenuePercent: 25, color: "#a8c5a8", monthlySnapshotId: snapshot.id },
      { serviceName: "ייעוץ פיננסי", revenuePercent: 24, color: "#c5dac5", monthlySnapshotId: snapshot.id },
    ],
  });

  // Funnel snapshots
  await prisma.funnelSnapshot.createMany({
    data: [
      { stage: "לידים נכנסים", count: 420, percent: 100, conversionRate: null, droppedCount: null, droppedPercent: null, avgTimeInStage: 1, targetTimeInStage: 1, monthlySnapshotId: snapshot.id },
      { stage: "שיחה נענתה", count: 320, percent: 76, conversionRate: 76, droppedCount: 0, droppedPercent: 24, avgTimeInStage: 1.5, targetTimeInStage: 1, monthlySnapshotId: snapshot.id },
      { stage: "נשלח קטלוג", count: 198, percent: 47, conversionRate: 62, droppedCount: 100, droppedPercent: 38, avgTimeInStage: 3, targetTimeInStage: 2, monthlySnapshotId: snapshot.id },
      { stage: "נשלחה הצעת מחיר", count: 115, percent: 27, conversionRate: 58, droppedCount: 122, droppedPercent: 42, avgTimeInStage: 6, targetTimeInStage: 4, monthlySnapshotId: snapshot.id },
      { stage: "עסקה נסגרה", count: 87, percent: 20.7, conversionRate: 76, droppedCount: 83, droppedPercent: 24, avgTimeInStage: 4, targetTimeInStage: 3, monthlySnapshotId: snapshot.id },
    ],
  });

  // Team snapshots
  const teamData = [
    { idx: 0, deals: 18, revenue: 624000, closeRate: 28, avgDealSize: 34700, avgCloseTime: 3.2, callsCount: 140, status: "green" },
    { idx: 1, deals: 15, revenue: 547000, closeRate: 24, avgDealSize: 36500, avgCloseTime: 3.8, callsCount: 125, status: "green" },
    { idx: 2, deals: 12, revenue: 418000, closeRate: 22, avgDealSize: 34800, avgCloseTime: 4.1, callsCount: 110, status: "yellow" },
    { idx: 3, deals: 11, revenue: 389000, closeRate: 19, avgDealSize: 35400, avgCloseTime: 5.2, callsCount: 90, status: "yellow" },
    { idx: 4, deals: 9, revenue: 312000, closeRate: 17, avgDealSize: 34700, avgCloseTime: 4.8, callsCount: 80, status: "yellow" },
    { idx: 5, deals: 8, revenue: 276000, closeRate: 15, avgDealSize: 34500, avgCloseTime: 6.1, callsCount: 70, status: "red" },
    { idx: 6, deals: 7, revenue: 198000, closeRate: 13, avgDealSize: 28300, avgCloseTime: 5.9, callsCount: 60, status: "red" },
    { idx: 7, deals: 7, revenue: 183000, closeRate: 12, avgDealSize: 26100, avgCloseTime: 7.2, callsCount: 55, status: "red" },
  ];

  await prisma.teamSnapshot.createMany({
    data: teamData.map((t) => ({
      userId: users[t.idx].id,
      monthlySnapshotId: snapshot.id,
      deals: t.deals,
      revenue: t.revenue,
      closeRate: t.closeRate,
      avgDealSize: t.avgDealSize,
      avgCloseTime: t.avgCloseTime,
      callsCount: t.callsCount,
      status: t.status,
    })),
  });

  // ─── Alerts ────────────────────────────────────────────────────────────────

  await prisma.alert.createMany({
    data: [
      { title: "דליפת לידים קריטית", description: "38% מההצעות ללא מעקב", variant: "danger", icon: "error" },
      { title: "3 מוקדנים מתחת ליעד", description: "2 חודשים ברציפות", variant: "warning", icon: "warning" },
      { title: "עסקה גדולה", description: "לקוח חדש - ₪180K בדיון סופי", variant: "success", icon: "check" },
      { title: "זמן סגירה ממוצע עלה", description: "עלייה של 15% בחודש האחרון", variant: "danger", icon: "error" },
    ],
  });

  // ─── Forecast Config ───────────────────────────────────────────────────────

  await prisma.forecastConfig.create({
    data: {
      name: "default",
      showRate: 80,
      offerRate: 70,
      closeRate: 7,
      mqlToQcall: 30,
      revenueTarget: 200000,
      mer: 3.5,
      aov: 8000,
      maxBudget: 57142.86,
      maxCPA: 2285.71,
      maxCostPerLead: 129.6,
      maxCostPerCall: 259.2,
    },
  });

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
