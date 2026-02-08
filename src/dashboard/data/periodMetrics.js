import { monthlyRevenue } from "./mockData.js";

const RANGE_OPTIONS = [
  { value: "day", label: "יום" },
  { value: "week", label: "שבוע" },
  { value: "two-weeks", label: "שבועיים" },
  { value: "month", label: "חודש אחרון" },
];

const RANGE_MULTIPLIERS = {
  day: 0.15,
  week: 0.4,
  "two-weeks": 0.65,
  month: 1,
};

const KPI_DEFS = [
  {
    key: "revenue",
    label: (rangeLabel) => `סהכ הכנסות - ${rangeLabel}`,
    baseValue: 6931000,
    icon: "dollar",
    delta: 12,
    deltaDirection: "up",
  },
  {
    key: "deals",
    label: "מספר עסקאות שנסגרו",
    baseValue: 229,
    icon: "briefcase",
    delta: 8,
    deltaDirection: "up",
  },
  {
    key: "avgDeal",
    label: "גודל עסקה ממוצע",
    baseValue: 30574,
    icon: "chart",
    delta: 3,
    deltaDirection: "down",
  },
  {
    key: "closeTime",
    label: "זמן סגירה ממוצע",
    baseValue: 4,
    icon: "clock",
    delta: 0.5,
    deltaDirection: "down",
    unit: "days",
  },
];

function mulberry32(seed) {
  let t = seed;
  return function rand() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromKey(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) + 1;
}

function formatCurrency(value) {
  return `₪${Math.round(value).toLocaleString("he-IL")}`;
}

function formatNumber(value) {
  return Math.round(value).toLocaleString("he-IL");
}

function formatDays(value) {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} ימים`;
}

function getRangeLabel(value) {
  return RANGE_OPTIONS.find((option) => option.value === value)?.label ?? "";
}

function generateSeries(rangeKey) {
  if (rangeKey === "month") {
    return monthlyRevenue.map((row) => ({ label: row.month, value: row.value }));
  }

  const baseAvg = monthlyRevenue.reduce((sum, row) => sum + row.value, 0) / monthlyRevenue.length;
  const multiplier = RANGE_MULTIPLIERS[rangeKey] || 1;
  const rand = mulberry32(seedFromKey(`series-${rangeKey}`));

  let points = 7;
  let labels = [];

  if (rangeKey === "day") {
    labels = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
    points = labels.length;
  } else if (rangeKey === "two-weeks") {
    points = 14;
    labels = Array.from({ length: points }, (_, i) => `יום ${i + 1}`);
  } else if (rangeKey === "week") {
    labels = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
    points = labels.length;
  }

  const series = Array.from({ length: points }, (_, idx) => {
    const noise = 0.85 + rand() * 0.35;
    const trend = 1 - idx / (points * 3.5);
    return {
      label: labels[idx],
      value: Math.max(0, Math.round(baseAvg * multiplier * noise * trend)),
    };
  });

  return series;
}

function scaleValue(baseValue, multiplier, unit) {
  if (unit === "days") {
    const soften = 1 - (1 - multiplier) * 0.4;
    return baseValue * soften;
  }
  return baseValue * multiplier;
}

function buildKpis(rangeKey) {
  const multiplier = RANGE_MULTIPLIERS[rangeKey] || 1;
  const rangeLabel = getRangeLabel(rangeKey);

  return KPI_DEFS.map((kpi) => {
    const rand = mulberry32(seedFromKey(`${rangeKey}-${kpi.key}`));
    const jitter = 0.94 + rand() * 0.12;
    const scaled = scaleValue(kpi.baseValue, multiplier, kpi.unit) * jitter;
    const formatter = kpi.unit === "days" ? formatDays : kpi.key === "deals" ? formatNumber : formatCurrency;

    return {
      key: kpi.key,
      label: typeof kpi.label === "function" ? kpi.label(rangeLabel) : kpi.label,
      value: formatter(scaled),
      delta: `${kpi.delta}%`,
      deltaDirection: kpi.deltaDirection,
      deltaLabel: "לעומת התקופה הקודמת",
      icon: kpi.icon,
    };
  });
}

export function getPeriodMetrics(rangeKey) {
  return {
    chartData: generateSeries(rangeKey),
    kpis: buildKpis(rangeKey),
  };
}

export function getTimeRangeOptions() {
  return RANGE_OPTIONS;
}
