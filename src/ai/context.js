/**
 * Dashboard Context Builder
 *
 * Generates a structured text snapshot of dashboard data
 * to inject into the system prompt. The LLM reasons ONLY
 * on this context — no external data access.
 *
 * When the user has no connected data source, returns a
 * "no data yet" message so the AI can help them get started.
 */

import {
  kpiCards,
  alerts,
  monthlyRevenue,
  revenueByService,
  teamTable,
  funnelStages,
  overallConversion,
  criticalLeaks,
  leakageAnalysis,
  avgTimePerStage,
  conversionTrend,
  callsVsDeals,
  teamStats,
  forecastDefaults,
} from "../data/mockData.js";

function buildDemoContext() {
  const lines = [];

  lines.push("### סטטוס נתונים — מצב דמו");
  lines.push("המשתמש צופה בנתוני דוגמה (מצב דמו). הנתונים אינם אמיתיים.");
  lines.push("להלן כל הנתונים הזמינים במערכת הדמו. השתמש בהם כדי לענות על שאלות.");
  lines.push("");

  // --- KPI Summary ---
  lines.push("## מדדים מרכזיים (KPI)");
  for (const kpi of kpiCards) {
    const dir = kpi.deltaDirection === "up" ? "עלייה" : "ירידה";
    lines.push(`- ${kpi.label}: ${kpi.value} (${dir} של ${kpi.delta} ${kpi.deltaLabel})`);
  }
  lines.push("");

  // --- Alerts ---
  lines.push("## התראות");
  for (const a of alerts) {
    lines.push(`- [${a.variant}] ${a.title}: ${a.description}`);
  }
  lines.push("");

  // --- Monthly Revenue ---
  lines.push("## הכנסות חודשיות (מגמה)");
  for (const m of monthlyRevenue) {
    lines.push(`- ${m.month}: ₪${m.value.toLocaleString("he-IL")}`);
  }
  lines.push("");

  // --- Revenue by Service ---
  lines.push("## הכנסות לפי שירות");
  for (const s of revenueByService) {
    lines.push(`- ${s.name}: ${s.value}%`);
  }
  lines.push("");

  // --- Team Performance ---
  lines.push("## ביצועי צוות (טבלת מוקדנים)");
  const statusMap = { green: "תקין", yellow: "אזהרה", red: "מתחת ליעד" };
  for (const r of teamTable.rows) {
    lines.push(
      `- ${r.name}: ${r.deals} עסקאות, הכנסות ${r.revenue}, המרה ${r.closeRate}, ממוצע עסקה ${r.avgDeal}, זמן סגירה ${r.closeTime}, סטטוס: ${statusMap[r.status] || r.status}`
    );
  }
  lines.push("");

  // --- Sales Funnel ---
  lines.push("## משפך מכירות");
  for (const s of funnelStages) {
    let line = `- ${s.label}: ${s.value} (${s.percent} מהלידים)`;
    if (s.conversionRate) line += ` | המרה משלב קודם: ${s.conversionRate}`;
    if (s.droppedPercent && s.dropped !== 0) line += ` | נשירה: ${s.droppedPercent}`;
    if (s.insight) line += ` | תובנה: ${s.insight}`;
    lines.push(line);
  }
  lines.push("");

  // --- Overall Conversion ---
  lines.push("## המרה כוללת");
  lines.push(`- שיעור המרה כולל: ${overallConversion.rate} (יעד: ${overallConversion.target})`);
  lines.push(`- עסקאות שנסגרו מתוך לידים: ${overallConversion.deals}`);
  lines.push(`- פער מהיעד: ${overallConversion.belowTarget}`);
  lines.push(`- אחוז השגת יעד: ${overallConversion.progressPercent}%`);
  lines.push("");

  // --- Critical Leaks ---
  lines.push("## דליפות קריטיות");
  for (const l of criticalLeaks) {
    lines.push(`- ${l.description} — פתרון: ${l.solution}`);
  }
  lines.push("");

  // --- Leakage Analysis ---
  lines.push("## ניתוח דליפות לפי שלב");
  for (const l of leakageAnalysis) {
    lines.push(`- ${l.stage}: אובדן ${l.lost} ${l.lostLabel} (${l.rate}) | סיבה: ${l.reason} | פעולה: ${l.action} | עדיפות: ${l.priority}`);
  }
  lines.push("");

  // --- Avg Time Per Stage ---
  lines.push("## זמן ממוצע לפי שלב (ימים)");
  for (const s of avgTimePerStage) {
    const diff = s.actual > s.target ? ` (חריגה של ${(s.actual - s.target).toFixed(1)} ימים)` : " (בטווח היעד)";
    lines.push(`- ${s.stage}: בפועל ${s.actual} | יעד ${s.target}${diff}`);
  }
  lines.push("");

  // --- Conversion Trend ---
  lines.push("## מגמת המרה לפי מוקדן (3 חודשים)");
  for (const m of conversionTrend) {
    lines.push(`- ${m.month}: יוסי כהן ${m.יוסי_כהן}%, שירה לוי ${m.שירה_לוי}%, דוד מזרחי ${m.דוד_מזרחי}%, זיבי שמש ${m.זיבי_שמש}%`);
  }
  lines.push("");

  // --- Calls vs Deals ---
  lines.push("## שיחות מול עסקאות לפי מוקדן");
  for (const c of callsVsDeals) {
    lines.push(`- ${c.name}: ${c.calls} שיחות, ${c.deals} עסקאות`);
  }
  lines.push("");

  // --- Team Stats ---
  lines.push("## סיכום צוות");
  lines.push(`- מוקדנים פעילים: ${teamStats.activeReps}`);
  lines.push(`- שיעור המרה ממוצע: ${teamStats.avgConversionRate}`);
  lines.push(`- כוכב החודש: ${teamStats.starOfMonth}`);
  lines.push("");

  // --- Forecast Defaults ---
  lines.push("## ברירות מחדל לתחזית");
  lines.push(`- שיעור הגעה (Show Rate): ${forecastDefaults.showRate}%`);
  lines.push(`- שיעור הצעה (Offer Rate): ${forecastDefaults.offerRate}%`);
  lines.push(`- שיעור סגירה (Close Rate): ${forecastDefaults.closeRate}%`);
  lines.push(`- MQL to Qualified Call: ${forecastDefaults.mqlToQcall}%`);
  lines.push(`- יעד הכנסות: ₪${forecastDefaults.revenueTarget.toLocaleString("he-IL")}`);
  lines.push(`- MER: ${forecastDefaults.mer}`);
  lines.push(`- גודל הזמנה ממוצע (AOV): ₪${forecastDefaults.aov.toLocaleString("he-IL")}`);
  lines.push(`- תקציב מקסימלי: ₪${forecastDefaults.maxBudget.toLocaleString("he-IL")}`);
  lines.push(`- עלות רכישה מקסימלית (CPA): ₪${forecastDefaults.maxCPA.toLocaleString("he-IL")}`);
  lines.push(`- עלות ליד מקסימלית: ₪${forecastDefaults.maxCostPerLead}`);
  lines.push(`- עלות שיחה מקסימלית: ₪${forecastDefaults.maxCostPerCall}`);
  lines.push(`- עסקאות נדרשות: ${forecastDefaults.requiredDeals}`);
  lines.push(`- MQLs נדרשים: ${forecastDefaults.requiredMQLs}`);
  lines.push(`- שיחות מתאימות: ${forecastDefaults.qualifiedCalls}`);
  lines.push(`- שיחות בפועל: ${forecastDefaults.liveCalls}`);
  lines.push("");

  lines.push("ענה על שאלות לגבי הנתונים המוצגים, אך ציין שמדובר בנתוני דוגמה.");

  return lines.join("\n");
}

/**
 * Build the full dashboard context string.
 * This gets injected into the system prompt at {{DASHBOARD_CONTEXT}}.
 *
 * @param {object} [options]
 * @param {boolean} [options.hasData] - whether the user has connected data
 * @returns {string}
 */
export function buildDashboardContext({ hasData, isDemo } = {}) {
  if (isDemo) {
    return buildDemoContext();
  }

  if (!hasData) {
    return [
      "### סטטוס נתונים",
      "המשתמש טרם חיבר מקור נתונים למערכת.",
      "אין נתונים זמינים עדיין — עזור למשתמש להתחיל:",
      "- הסבר כיצד לחבר Google Sheets או CRM",
      "- הצע לעבור להגדרות כדי לחבר מקור נתונים",
      "- ענה על שאלות כלליות על ניהול מכירות וביצועים",
      "",
      "אל תציג נתונים מספריים או דוחות — אין מידע עסקי זמין.",
    ].join("\n");
  }

  // When real data integration exists, this will pull from the user's
  // actual data source. For now, return a placeholder.
  return [
    "### סטטוס נתונים",
    "מקור נתונים מחובר. הנתונים נטענים מהמערכת.",
  ].join("\n");
}
