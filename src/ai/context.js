/**
 * Dashboard Context Builder
 *
 * Generates a structured text snapshot of all dashboard data
 * to inject into the system prompt. The LLM reasons ONLY
 * on this context — no external data access.
 */

import {
  kpiCards,
  alerts,
  monthlyRevenue,
  revenueByService,
  teamTable,
  teamStats,
  funnelStages,
  overallConversion,
  leakageAnalysis,
  avgTimePerStage,
  conversionTrend,
  callsVsDeals,
  forecastDefaults,
} from '../dashboard/data/mockData';

function section(title, content) {
  return `### ${title}\n${content}`;
}

function buildKPIs() {
  const lines = kpiCards.map(
    (k) => `- ${k.label}: ${k.value} (${k.deltaDirection === 'up' ? '+' : '-'}${k.delta} ${k.deltaLabel})`
  );
  return section('KPI — מדדים עיקריים', lines.join('\n'));
}

function buildAlerts() {
  const lines = alerts.map(
    (a) => `- [${a.variant}] ${a.title}: ${a.description}`
  );
  return section('התראות פעילות', lines.join('\n'));
}

function buildRevenue() {
  const monthly = monthlyRevenue
    .map((m) => `- ${m.month}: ₪${m.value.toLocaleString()}`)
    .join('\n');

  const byService = revenueByService
    .map((s) => `- ${s.name}: ${s.value}%`)
    .join('\n');

  return [
    section('הכנסות חודשיות (מגמה)', monthly),
    section('הכנסות לפי קו שירות', byService),
  ].join('\n\n');
}

function buildTeam() {
  const header = `סה"כ נציגים פעילים: ${teamStats.activeReps} | ממוצע המרה: ${teamStats.avgConversionRate} | כוכב החודש: ${teamStats.starOfMonth}`;

  const rows = teamTable.rows
    .map(
      (r) =>
        `- ${r.name}: ${r.deals} עסקאות, ${r.revenue} הכנסות, המרה ${r.closeRate}, ממוצע ${r.avgDeal}, זמן סגירה ${r.closeTime}, סטטוס ${r.status}`
    )
    .join('\n');

  return section('ביצועי צוות', `${header}\n${rows}`);
}

function buildFunnel() {
  const stages = funnelStages
    .map((s) => {
      let line = `- ${s.label}: ${s.value} (${s.percent})`;
      if (s.conversionRate) line += ` | המרה: ${s.conversionRate}`;
      if (s.droppedPercent) line += ` | נשירה: ${s.droppedPercent}`;
      if (s.insight) line += ` | ${s.insight}`;
      return line;
    })
    .join('\n');

  const overall = `המרה כוללת: ${overallConversion.rate} (יעד: ${overallConversion.target}) | ${overallConversion.deals} עסקאות | מתחת ליעד ב-${overallConversion.belowTarget}`;

  return section('משפך מכירות', `${stages}\n${overall}`);
}

function buildLeakage() {
  const lines = leakageAnalysis
    .map(
      (l) =>
        `- ${l.stage}: ${l.lost} ${l.lostLabel} (${l.rate}) | סיבה: ${l.reason} | פעולה: ${l.action} | עדיפות: ${l.priority}`
    )
    .join('\n');
  return section('ניתוח דליפות', lines);
}

function buildTimePerStage() {
  const lines = avgTimePerStage
    .map(
      (s) => `- ${s.stage}: בפועל ${s.actual} ימים (יעד: ${s.target} ימים)`
    )
    .join('\n');
  return section('זמן ממוצע לכל שלב', lines);
}

function buildConversionTrend() {
  const lines = conversionTrend
    .map((m) => {
      const reps = Object.entries(m)
        .filter(([k]) => k !== 'month')
        .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}%`)
        .join(', ');
      return `- ${m.month}: ${reps}`;
    })
    .join('\n');
  return section('מגמת המרה (3 חודשים)', lines);
}

function buildCallsVsDeals() {
  const lines = callsVsDeals
    .map((c) => `- ${c.name}: ${c.calls} שיחות → ${c.deals} עסקאות`)
    .join('\n');
  return section('שיחות מול עסקאות', lines);
}

function buildForecast() {
  const d = forecastDefaults;
  const lines = [
    `- Show Rate: ${d.showRate}%`,
    `- Offer Rate: ${d.offerRate}%`,
    `- Close Rate: ${d.closeRate}%`,
    `- MQL → Qualified Call: ${d.mqlToQcall}%`,
    `- יעד הכנסות: ₪${d.revenueTarget.toLocaleString()}`,
    `- MER: ${d.mer}`,
    `- AOV: ₪${d.aov.toLocaleString()}`,
    `- עסקאות נדרשות: ${d.requiredDeals}`,
    `- MQLs נדרשים: ${d.requiredMQLs}`,
    `- תקציב מקסימלי: ₪${Math.round(d.maxBudget).toLocaleString()}`,
  ];
  return section('פרמטרי תחזית', lines.join('\n'));
}

/**
 * Build the full dashboard context string.
 * This gets injected into the system prompt at {{DASHBOARD_CONTEXT}}.
 */
export function buildDashboardContext() {
  return [
    buildKPIs(),
    buildAlerts(),
    buildRevenue(),
    buildTeam(),
    buildFunnel(),
    buildLeakage(),
    buildTimePerStage(),
    buildConversionTrend(),
    buildCallsVsDeals(),
    buildForecast(),
  ].join('\n\n');
}
