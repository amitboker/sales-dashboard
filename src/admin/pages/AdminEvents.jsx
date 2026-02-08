import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import PageHeader from "../../dashboard/components/PageHeader.jsx";

const PAGE_SIZE = 50;

const eventLabels = {
  page_view: "צפייה בדף",
  login: "התחברות",
  signup: "הרשמה",
  demo_login: "כניסת דמו",
  export_pdf: "ייצוא PDF",
  funnel_edit: "עריכת משפך",
  ai_workspace_use: "שימוש ב-AI",
  user_status_change: "שינוי סטטוס משתמש",
  settings_update: "עדכון הגדרות",
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filterEvent, setFilterEvent] = useState("");

  useEffect(() => {
    loadEvents();
  }, [page, filterEvent]);

  async function loadEvents() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);

    let query = supabase
      .from("analytics_events")
      .select("*")
      .order("createdAt", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (filterEvent) {
      query = query.eq("eventName", filterEvent);
    }

    const { data, error } = await query;
    if (!error && data) {
      setEvents(data);
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoading(false);
  }

  function formatTimestamp(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("he-IL", {
      day: "2-digit", month: "2-digit", year: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  }

  const eventTypes = [
    "page_view", "login", "signup", "demo_login",
    "export_pdf", "funnel_edit", "ai_workspace_use",
    "user_status_change",
  ];

  return (
    <div className="page-enter">
      <PageHeader title="לוג אירועים" subtitle="צפייה באירועי מערכת" />

      <div className="admin-search-bar section">
        <div className="admin-filter-pills">
          <button
            className={`admin-filter-pill${!filterEvent ? " active" : ""}`}
            onClick={() => { setFilterEvent(""); setPage(0); }}
            type="button"
          >
            הכל
          </button>
          {eventTypes.map((et) => (
            <button
              key={et}
              className={`admin-filter-pill${filterEvent === et ? " active" : ""}`}
              onClick={() => { setFilterEvent(et); setPage(0); }}
              type="button"
            >
              {eventLabels[et] || et}
            </button>
          ))}
        </div>
      </div>

      <div className="card padded section">
        {loading ? (
          <div className="admin-empty">
            <div className="admin-empty-text">טוען אירועים...</div>
          </div>
        ) : events.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">⚡</div>
            <div className="admin-empty-text">אין אירועים עדיין</div>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>זמן</th>
                <th>אירוע</th>
                <th>משתמש</th>
                <th>דף</th>
                <th>פיצ׳ר</th>
                <th>Session</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>
                    {formatTimestamp(e.createdAt)}
                  </td>
                  <td>
                    <span className="admin-event-name">
                      {eventLabels[e.eventName] || e.eventName}
                    </span>
                  </td>
                  <td style={{ direction: "ltr", textAlign: "right", fontSize: 12 }}>
                    {e.userId ? e.userId.slice(0, 8) + "…" : "—"}
                  </td>
                  <td style={{ fontSize: 12 }}>{e.page || "—"}</td>
                  <td style={{ fontSize: 12 }}>{e.feature || "—"}</td>
                  <td style={{ direction: "ltr", textAlign: "right", fontSize: 11, color: "#999" }}>
                    {e.sessionId ? e.sessionId.slice(0, 8) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="admin-pagination">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            type="button"
          >
            הקודם
          </button>
          <span className="admin-pagination-info">עמוד {page + 1}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
            type="button"
          >
            הבא
          </button>
        </div>
      </div>
    </div>
  );
}
