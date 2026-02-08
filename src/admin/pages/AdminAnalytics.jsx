import { useState, useEffect } from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";
import { supabase } from "../../lib/supabase";
import PageHeader from "../../dashboard/components/PageHeader.jsx";
import StatCard from "../../dashboard/components/StatCard.jsx";

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function toDateKey(dateStr) {
  return new Date(dateStr).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" });
}

export default function AdminAnalytics() {
  const [range, setRange] = useState(30);
  const [stats, setStats] = useState({ dau: 0, wau: 0, mau: 0, signups: 0 });
  const [dailyActive, setDailyActive] = useState([]);
  const [featureUsage, setFeatureUsage] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [dailyLogins, setDailyLogins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  async function loadAnalytics() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);

    const since = daysAgo(range);
    const { data: events } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("createdAt", since)
      .order("createdAt", { ascending: true });

    const { data: profiles } = await supabase
      .from("profiles")
      .select("createdAt")
      .gte("createdAt", since);

    if (!events) { setLoading(false); return; }

    // DAU / WAU / MAU
    const now = new Date();
    const uniqueUsers = (days) => {
      const cutoff = daysAgo(days);
      const ids = new Set(events.filter((e) => e.createdAt >= cutoff && e.userId).map((e) => e.userId));
      return ids.size;
    };
    setStats({
      dau: uniqueUsers(1),
      wau: uniqueUsers(7),
      mau: uniqueUsers(30),
      signups: profiles ? profiles.length : 0,
    });

    // Daily active users chart
    const dailyMap = {};
    events.forEach((e) => {
      if (!e.userId) return;
      const key = toDateKey(e.createdAt);
      if (!dailyMap[key]) dailyMap[key] = new Set();
      dailyMap[key].add(e.userId);
    });
    setDailyActive(
      Object.entries(dailyMap).map(([date, users]) => ({ date, users: users.size }))
    );

    // Feature usage
    const featureMap = {};
    events.forEach((e) => {
      if (!e.feature) return;
      featureMap[e.feature] = (featureMap[e.feature] || 0) + 1;
    });
    const featureLabels = {
      overview_pdf: "ייצוא PDF",
      funnel_editor: "עריכת משפך",
      funnel_pdf: "PDF משפך",
      ai_workspace: "עוזר AI",
      settings: "הגדרות",
      user_management: "ניהול משתמשים",
    };
    setFeatureUsage(
      Object.entries(featureMap)
        .map(([feature, count]) => ({ feature: featureLabels[feature] || feature, count }))
        .sort((a, b) => b.count - a.count)
    );

    // Onboarding funnel
    const signups = new Set(events.filter((e) => e.eventName === "signup").map((e) => e.userId)).size
      + (profiles ? profiles.length : 0);
    const dashViews = new Set(
      events.filter((e) => e.eventName === "page_view" && e.page?.includes("/dashboard")).map((e) => e.userId)
    ).size;
    const keyActions = new Set(
      events.filter((e) => ["export_pdf", "funnel_edit", "ai_workspace_use"].includes(e.eventName)).map((e) => e.userId)
    ).size;
    setFunnelData([
      { label: "הרשמה", value: signups || 1 },
      { label: "כניסה לדאשבורד", value: dashViews },
      { label: "פעולה ראשונה", value: keyActions },
    ]);

    // Daily logins
    const loginMap = {};
    events.filter((e) => e.eventName === "login").forEach((e) => {
      const key = toDateKey(e.createdAt);
      loginMap[key] = (loginMap[key] || 0) + 1;
    });
    setDailyLogins(
      Object.entries(loginMap).map(([date, count]) => ({ date, count }))
    );

    setLoading(false);
  }

  const maxFunnel = Math.max(...funnelData.map((s) => s.value), 1);

  return (
    <div className="page-enter">
      <PageHeader
        title="אנליטיקס"
        subtitle="נתוני שימוש ומעורבות"
        filters={
          <div className="admin-filter-pills">
            {[
              { id: 7, label: "7 ימים" },
              { id: 30, label: "30 יום" },
              { id: 90, label: "90 יום" },
            ].map((r) => (
              <button
                key={r.id}
                className={`admin-filter-pill${range === r.id ? " active" : ""}`}
                onClick={() => setRange(r.id)}
                type="button"
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-4 section">
        <StatCard icon="chart" label="DAU (יומי)" value={stats.dau} />
        <StatCard icon="briefcase" label="WAU (שבועי)" value={stats.wau} />
        <StatCard icon="clock" label="MAU (חודשי)" value={stats.mau} />
        <StatCard icon="dollar" label="הרשמות" value={stats.signups} />
      </div>

      {loading ? (
        <div className="admin-empty section">
          <div className="admin-empty-text">טוען נתונים...</div>
        </div>
      ) : (
        <>
          {/* Charts row */}
          <div className="grid section" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
            <div className="card padded">
              <h3 className="section-title">משתמשים פעילים יומית</h3>
              {dailyActive.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={dailyActive} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DAFD68" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#DAFD68" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8ece5" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" name="משתמשים" stroke="#DAFD68" fill="url(#colorActive)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="admin-empty"><div className="admin-empty-text">אין נתונים עדיין</div></div>
              )}
            </div>

            <div className="card padded">
              <h3 className="section-title">שימוש בפיצ׳רים</h3>
              {featureUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={featureUsage} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8ece5" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="feature" type="category" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="שימושים" fill="#DAFD68" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="admin-empty"><div className="admin-empty-text">אין נתונים עדיין</div></div>
              )}
            </div>
          </div>

          {/* Onboarding funnel */}
          <div className="card padded section">
            <h3 className="section-title">משפך אונבורדינג</h3>
            <div className="admin-funnel">
              {funnelData.map((stage, i) => (
                <div key={stage.label} style={{ display: "flex", alignItems: "stretch", flex: 1 }}>
                  <div className="admin-funnel-stage">
                    <div
                      className="admin-funnel-bar"
                      style={{ width: `${Math.max((stage.value / maxFunnel) * 100, 8)}%`, margin: "0 auto 12px" }}
                    />
                    <div className="admin-funnel-value">{stage.value}</div>
                    <div className="admin-funnel-label">{stage.label}</div>
                    {i > 0 && funnelData[i - 1].value > 0 && (
                      <div className="admin-funnel-rate">
                        {Math.round((stage.value / funnelData[i - 1].value) * 100)}% המרה
                      </div>
                    )}
                  </div>
                  {i < funnelData.length - 1 && (
                    <div className="admin-funnel-arrow">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Daily logins */}
          <div className="card padded section">
            <h3 className="section-title">התחברויות יומיות</h3>
            {dailyLogins.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dailyLogins} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ece5" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" name="התחברויות" stroke="#5cb85c" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="admin-empty"><div className="admin-empty-text">אין נתוני התחברויות עדיין</div></div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
