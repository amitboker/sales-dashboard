import { useState, useMemo } from "react";
import PageHeader from "../components/PageHeader.jsx";
import InputRow from "../components/InputRow.jsx";
import SummaryTile from "../components/SummaryTile.jsx";
import Icon from "../components/Icon.jsx";
import { forecastDefaults } from "../data/mockData.js";

function fmt(n) {
  if (n == null || isNaN(n)) return "$0";
  return "$" + Math.round(n).toLocaleString();
}

function fmtPct(n) {
  if (n == null || isNaN(n)) return "0.00%";
  return n.toFixed(2) + "%";
}

function fmtNum(n) {
  if (n == null || isNaN(n)) return "0";
  return Math.round(n).toLocaleString();
}

/* ── Sidebar rate field ── */
function SidebarRateField({ icon, label, value, onChange, helper, computed }) {
  return (
    <div className={`sb-rate-card ${computed ? "sb-computed" : ""}`}>
      <div className="sb-rate-header">
        <Icon name={icon} size={16} style={{ filter: "sepia(1) saturate(5) hue-rotate(90deg) brightness(0.6)" }} />
        <span className="sb-rate-label">{label}</span>
      </div>
      {computed ? (
        <div className="sb-rate-value-ro">{value}</div>
      ) : (
        <div className="sb-rate-input-wrap">
          <input
            type="text"
            inputMode="decimal"
            className="sb-rate-input"
            value={value}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9.]/g, "");
              onChange(raw);
            }}
          />
          <span className="sb-rate-pct">%</span>
        </div>
      )}
      {!computed && (
        <div className="sb-rate-bar">
          <div
            className="sb-rate-bar-fill"
            style={{ width: `${Math.min(parseFloat(value) || 0, 100)}%` }}
          />
        </div>
      )}
      <div className="sb-rate-helper">{helper}</div>
    </div>
  );
}

/* ── Funnel metric card ── */
function FunnelMetric({ label, sublabel, value, formula }) {
  return (
    <div className="fn-metric" title={formula}>
      <div className="fn-metric-label">{label}</div>
      <div className="fn-metric-sub">{sublabel}</div>
      <div className="fn-metric-value">{value}</div>
    </div>
  );
}

/* ── Arrow separator ── */
function FunnelArrow() {
  return (
    <div className="fn-arrow-wrap">
      <Icon name="chevron-down" size={28} style={{ filter: "sepia(1) saturate(5) hue-rotate(90deg) brightness(0.6)" }} />
    </div>
  );
}

/* ── Funnel input field ── */
function FunnelInput({ label, value, onChange, prefix }) {
  return (
    <div className="fn-input-group">
      <label className="fn-input-label">{label}</label>
      <div className="fn-input-box">
        {prefix && <span className="fn-input-prefix">{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          className="fn-input"
          value={value}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.]/g, "");
            onChange(raw);
          }}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   FOUNDER SNAPSHOT
   ══════════════════════════════════════════ */
function FounderSnapshot() {
  const [spend, setSpend] = useState("100000");
  const [apps, setApps] = useState("1000");
  const [avgDealValue, setAvgDealValue] = useState("10000");
  const [appToCallPct, setAppToCallPct] = useState("70.00");
  const [showRatePct, setShowRatePct] = useState("50.00");
  const [closeRatePct, setCloseRatePct] = useState("10.00");

  const calc = useMemo(() => {
    const s = parseFloat(spend) || 0;
    const a = parseFloat(apps) || 0;
    const adv = parseFloat(avgDealValue) || 0;
    const atc = (parseFloat(appToCallPct) || 0) / 100;
    const sr = (parseFloat(showRatePct) || 0) / 100;
    const cr = (parseFloat(closeRatePct) || 0) / 100;

    const cpApp = a > 0 ? s / a : 0;
    const calls = a * atc;
    const cpCall = calls > 0 ? s / calls : 0;
    const liveCalls = calls * sr;
    const cpLiveCall = liveCalls > 0 ? s / liveCalls : 0;
    const closes = liveCalls * cr;
    const cpa = closes > 0 ? s / closes : 0;
    const rev = closes * adv;
    const profit = rev - s;
    const profitPct = rev > 0 ? (profit / rev) * 100 : 0;
    const appToClosePct = a > 0 ? (closes / a) * 100 : 0;
    const callToClosePct = calls > 0 ? (closes / calls) * 100 : 0;

    return { cpApp, calls, cpCall, liveCalls, cpLiveCall, closes, cpa, rev, profit, profitPct, appToClosePct, callToClosePct };
  }, [spend, apps, avgDealValue, appToCallPct, showRatePct, closeRatePct]);

  return (
    <div className="founder-snapshot forecast-view-enter">
      {/* ── LEFT: Conversion Rates Sidebar ── */}
      <aside className="fn-sidebar">
        <div className="fn-sidebar-inner">
          <h3 className="fn-sidebar-title">
            <Icon name="bar-chart" size={16} style={{ filter: "sepia(1) saturate(5) hue-rotate(90deg) brightness(0.6)" }} />
            Conversion Rates
          </h3>
          <p className="fn-sidebar-subtitle">שיעורי המרה</p>

          <SidebarRateField
            icon="bell"
            label="App → Call %"
            value={appToCallPct}
            onChange={setAppToCallPct}
            helper="אחוז בקשות שהופכות לשיחות"
          />
          <SidebarRateField
            icon="check-circle"
            label="Show Rate %"
            value={showRatePct}
            onChange={setShowRatePct}
            helper="אחוז שיחות שמתקיימות"
          />
          <SidebarRateField
            icon="zap"
            label="Close Rate %"
            value={closeRatePct}
            onChange={setCloseRatePct}
            helper="אחוז שיחות שנסגרות"
          />
          <SidebarRateField
            icon="trending-up"
            label="App → Close %"
            value={fmtPct(calc.appToClosePct)}
            helper="מחושב אוטומטית"
            computed
          />
          <SidebarRateField
            icon="trending-down"
            label="Call → Close %"
            value={fmtPct(calc.callToClosePct)}
            helper="מחושב אוטומטית"
            computed
          />
        </div>
      </aside>

      {/* ── RIGHT: Vertical Funnel ── */}
      <div className="fn-funnel">
        {/* INPUTS */}
        <div className="fn-section fn-section-inputs">
          <div className="fn-section-header">
            <Icon name="filter" size={16} style={{ filter: "sepia(1) saturate(3) hue-rotate(180deg) brightness(0.7)" }} />
            <span>INPUTS</span>
            <span className="fn-section-sub">נתוני קלט</span>
          </div>
          <div className="fn-inputs-grid">
            <FunnelInput label="Spend (תקציב)" value={spend} onChange={setSpend} prefix="$" />
            <FunnelInput label="Apps (בקשות)" value={apps} onChange={setApps} />
            <FunnelInput label="Avg Deal Value (ערך עסקה)" value={avgDealValue} onChange={setAvgDealValue} prefix="$" />
          </div>
        </div>

        <FunnelArrow />

        {/* STEP 1: Initial Metrics */}
        <div className="fn-section fn-section-calc">
          <div className="fn-section-header">
            <Icon name="trending-up" size={16} style={{ filter: "sepia(1) saturate(5) hue-rotate(90deg) brightness(0.6)" }} />
            <span>STEP 1: Initial Metrics</span>
            <span className="fn-section-sub">מדדי פתיחה</span>
          </div>
          <div className="fn-metrics-grid">
            <FunnelMetric label="CPApp" sublabel="עלות לבקשה" value={fmt(calc.cpApp)} formula={`Spend ÷ Apps = ${fmt(parseFloat(spend)||0)} ÷ ${fmtNum(parseFloat(apps)||0)}`} />
            <FunnelMetric label="Calls" sublabel="שיחות שנקבעו" value={fmtNum(calc.calls)} formula={`Apps × App→Call% = ${fmtNum(parseFloat(apps)||0)} × ${appToCallPct}%`} />
          </div>
        </div>

        <FunnelArrow />

        {/* STEP 2: Call Metrics */}
        <div className="fn-section fn-section-calc">
          <div className="fn-section-header">
            <Icon name="bell" size={16} style={{ filter: "sepia(1) saturate(3) hue-rotate(180deg) brightness(0.7)" }} />
            <span>STEP 2: Call Metrics</span>
            <span className="fn-section-sub">מדדי שיחות</span>
          </div>
          <div className="fn-metrics-grid fn-metrics-grid-3">
            <FunnelMetric label="CPCall" sublabel="עלות לשיחה" value={fmt(calc.cpCall)} formula={`Spend ÷ Calls = ${fmt(parseFloat(spend)||0)} ÷ ${fmtNum(calc.calls)}`} />
            <FunnelMetric label="Live Calls" sublabel="שיחות חיות" value={fmtNum(calc.liveCalls)} formula={`Calls × ShowRate = ${fmtNum(calc.calls)} × ${showRatePct}%`} />
            <FunnelMetric label="Show Rate" sublabel="אחוז התייצבות" value={fmtPct(parseFloat(showRatePct) || 0)} formula="מוגדר בסרגל הצד" />
          </div>
          <div className="fn-metrics-grid" style={{ marginTop: 12 }}>
            <FunnelMetric label="CPLive Call" sublabel="עלות לשיחה חיה" value={fmt(calc.cpLiveCall)} formula={`Spend ÷ LiveCalls = ${fmt(parseFloat(spend)||0)} ÷ ${fmtNum(calc.liveCalls)}`} />
          </div>
        </div>

        <FunnelArrow />

        {/* STEP 3: Closing Metrics */}
        <div className="fn-section fn-section-calc">
          <div className="fn-section-header">
            <Icon name="zap" size={16} style={{ filter: "sepia(1) saturate(5) hue-rotate(90deg) brightness(0.6)" }} />
            <span>STEP 3: Closing Metrics</span>
            <span className="fn-section-sub">מדדי סגירה</span>
          </div>
          <div className="fn-metrics-grid fn-metrics-grid-3">
            <FunnelMetric label="Closes" sublabel="סגירות" value={fmtNum(calc.closes)} formula={`LiveCalls × CloseRate = ${fmtNum(calc.liveCalls)} × ${closeRatePct}%`} />
            <FunnelMetric label="Close Rate" sublabel="אחוז סגירה" value={fmtPct(parseFloat(closeRatePct) || 0)} formula="מוגדר בסרגל הצד" />
            <FunnelMetric label="CPA" sublabel="עלות לרכישה" value={fmt(calc.cpa)} formula={`Spend ÷ Closes = ${fmt(parseFloat(spend)||0)} ÷ ${fmtNum(calc.closes)}`} />
          </div>
        </div>

        <FunnelArrow />

        {/* FINAL RESULTS */}
        <div className="fn-section fn-section-results">
          <div className="fn-section-header fn-results-header">
            <Icon name="dollar" size={18} style={{ filter: "brightness(0)" }} />
            <span>FINAL RESULTS</span>
            <span className="fn-section-sub">תוצאות סופיות</span>
          </div>
          <div className="fn-results-grid">
            <div className="fn-result-card">
              <div className="fn-result-icon">
                <Icon name="dollar" size={20} style={{ filter: "sepia(1) saturate(5) hue-rotate(90deg) brightness(0.6)" }} />
              </div>
              <div className="fn-result-label">Rev (הכנסות)</div>
              <div className="fn-result-value">{fmt(calc.rev)}</div>
            </div>
            <div className={`fn-result-card ${calc.profit < 0 ? "fn-result-negative" : ""}`}>
              <div className="fn-result-icon">
                <Icon name="trending-up" size={20} style={{ filter: calc.profit >= 0 ? "sepia(1) saturate(5) hue-rotate(90deg) brightness(0.6)" : "sepia(1) saturate(5) hue-rotate(0deg) brightness(0.7)" }} />
              </div>
              <div className="fn-result-label">Profit (רווח)</div>
              <div className="fn-result-value">{fmt(calc.profit)}</div>
            </div>
            <div className={`fn-result-card ${calc.profitPct < 0 ? "fn-result-negative" : ""}`}>
              <div className="fn-result-icon">
                <Icon name="bar-chart" size={20} style={{ filter: calc.profitPct >= 0 ? "sepia(1) saturate(5) hue-rotate(90deg) brightness(0.6)" : "sepia(1) saturate(5) hue-rotate(0deg) brightness(0.7)" }} />
              </div>
              <div className="fn-result-label">Profit % (שולי רווח)</div>
              <div className="fn-result-value">{fmtPct(calc.profitPct)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PROJECTIONS BUILDER
   ══════════════════════════════════════════ */
function ProjectionsBuilder() {
  const d = forecastDefaults;
  return (
    <div className="projections-tab forecast-view-enter">
      <div className="grid grid-2 section">
        <div className="card padded">
          <div className="section-title">אחוזי המרה</div>
          <InputRow label="Show Rate" value={`${d.showRate}%`} info="אחוז שמגיעים לשיחה" />
          <InputRow label="Offer Rate" value={`${d.offerRate}%`} info="אחוז שמקבלים הצעה" />
          <InputRow label="Close Rate" value={`${d.closeRate}%`} info="אחוז סגירה" />
          <InputRow label="% MQL → QCall" value={`${d.mqlToQcall}%`} info="המרה מליד לשיחה" />
        </div>
        <div className="card padded">
          <div className="section-title">הגדרות יעד</div>
          <InputRow label="יעד הכנסות" value={d.revenueTarget.toLocaleString()} prefix="$" info="יעד הכנסות חודשי" />
          <InputRow label="יעד MER" value={d.mer.toString()} info="Marketing Efficiency Ratio" />
          <InputRow label="AOV (ערך עסקה ממוצע)" value={d.aov.toLocaleString()} prefix="$" info="Average Order Value" />
        </div>
      </div>

      <div className="grid grid-2 section">
        <div className="card padded">
          <div className="section-title">תקציב ועלויות</div>
          <InputRow label="תקציב מקסימלי" value={`$${d.maxBudget.toLocaleString()}`} info="תקציב שיווק מקסימלי" />
          <InputRow label="CPA מקסימלי" value={`$${d.maxCPA.toLocaleString()}`} info="עלות רכישת לקוח" />
          <InputRow label="עלות ליד מקסימלית" value={`$${d.maxCostPerLead}`} info="עלות ליד" />
          <InputRow label="עלות שיחה מקסימלית" value={`$${d.maxCostPerCall}`} info="עלות שיחה" />
        </div>
        <div className="card padded">
          <div className="section-title">משאבים נדרשים</div>
          <InputRow label="עסקאות נדרשות" value={d.requiredDeals.toString()} info="מספר עסקאות נדרשות" />
          <InputRow label="לידים נדרשים (MQLs)" value={d.requiredMQLs.toString()} info="מספר לידים נדרשים" />
          <InputRow label="שיחות איכותיות נדרשות" value={d.qualifiedCalls.toString()} info="שיחות שמסתיימות בהצעה" />
          <InputRow label="שיחות חיות נדרשות" value={d.liveCalls.toString()} info="שיחות טלפון נדרשות" />
        </div>
      </div>

      <div className="card forecast-summary section">
        <div className="section-title">סיכום התחזית</div>
        <div className="grid grid-3">
          <SummaryTile label="יעד הכנסות" value="$200,000" highlight />
          <SummaryTile label="עסקאות נדרשות" value="25" />
          <SummaryTile label="לידים נדרשים" value="441" />
        </div>
        <div className="grid grid-3" style={{ marginTop: 12 }}>
          <SummaryTile label="תקציב מקסימלי" value="$57,142.86" />
          <SummaryTile label="MER צפוי" value="3.5" highlight />
          <SummaryTile label="CPA מקסימלי" value="$2,285.71" />
        </div>
        <div className="conversion-metrics">
          <div className="conversion-metric">
            <div className="metric-value">11.3%</div>
            <div className="metric-label">Qualified Calls → Close</div>
          </div>
          <div className="conversion-metric">
            <div className="metric-value">5.7%</div>
            <div className="metric-label">MQLs → Close</div>
          </div>
          <div className="conversion-metric">
            <div className="metric-value">50.0%</div>
            <div className="metric-label">MQLs → Qualified Calls</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════ */
export default function ForecastPlanner() {
  const [mode, setMode] = useState("snapshot");

  return (
    <div className="page-enter">
      <PageHeader
        title="תכנון תחזית"
        subtitle="מחשבון אינטראקטיבי לתכנון יעדי מכירות ומשאבים נדרשים"
        actions={
          <>
            <button className="button">
              <Icon name="close" size={14} style={{ filter: "brightness(0.3)" }} /> אתחל
            </button>
            <button className="button primary">
              <Icon name="file-download" size={14} style={{ filter: "brightness(0)" }} /> ייצא PDF
            </button>
          </>
        }
      />

      <div className="forecast-toggle-wrap">
        <div className="forecast-toggle">
          <div
            className="forecast-toggle-slider"
            style={{ transform: mode === "snapshot" ? "translateX(100%)" : "translateX(0)" }}
          />
          <button
            type="button"
            className={`forecast-toggle-btn ${mode === "projections" ? "active" : ""}`}
            onClick={() => setMode("projections")}
          >
            Projections Builder
          </button>
          <button
            type="button"
            className={`forecast-toggle-btn ${mode === "snapshot" ? "active" : ""}`}
            onClick={() => setMode("snapshot")}
          >
            Founder Snapshot
          </button>
        </div>
      </div>

      <div className="forecast-view-content" key={mode}>
        {mode === "snapshot" ? <FounderSnapshot /> : <ProjectionsBuilder />}
      </div>

      <div className="footer">
        Powered by &nbsp; מוקד בסקייל &nbsp; | &nbsp; RevOps Intelligence
      </div>
    </div>
  );
}
