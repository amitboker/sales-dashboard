import { useState, useMemo, useEffect, useRef } from "react";
import PageHeader from "../components/PageHeader.jsx";
import InputRow from "../components/InputRow.jsx";
import SummaryTile from "../components/SummaryTile.jsx";
import Icon from "../components/Icon.jsx";

function fmt(n) {
  if (n == null || isNaN(n)) return "₪0";
  return "₪" + Math.round(n).toLocaleString();
}

function fmtPct(n) {
  if (n == null || isNaN(n)) return "0.00%";
  return n.toFixed(2) + "%";
}

function fmtNum(n) {
  if (n == null || isNaN(n)) return "0";
  return Math.round(n).toLocaleString();
}

function stripCommas(value) {
  return value.replace(/,/g, "");
}

function formatNumberInput(value) {
  const raw = value.replace(/,/g, "");
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const formattedInt = Number(intPart || "0").toLocaleString();
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
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
    <div className="fn-metric">
      <div className="fn-metric-label">{label}</div>
      <div className="fn-metric-sub">{sublabel}</div>
      <div className="fn-metric-value">{value}</div>
      {formula && <div className="fn-metric-tooltip">{formula}</div>}
    </div>
  );
}

/* ── Arrow separator ── */
function FunnelArrow({ fromStep, toStep, conversionLabel, isActive = true }) {
  const showLabel = Boolean(conversionLabel);
  const labelText = isActive ? conversionLabel : "ממתין לקלט";
  return (
    <div
      className={`fn-arrow ${isActive ? "active" : "inactive"}`}
      aria-label={fromStep && toStep ? `${fromStep} → ${toStep}` : "חיבור שלב"}
    >
      {showLabel && <div className="fn-arrow-label">{labelText}</div>}
      <div className="fn-arrow-line" />
      <div className="fn-arrow-head" />
    </div>
  );
}

function ScenarioSelector({ value, onSelect }) {
  const options = [
    { key: "pessimistic", label: "פסימי" },
    { key: "realistic", label: "ריאלי" },
    { key: "optimistic", label: "אופטימי" },
  ];
  const containerStyle = {
    marginLeft: "auto",
    display: "inline-flex",
    gap: 4,
    padding: 4,
    borderRadius: 999,
    border: "1px solid #e5e5e5",
    background: "#fff",
    direction: "rtl",
  };
  const buttonStyle = {
    border: 0,
    background: "transparent",
    color: "#828282",
    padding: "4px 10px",
    fontSize: 12,
    fontFamily: "inherit",
    borderRadius: 999,
    cursor: "pointer",
    transition: "background 0.15s ease, color 0.15s ease",
  };
  const activeStyle = {
    background: "#DAFD68",
    color: "#000",
  };

  return (
    <span style={containerStyle} role="tablist" aria-label="בחירת תרחיש">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          style={value === option.key ? { ...buttonStyle, ...activeStyle } : buttonStyle}
          onClick={() => onSelect(option.key)}
          aria-pressed={value === option.key}
        >
          {option.label}
        </button>
      ))}
    </span>
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
            onChange(formatNumberInput(raw));
          }}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   FOUNDER SNAPSHOT
   ══════════════════════════════════════════ */
export function ProjectionBuilderView({ resetToken }) {
  const initialSpend = formatNumberInput("100000");
  const initialApps = formatNumberInput("1000");
  const initialAvgDeal = formatNumberInput("10000");
  const initialAppToCall = "40.00";
  const initialShowRate = "45.00";
  const initialCloseRate = "8.00";

  const [scenario, setScenario] = useState("realistic");
  const [spend, setSpend] = useState(initialSpend);
  const [apps, setApps] = useState(initialApps);
  const [avgDealValue, setAvgDealValue] = useState(initialAvgDeal);
  const [appToCallPct, setAppToCallPct] = useState(initialAppToCall);
  const [showRatePct, setShowRatePct] = useState(initialShowRate);
  const [closeRatePct, setCloseRatePct] = useState(initialCloseRate);
  const [resultsByScenario, setResultsByScenario] = useState({});
  const [viewScenario, setViewScenario] = useState("realistic");
  const [lastComputedScenario, setLastComputedScenario] = useState(null);
  const [highlightResults, setHighlightResults] = useState(false);
  const [lastCalculatedInputs, setLastCalculatedInputs] = useState({
    spend: initialSpend,
    apps: initialApps,
    avgDealValue: initialAvgDeal,
    appToCallPct: initialAppToCall,
    showRatePct: initialShowRate,
    closeRatePct: initialCloseRate,
  });
  const finalResultsRef = useRef(null);
  const didInitRef = useRef(false);
  const resetPendingRef = useRef(false);

  const calc = useMemo(() => {
    const s = parseFloat(stripCommas(spend)) || 0;
    const a = parseFloat(stripCommas(apps)) || 0;
    const adv = parseFloat(stripCommas(avgDealValue)) || 0;
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

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    setResultsByScenario({ [scenario]: calc });
    setViewScenario(scenario);
    setLastComputedScenario(scenario);
  }, [calc, scenario]);

  useEffect(() => {
    if (!resetToken) return;
    setScenario("realistic");
    setSpend(initialSpend);
    setApps(initialApps);
    setAvgDealValue(initialAvgDeal);
    setAppToCallPct(initialAppToCall);
    setShowRatePct(initialShowRate);
    setCloseRatePct(initialCloseRate);
    setLastCalculatedInputs({
      spend: initialSpend,
      apps: initialApps,
      avgDealValue: initialAvgDeal,
      appToCallPct: initialAppToCall,
      showRatePct: initialShowRate,
      closeRatePct: initialCloseRate,
    });
    setViewScenario("realistic");
    setResultsByScenario({});
    setLastComputedScenario(null);
    resetPendingRef.current = true;
  }, [resetToken, initialSpend, initialApps, initialAvgDeal, initialAppToCall, initialShowRate, initialCloseRate]);

  useEffect(() => {
    if (!resetPendingRef.current) return;
    setResultsByScenario({ realistic: calc });
    setLastComputedScenario("realistic");
    resetPendingRef.current = false;
  }, [calc]);

  const pendingChanges = [
    spend !== lastCalculatedInputs.spend,
    apps !== lastCalculatedInputs.apps,
    avgDealValue !== lastCalculatedInputs.avgDealValue,
    appToCallPct !== lastCalculatedInputs.appToCallPct,
    showRatePct !== lastCalculatedInputs.showRatePct,
    closeRatePct !== lastCalculatedInputs.closeRatePct,
  ].some(Boolean);

  const activeScenarioForDisplay = resultsByScenario[viewScenario]
    ? viewScenario
    : lastComputedScenario || scenario;
  const results = resultsByScenario[activeScenarioForDisplay] || calc;
  const isComputed = (key) => Boolean(resultsByScenario[key]);

  const handleCalculate = () => {
    setResultsByScenario((prev) => ({
      ...prev,
      [scenario]: calc,
    }));
    setLastCalculatedInputs({
      spend,
      apps,
      avgDealValue,
      appToCallPct,
      showRatePct,
      closeRatePct,
    });
    setViewScenario(scenario);
    setLastComputedScenario(scenario);
    if (finalResultsRef.current) {
      finalResultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlightResults(true);
      setTimeout(() => setHighlightResults(false), 900);
    }
  };

  return (
    <div className="founder-snapshot forecast-view-enter">
      {/* ── LEFT: Conversion Rates Sidebar ── */}
      <aside className="fn-sidebar">
        <div style={{ marginBottom: 12, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 6 }}>
            תרחיש
          </div>
          <ScenarioSelector value={scenario} onSelect={setScenario} />
        </div>
        <div className="fn-sidebar-inner">
          <h3 className="fn-sidebar-title">
            <Icon name="bar-chart" size={16} style={{ filter: "sepia(1) saturate(5) hue-rotate(90deg) brightness(0.6)" }} />
            Conversion Rates
          </h3>
          <p className="fn-sidebar-subtitle">שיעורי המרה</p>
          {pendingChanges && (
            <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 10 }}>
              שינויים טרם חושבו
            </div>
          )}

          <SidebarRateField
            icon="bell"
            label="ליד → שיחה %"
            value={appToCallPct}
            onChange={setAppToCallPct}
            helper="אחוז לידים שהופכים לשיחות"
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
            label="ליד → סגירה %"
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
          <button
            type="button"
            className="button primary"
            onClick={handleCalculate}
            style={{ width: "100%", marginTop: 12, justifyContent: "center" }}
          >
            חשב תוצאות לתרחיש
          </button>
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
            <FunnelInput label="Spend (תקציב)" value={spend} onChange={setSpend} prefix="₪" />
            <FunnelInput label="Apps (לידים)" value={apps} onChange={setApps} />
            <FunnelInput label="Avg Deal Value (ערך עסקה)" value={avgDealValue} onChange={setAvgDealValue} prefix="₪" />
          </div>
        </div>

        {/* STEP 1: Initial Metrics */}
        <div className="fn-section fn-section-calc">
          <div className="fn-section-header">
            <Icon name="trending-up" size={16} style={{ filter: "sepia(1) saturate(5) hue-rotate(90deg) brightness(0.6)" }} />
            <span>STEP 1: Initial Metrics</span>
            <span className="fn-section-sub">מדדי פתיחה</span>
          </div>
          <div className="fn-metrics-grid">
            <FunnelMetric label="עלות לליד" sublabel="עלות לליד" value={fmt(calc.cpApp)} formula={`תקציב ÷ לידים = ${fmt(parseFloat(stripCommas(spend))||0)} ÷ ${fmtNum(parseFloat(stripCommas(apps))||0)}`} />
            <FunnelMetric label="Calls" sublabel="שיחות שנקבעו" value={fmtNum(calc.calls)} formula={`לידים × ליד→שיחה% = ${fmtNum(parseFloat(stripCommas(apps))||0)} × ${appToCallPct}%`} />
          </div>
        </div>

        <FunnelArrow
          fromStep="STEP 1"
          toStep="STEP 2"
          conversionLabel={`Show Rate: ${fmtPct(parseFloat(showRatePct) || 0)}`}
          isActive={(parseFloat(showRatePct) || 0) > 0 && calc.calls > 0}
        />

        {/* STEP 2: Call Metrics */}
        <div className="fn-section fn-section-calc">
          <div className="fn-section-header">
            <Icon name="bell" size={16} style={{ filter: "sepia(1) saturate(3) hue-rotate(180deg) brightness(0.7)" }} />
            <span>STEP 2: Call Metrics</span>
            <span className="fn-section-sub">מדדי שיחות</span>
          </div>
          <div className="fn-metrics-grid fn-metrics-grid-3">
            <FunnelMetric label="CPCall" sublabel="עלות לשיחה" value={fmt(calc.cpCall)} formula={`Spend ÷ Calls = ${fmt(parseFloat(stripCommas(spend))||0)} ÷ ${fmtNum(calc.calls)}`} />
            <FunnelMetric label="Live Calls" sublabel="שיחות חיות" value={fmtNum(calc.liveCalls)} formula={`Calls × ShowRate = ${fmtNum(calc.calls)} × ${showRatePct}%`} />
            <FunnelMetric label="Show Rate" sublabel="אחוז התייצבות" value={fmtPct(parseFloat(showRatePct) || 0)} formula="מוגדר בסרגל הצד" />
          </div>
          <div className="fn-metrics-grid" style={{ marginTop: 12, gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div style={{ gridColumn: "2 / 3", justifySelf: "center", transform: "translateX(-14px)" }}>
              <FunnelMetric label="CPLive Call" sublabel="עלות לשיחה חיה" value={fmt(calc.cpLiveCall)} formula={`Spend ÷ LiveCalls = ${fmt(parseFloat(stripCommas(spend))||0)} ÷ ${fmtNum(calc.liveCalls)}`} />
            </div>
          </div>
        </div>

        <FunnelArrow
          fromStep="STEP 2"
          toStep="STEP 3"
          conversionLabel={`Close Rate: ${fmtPct(parseFloat(closeRatePct) || 0)}`}
          isActive={(parseFloat(closeRatePct) || 0) > 0 && calc.liveCalls > 0}
        />

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
            <FunnelMetric label="CPA" sublabel="עלות לרכישה" value={fmt(calc.cpa)} formula={`Spend ÷ Closes = ${fmt(parseFloat(stripCommas(spend))||0)} ÷ ${fmtNum(calc.closes)}`} />
          </div>
        </div>

        <FunnelArrow />

        {/* FINAL RESULTS */}
        <div
          className="fn-section fn-section-results"
          ref={finalResultsRef}
          style={{
            boxShadow: highlightResults ? "0 0 0 3px rgba(218, 253, 104, 0.6)" : undefined,
            transition: "box-shadow 0.4s ease",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 16,
              display: "inline-flex",
              gap: 4,
              padding: 4,
              borderRadius: 999,
              border: "1px solid rgba(0, 0, 0, 0.1)",
              background: "rgba(255,255,255,0.85)",
              direction: "rtl",
            }}
            role="tablist"
            aria-label="בחירת תרחיש להצגה"
          >
            {[
              { key: "pessimistic", label: "פסימי" },
              { key: "realistic", label: "ריאלי" },
              { key: "optimistic", label: "אופטימי" },
            ].map((option) => {
              const disabled = !isComputed(option.key);
              const isActive = viewScenario === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && setViewScenario(option.key)}
                  aria-pressed={isActive}
                  style={{
                    border: 0,
                    background: isActive ? "#DAFD68" : "transparent",
                    color: disabled ? "rgba(0,0,0,0.35)" : isActive ? "#000" : "rgba(0,0,0,0.7)",
                    padding: "3px 10px",
                    fontSize: 11,
                    fontFamily: "inherit",
                    borderRadius: 999,
                    cursor: disabled ? "not-allowed" : "pointer",
                    transition: "background 0.15s ease, color 0.15s ease",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
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
              <div className="fn-result-value">{fmt(results.rev)}</div>
            </div>
            <div className={`fn-result-card ${results.profit < 0 ? "fn-result-negative" : ""}`}>
              <div className="fn-result-icon">
                <Icon name="trending-up" size={20} style={{ filter: results.profit >= 0 ? "sepia(1) saturate(5) hue-rotate(90deg) brightness(0.6)" : "sepia(1) saturate(5) hue-rotate(0deg) brightness(0.7)" }} />
              </div>
              <div className="fn-result-label">Profit (רווח)</div>
              <div className="fn-result-value">{fmt(results.profit)}</div>
            </div>
            <div className={`fn-result-card ${results.profitPct < 0 ? "fn-result-negative" : ""}`}>
              <div className="fn-result-icon">
                <Icon name="bar-chart" size={20} style={{ filter: results.profitPct >= 0 ? "sepia(1) saturate(5) hue-rotate(90deg) brightness(0.6)" : "sepia(1) saturate(5) hue-rotate(0deg) brightness(0.7)" }} />
              </div>
              <div className="fn-result-label">Profit % (שולי רווח)</div>
              <div className="fn-result-value">{fmtPct(results.profitPct)}</div>
            </div>
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
  const [resetToken, setResetToken] = useState(0);

  return (
    <div className="page-enter">
      <PageHeader
        title="Founder Snapshot"
        subtitle="סקירה ניהולית על ביצועים, תחזית ותובנות מרכזיות"
        actions={
          <>
            <button className="button" onClick={() => setResetToken((t) => t + 1)}>
              אתחל נתונים
            </button>
            <button className="button primary">
              <Icon name="file-download" size={14} style={{ filter: "brightness(0)" }} /> ייצא PDF
            </button>
          </>
        }
      />
      <div className="forecast-view-content">
        <ProjectionBuilderView resetToken={resetToken} />
      </div>

      <div className="footer">
        Powered by &nbsp; מוקד בסקייל &nbsp; | &nbsp; RevOps Intelligence
      </div>
    </div>
  );
}
