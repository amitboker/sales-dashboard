import { useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import PageHeader from "../components/PageHeader.jsx";
import AlertCard from "../components/AlertCard.jsx";
import Icon from "../components/Icon.jsx";
import FunnelStagesEditor from "../components/FunnelStagesEditor.jsx";
import useFunnelStages from "../hooks/useFunnelStages.js";
import {
  alerts, overallConversion, criticalLeaks,
  leakageAnalysis, avgTimePerStage,
} from "../data/mockData.js";
import { generatePDF } from "../utils/pdfExport.js";

function FunnelStageRow({ stage, maxValue }) {
  const barWidth = (stage.value / maxValue) * 100;
  return (
    <div className="funnel-stage">
      <div className="funnel-stage-header">
        <div className="funnel-stage-left">
          <span className="funnel-percent">{stage.percent}</span>
          <span className="funnel-value">{stage.value}</span>
        </div>
        <div className="funnel-label-row">
          <span className="funnel-stage-name">{stage.label}</span>
          <div className={`funnel-stage-icon ${stage.iconType}`}>
            {stage.iconType === "people" && <Icon name="users" size={14} />}
            {stage.iconType === "warning" && <Icon name="alert-triangle" size={14} />}
            {stage.iconType === "error" && <Icon name="alert-triangle" size={14} />}
            {stage.iconType === "check" && <Icon name="check-circle" size={14} />}
          </div>
        </div>
      </div>
      <div className="funnel-bar-wrap">
        <div
          className={`funnel-bar ${stage.critical ? "lighter" : ""}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      {stage.conversionRate && (
        <>
          <div className={`funnel-conversion ${stage.critical ? "critical" : ""}`}>
            {stage.critical && <span style={{ color: "#c44" }}>{"\u25CF"}</span>}
            <span className="rate">{stage.conversionRate} המרה</span>
            <span>{"\u2193"}</span>
          </div>
          {stage.dropped !== null && stage.dropped > 0 && (
            <div className={`funnel-dropped ${stage.critical ? "critical" : ""}`}>
              ({stage.droppedPercent}) {stage.dropped} נשרו
            </div>
          )}
          {stage.dropped === 0 && stage.droppedPercent && (
            <div className="funnel-dropped">
              ({stage.droppedPercent}) 0 נשרו
            </div>
          )}
        </>
      )}
      {stage.insight && (
        <div style={{ textAlign: "center" }}>
          <span className="funnel-insight">
            <Icon name="alert-circle" size={12} style={{ filter: "sepia(1) saturate(3) hue-rotate(180deg) brightness(0.7)" }} /> {stage.insight}
          </span>
        </div>
      )}
    </div>
  );
}

export default function SalesFunnel() {
  const { stages, setStages, activeStages } = useFunnelStages();
  const maxVal = Math.max(1, ...activeStages.map((s) => s.value));
  const barChartRef = useRef(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const handleExportPDF = async () => {
    try {
      await generatePDF({
        pageTitle: "דוח ביצועים - משפך מכירות",
        reportType: "משפך-מכירות",
        metrics: [
          { label: "שיעור המרה כולל", value: overallConversion.rate },
          { label: "יעד", value: overallConversion.target },
          { label: "עסקאות", value: overallConversion.deals },
        ],
        chartRefs: [
          { title: "זמן ממוצע בכל שלב (ימים)", ref: barChartRef },
        ],
        tables: [
          {
            title: "שלבי המשפך",
            columns: ["שלב", "כמות", "אחוז", "שיעור המרה"],
            rows: activeStages.map(s => [s.label, String(s.value), s.percent, s.conversionRate || "-"]),
            columnStyles: { 1: { halign: "center" }, 2: { halign: "center" }, 3: { halign: "center" } },
          },
          {
            title: "ניתוח דליפות",
            columns: ["שלב במשפך", "אובדן", "שיעור נשירה", "סיבה עיקרית", "פעולה מומלצת", "עדיפות"],
            rows: leakageAnalysis.map(r => [r.stage, `${r.lost} ${r.lostLabel}`, r.rate, r.reason, r.action, r.priority]),
            columnStyles: { 1: { halign: "center" }, 2: { halign: "center" } },
          },
        ],
      });
    } catch (e) {
      console.error("PDF export failed:", e);
      alert("שגיאה בייצוא PDF: " + e.message);
    }
  };

  return (
    <div className="sales-funnel-page">
      <PageHeader
        title="משפך מכירות"
        subtitle="ניתוח שלבי המשפך וזיהוי דליפות"
        actions={
          <button className="button" onClick={() => setEditorOpen(true)}>
            <Icon name="settings" size={14} style={{ filter: "brightness(0.3)" }} /> עריכת משפך
          </button>
        }
        filters={
          <>
            <button className="button">
              <Icon name="file-download" size={14} style={{ filter: "brightness(0)" }} /> הורד דאטה
            </button>
            <button className="button primary" onClick={handleExportPDF}>
              <Icon name="spreadsheet" size={14} style={{ filter: "brightness(0)" }} /> ייצוא דוח PDF
            </button>
          </>
        }
      />

      <div className="grid grid-2 section" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <div className="card padded">
          <div className="section-title">משפך מכירות</div>
          <div className="funnel-badge">{activeStages.length} שלבים</div>
          <div className="funnel-container">
            {activeStages.map((stage) => (
              <FunnelStageRow key={stage.id} stage={stage} maxValue={maxVal} />
            ))}
          </div>

          <div className="card overall-conversion" style={{ marginTop: 20 }}>
            <div className="overall-header">
              <div>
                <span className="overall-target">יעד {overallConversion.target} / </span>
                <span className="overall-rate">{overallConversion.rate}</span>
              </div>
              <div style={{ fontWeight: 700 }}>שיעור המרה כולל</div>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${overallConversion.progressPercent}%` }}
              />
            </div>
            <div className="overall-footer">
              <div className="below-target">
                {"\u2198"} {"\u25CF"} מתחת ליעד ב-{overallConversion.belowTarget}
              </div>
              <div className="muted">{overallConversion.deals} עסקאות</div>
            </div>
          </div>

          <div className="critical-leaks">
            <div className="critical-leaks-header">
              <Icon name="alert-triangle" size={16} style={{ filter: "sepia(1) saturate(5) hue-rotate(30deg) brightness(0.7)" }} />
              <span>2 דליפות קריטיות זוהו!</span>
              <Icon name="alert-circle" size={14} style={{ filter: "sepia(1) saturate(3) hue-rotate(180deg) brightness(0.7)" }} />
            </div>
            {criticalLeaks.map((leak) => (
              <div key={leak.id} className="leak-item">
                <div className="leak-desc">
                  <span style={{
                    background: "#c44", color: "#fff", borderRadius: "50%",
                    width: 20, height: 20, display: "inline-flex",
                    alignItems: "center", justifyContent: "center", fontSize: 11, marginLeft: 6,
                  }}>{leak.id}</span>
                  {leak.description}
                </div>
                <div className="leak-solution">{"\u2192"} פתרון: {leak.solution}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card padded">
          <div className="alerts-header">
            <Icon name="bell" size={16} style={{ filter: "sepia(1) saturate(3) hue-rotate(30deg) brightness(0.7)" }} />
            <h3>התראות</h3>
          </div>
          <div className="alerts-section">
            {alerts.map((alert) => (
              <AlertCard key={alert.title} {...alert} />
            ))}
          </div>
        </div>
      </div>

      <FunnelStagesEditor
        open={editorOpen}
        stages={stages}
        onClose={() => setEditorOpen(false)}
        onSave={(nextStages) => {
          setStages(nextStages);
          setEditorOpen(false);
        }}
      />

      <div className="grid grid-2 section">
        <div className="card padded" ref={barChartRef}>
          <div className="section-title">זמן ממוצע בכל שלב (ימים)</div>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={avgTimePerStage} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ece5" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="actual" fill="#DAFD68" radius={[4, 4, 0, 0]} name="בפועל" />
              <Bar dataKey="target" fill="#c8ec55" radius={[4, 4, 0, 0]} name="יעד" />
            </BarChart>
          </ResponsiveContainer>
          <div className="bar-legend">
            <div className="bar-legend-item">
              <div className="bar-legend-color" style={{ background: "#DAFD68" }} />
              <span>בפועל</span>
            </div>
            <div className="bar-legend-item">
              <div className="bar-legend-color" style={{ background: "#c8ec55" }} />
              <span>יעד</span>
            </div>
          </div>
        </div>

        <div className="card padded">
          <div className="section-title">ניתוח דליפות</div>
          <table className="leakage-table">
            <thead>
              <tr>
                <th>שלב במשפך</th>
                <th>אובדן</th>
                <th>שיעור נשירה</th>
                <th>סיבה עיקרית</th>
                <th>פעולה מומלצת</th>
                <th>עדיפות</th>
              </tr>
            </thead>
            <tbody>
              {leakageAnalysis.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{row.stage}</td>
                  <td>{row.lost} {row.lostLabel}</td>
                  <td>{row.rate}</td>
                  <td style={{ fontSize: 12 }}>{row.reason}</td>
                  <td>
                    <span className="action-pill">{row.action}</span>
                  </td>
                  <td>
                    <span className={`priority-badge ${row.priorityColor}`}>
                      <span className={`priority-dot ${row.priorityColor}`} />
                      {row.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="footer">
        Powered by &nbsp; מוקד בסקייל &nbsp; | &nbsp; RevOps Intelligence
      </div>
    </div>
  );
}
