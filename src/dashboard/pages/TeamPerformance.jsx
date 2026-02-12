import { useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, ZAxis, LabelList,
} from "recharts";
import PageHeader from "../components/PageHeader.jsx";
import Icon from "../components/Icon.jsx";
import { teamTable, teamStats, conversionTrend, callsVsDeals } from "../data/mockData.js";
import { generatePDF } from "../utils/pdfExport.js";

export default function TeamPerformance() {
  const rows = teamTable.rows;
  const lineChartRef = useRef(null);
  const scatterChartRef = useRef(null);

  const handleExportPDF = async () => {
    try {
      await generatePDF({
        pageTitle: "דוח ביצועים - ביצועי צוות",
        reportType: "ביצועי-צוות",
        metrics: [
          { label: "מוקדנים פעילים", value: String(teamStats.activeReps) },
          { label: "שיעור המרה ממוצע", value: teamStats.avgConversionRate },
          { label: "מוקדן הכוכב", value: teamStats.starOfMonth },
        ],
        chartRefs: [
          { title: "מגמת שיעור המרה - 3 חודשים", ref: lineChartRef },
          { title: "שיחות מול עסקאות שנסגרו", ref: scatterChartRef },
        ],
        tables: [{
          title: "טבלת מוקדנים",
          columns: ["#", "שם מוקדן", "עסקאות", "הכנסות", "שיעור המרה", "ממוצע עסקה", "זמן סגירה"],
          rows: rows.map(r => [
            String(r.id), r.name, String(r.deals), r.revenue, r.closeRate, r.avgDeal, r.closeTime,
          ]),
          columnStyles: { 0: { halign: "center" }, 2: { halign: "center" }, 3: { halign: "center" }, 4: { halign: "center" }, 5: { halign: "center" }, 6: { halign: "center" } },
        }],
      });
    } catch (e) {
      console.error("PDF export failed:", e);
      alert("שגיאה בייצוא PDF: " + e.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="ביצועי צוות"
        subtitle="מעקב אחר ביצועי המוקדנים"
        actions={
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

      <div className="grid grid-3 section">
        <div className="card team-stat-card">
          <div className="team-stat-icon people"><Icon name="users" size={20} style={{ filter: "brightness(0)" }} /></div>
          <div className="team-stat-content">
            <div className="team-stat-label">מספר מוקדנים פעילים</div>
            <div className="team-stat-value">{teamStats.activeReps}</div>
          </div>
        </div>
        <div className="card team-stat-card">
          <div className="team-stat-icon chart"><Icon name="trending-up" size={20} style={{ filter: "brightness(0)" }} /></div>
          <div className="team-stat-content">
            <div className="team-stat-label">שיעור המרה ממוצע צוות</div>
            <div className="team-stat-value">{teamStats.avgConversionRate}</div>
          </div>
        </div>
        <div className="card team-stat-card">
          <div className="team-stat-icon trophy"><Icon name="zap" size={20} style={{ filter: "brightness(0)" }} /></div>
          <div className="team-stat-content">
            <div className="team-stat-label">מוקדן הכוכב החודש</div>
            <div className="team-stat-value">{teamStats.starOfMonth}</div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="card table-card">
          <div className="table-header">
            <h3>
              <Icon name="bar-chart" size={16} style={{ filter: "sepia(1) saturate(5) hue-rotate(90deg) brightness(0.6)", marginLeft: 6 }} /> טבלת מוקדנים
            </h3>
            <div className="table-legend">
              <div className="legend-item">
                <span className="legend-dot green" />
                <span>מעל יעד ({">"}20%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot yellow" />
                <span>קרוב ליעד (15-20%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot red" />
                <span>מתחת ליעד ({"<"}15%)</span>
              </div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>שם מוקדן</th>
                <th>עסקאות</th>
                <th>הכנסות</th>
                <th>שיעור המרה</th>
                <th>ממוצע עסקה</th>
                <th>זמן סגירה</th>
                <th>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isRed = row.status === "red";
                return (
                  <tr key={row.id}>
                    <td>
                      <div className="team-name-cell">
                        <span className="team-row-num">{row.id}</span>
                        <div className="team-avatar" style={{ background: row.color }}>
                          {row.initials}
                        </div>
                        <div className="team-name-info">
                          <div className="team-member-name">{row.name}</div>
                          <div className="team-member-phone">{row.phone}</div>
                        </div>
                        {row.id === 1 && (
                          <Icon name="zap" size={16} style={{ filter: "sepia(1) saturate(5) hue-rotate(30deg) brightness(0.7)", marginLeft: 4 }} />
                        )}
                      </div>
                    </td>
                    <td>{row.deals}</td>
                    <td>{row.revenue}</td>
                    <td className={isRed ? "close-rate-red" : ""}>
                      {row.closeRate}
                    </td>
                    <td>{row.avgDeal}</td>
                    <td className={isRed && parseFloat(row.closeTime) > 5.5 ? "close-time-red" : ""}>
                      {row.closeTime}
                    </td>
                    <td>
                      <span className={`status-dot ${row.status}`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-2 section">
        <div className="card padded" ref={lineChartRef}>
          <div className="section-title">מגמת שיעור המרה - 3 חודשים</div>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={conversionTrend} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ece5" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${v}%`}
                domain={[6, 26]}
              />
              <Tooltip formatter={(v) => [`${v}%`, ""]} />
              <Legend />
              <Line type="monotone" dataKey="יוסי_כהן" stroke="#DAFD68" strokeWidth={2} name="יוסי כהן" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="שירה_לוי" stroke="#c8ec55" strokeWidth={2} name="שירה לוי" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="דוד_מזרחי" stroke="#b7dd4c" strokeWidth={2} name="דוד מזרחי" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="זיבי_שמש" stroke="#f3f9d6" strokeWidth={2} name="זיבי שמש" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card padded" ref={scatterChartRef}>
          <div className="section-title">שיחות מול עסקאות שנסגרו</div>
          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ece5" />
              <XAxis
                dataKey="calls"
                type="number"
                tick={{ fontSize: 12 }}
                name="מספר שיחות"
                domain={[0, 160]}
              />
              <YAxis
                dataKey="deals"
                type="number"
                tick={{ fontSize: 12 }}
                name="עסקאות"
                domain={[0, 20]}
              />
              <ZAxis range={[60, 60]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter
                data={callsVsDeals}
                fill="#DAFD68"
              >
                <LabelList dataKey="name" position="top" style={{ fontSize: 10 }} />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div style={{ textAlign: "center", fontSize: 12, color: "#828282", marginTop: 4 }}>
            מספר שיחות
          </div>
        </div>
      </div>

      <div className="footer">
        Powered by &nbsp; מוקד בסקייל &nbsp; | &nbsp; RevOps Intelligence
      </div>
    </div>
  );
}
