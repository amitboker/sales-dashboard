import { useState, useRef, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import AlertCard from "../components/AlertCard.jsx";
import Icon from "../components/Icon.jsx";
import { alerts, kpiCards, monthlyRevenue, revenueByService } from "../data/mockData.js";
import { generatePDF } from "../utils/pdfExport.js";

const breakdownData = [
  { stage: "לידים נכנסים", opportunities: 420, value: "₪ 6,132,000", percent: 40 },
  { stage: "שיחה נענתה", opportunities: 320, value: "₪ 4,672,000", percent: 30 },
  { stage: "נשלח קטלוג", opportunities: 198, value: "₪ 2,890,800", percent: 19 },
  { stage: "נשלחה הצעת מחיר", opportunities: 115, value: "₪ 1,679,250", percent: 11 },
];

export default function OverviewDashboard() {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);
  const areaChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const [timeRange, setTimeRange] = useState("month");

  const timeRangeOptions = [
    { value: "day", label: "יום" },
    { value: "week", label: "שבוע" },
    { value: "two-weeks", label: "שבועיים" },
    { value: "month", label: "חודש אחרון" },
  ];

  const handleExportPDF = async () => {
    try {
      await generatePDF({
        pageTitle: "דוח ביצועים - סקירה כללית",
        reportType: "סקירה-כללית",
        metrics: kpiCards,
        chartRefs: [
          { title: "הכנסות חודשיות", ref: areaChartRef },
          { title: "התפלגות הכנסות לפי סוג שירות", ref: pieChartRef },
        ],
        tables: [{
          title: "פירוט הזדמנויות פתוחות",
          columns: ["שלב", "הזדמנויות", "ערך כולל", "אחוז"],
          rows: breakdownData.map(r => [r.stage, String(r.opportunities), r.value, `${r.percent}%`]),
          columnStyles: { 1: { halign: "center" }, 2: { halign: "center" }, 3: { halign: "center" } },
        }],
      });
    } catch (e) {
      console.error("PDF export failed:", e);
      alert("שגיאה בייצוא PDF: " + e.message);
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded]);

  return (
    <div className="page-enter overview-page">
      <PageHeader
        title={`דאשבורד מנכ\u05F4ל`}
        subtitle="מעקב אחר ביצועי מכירות והכנסות"
        filters={
          <>
            <button className="button">
              <Icon name="filter" size={14} style={{ filter: "brightness(0.3)" }} /> פילטרים
              <Icon name="chevron-down-sm" size={10} style={{ filter: "brightness(0.4)" }} />
            </button>
          </>
        }
        actions={
          <>
            <button className="button">
              <Icon name="file-download" size={14} style={{ filter: "brightness(0.3)" }} /> הורד דאטה
            </button>
            <button className="button primary" onClick={handleExportPDF}>
              <Icon name="spreadsheet" size={14} style={{ filter: "brightness(0)" }} /> ייצוא דוח PDF
            </button>
          </>
        }
      />

      <div className="grid grid-4 section stagger-children">
        {kpiCards.map((card, i) => (
          <StatCard key={card.label} {...card} delay={i * 50} />
        ))}
      </div>

      <div className="grid section" style={{ gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        <div className="card padded anim-fade-up" ref={areaChartRef} style={{ animationDelay: "0.1s" }}>
          <div className="card-header-row">
            <div className="section-title">הכנסות חודשיות</div>
            <div className="time-range-toggle" role="group" aria-label="טווח זמן">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`time-range-option ${timeRange === option.value ? "active" : ""}`}
                  onClick={() => setTimeRange(option.value)}
                  aria-pressed={timeRange === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DAFD68" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#DAFD68" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ece5" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `\u20AA${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(v) => [`\u20AA${v.toLocaleString()}`, "הכנסות"]}
                labelFormatter={(l) => l}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#DAFD68"
                strokeWidth={2}
                fill="url(#colorRevenue)"
                dot={{ r: 3, fill: "#DAFD68" }}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card padded anim-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="alerts-header">
            <Icon name="bell" size={18} style={{ filter: "sepia(1) saturate(3) hue-rotate(30deg) brightness(0.7)" }} />
            <h3>התראות</h3>
          </div>
          <div className="alerts-section">
            {alerts.map((alert, i) => (
              <div key={alert.title} className="anim-slide-in" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
                <AlertCard {...alert} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-2 section">
        <div className="card opportunities-card anim-fade-up" style={{ animationDelay: "0.15s" }}>
          <div className="trend-icon"><Icon name="trend-up-lg" size={24} style={{ filter: "brightness(0)" }} /></div>
          <h3>סך ערך ההזדמנויות פתוחות</h3>
          <div className="opportunities-value">{"\u20AA"} 15,374,050</div>
          <div className="opportunities-desc">ערך כולל של הזדמנויות פתוחות</div>

          <button
            className={`expand-btn ${expanded ? "expanded" : ""}`}
            onClick={() => setExpanded(!expanded)}
          >
            <span className="expand-arrow"><Icon name="chevron-down-sm" size={12} /></span>
            <span>{expanded ? "הסתר פירוט" : "לחץ לפירוט לפי שלבים"}</span>
          </button>

          <div
            className="expand-content"
            style={{ maxHeight: expanded ? contentHeight + 20 : 0 }}
          >
            <div ref={contentRef} className="expand-inner">
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th>שלב</th>
                    <th>הזדמנויות</th>
                    <th>ערך כולל</th>
                    <th>אחוז</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdownData.map((row, i) => (
                    <tr
                      key={row.stage}
                      className={expanded ? "row-enter" : ""}
                      style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                    >
                      <td style={{ fontWeight: 600 }}>{row.stage}</td>
                      <td>{row.opportunities}</td>
                      <td>{row.value}</td>
                      <td style={{ minWidth: 120 }}>
                        <div className="breakdown-bar-wrap">
                          <div className="breakdown-bar-bg">
                            <div
                              className={`breakdown-bar-fill ${expanded ? "animate" : ""}`}
                              style={{
                                width: expanded ? `${row.percent}%` : "0%",
                                transitionDelay: `${0.2 + i * 0.1}s`,
                              }}
                            />
                          </div>
                          <span className="breakdown-percent">{row.percent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card padded anim-fade-up" ref={pieChartRef} style={{ animationDelay: "0.2s" }}>
          <div className="section-title">התפלגות הכנסות לפי סוג שירות</div>
          <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
            <PieChart width={340} height={300}>
              <Pie
                data={revenueByService}
                cx={170}
                cy={140}
                innerRadius={70}
                outerRadius={120}
                dataKey="value"
                paddingAngle={0}
                stroke="none"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {revenueByService.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, ""]} />
            </PieChart>
          </div>
          <div className="donut-legend">
            {revenueByService.map((item) => (
              <div key={item.name} className="donut-legend-item">
                <div className="donut-legend-color" style={{ background: item.color }} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="footer">
        Powered by &nbsp; מוקד בסקייל &nbsp; | &nbsp; RevOps Intelligence
      </div>
    </div>
  );
}
