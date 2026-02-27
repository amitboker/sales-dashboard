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
    return [
      "### סטטוס נתונים — מצב דמו",
      "המשתמש צופה בנתוני דוגמה (מצב דמו). הנתונים אינם אמיתיים.",
      "",
      "נתוני דוגמה מרכזיים:",
      "- הכנסות חודשיות: ₪6,900,000",
      "- עסקאות פתוחות: 229",
      "- שיעור המרה: 34%",
      "- גודל עסקה ממוצע: ₪30,131",
      "- יעד חודשי: ₪8,000,000 (86% השגה)",
      "",
      "ענה על שאלות לגבי הנתונים המוצגים, אך ציין שמדובר בנתוני דוגמה.",
    ].join("\n");
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
