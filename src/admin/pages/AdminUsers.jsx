import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { trackEvent } from "../../lib/tracking";
import { useAuth } from "../../lib/auth";
import PageHeader from "../../dashboard/components/PageHeader.jsx";
import StatCard from "../../dashboard/components/StatCard.jsx";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    if (!supabase) { setLoading(false); return; }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("createdAt", { ascending: false });
    if (!error && data) setUsers(data);
    setLoading(false);
  }

  async function toggleActive(profile) {
    if (!supabase) return;
    const newVal = !profile.isActive;
    const now = new Date().toISOString();
    await supabase
      .from("profiles")
      .update({ isActive: newVal, updatedAt: now })
      .eq("id", profile.id);
    setUsers((prev) =>
      prev.map((u) => (u.id === profile.id ? { ...u, isActive: newVal, updatedAt: now } : u))
    );
    trackEvent("user_status_change", {
      page: "/admin/users",
      feature: "user_management",
      userId: user?.id,
      targetUserId: profile.authId,
      newStatus: newVal ? "active" : "inactive",
    });
  }

  const filtered = useMemo(() => {
    let list = users;
    if (filter === "active") list = list.filter((u) => u.isActive);
    if (filter === "inactive") list = list.filter((u) => !u.isActive);
    if (filter === "admin") list = list.filter((u) => u.isAdmin);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (u) =>
          (u.email || "").toLowerCase().includes(q) ||
          (u.firstName || "").toLowerCase().includes(q) ||
          (u.lastName || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, search, filter]);

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const newThisMonth = users.filter((u) => u.createdAt >= thisMonth).length;
  const inactiveUsers = totalUsers - activeUsers;

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("he-IL", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  }

  function formatTime(dateStr) {
    if (!dateStr) return "לא נצפה";
    const d = new Date(dateStr);
    const diff = (now - d) / 1000 / 60;
    if (diff < 60) return `לפני ${Math.round(diff)} דקות`;
    if (diff < 1440) return `לפני ${Math.round(diff / 60)} שעות`;
    return formatDate(dateStr);
  }

  function displayName(u) {
    if (u.firstName || u.lastName) return `${u.firstName || ""} ${u.lastName || ""}`.trim();
    return u.email?.split("@")[0] || "—";
  }

  return (
    <div className="page-enter">
      <PageHeader title="ניהול משתמשים" subtitle="צפייה וניהול משתמשי המערכת" />

      <div className="grid grid-4 section">
        <StatCard icon="chart" label="סה״כ משתמשים" value={totalUsers} />
        <StatCard icon="briefcase" label="פעילים" value={activeUsers} />
        <StatCard icon="clock" label="חדשים החודש" value={newThisMonth} />
        <StatCard icon="dollar" label="לא פעילים" value={inactiveUsers} />
      </div>

      <div className="admin-search-bar section">
        <input
          className="admin-search-input"
          type="text"
          placeholder="חיפוש לפי שם או אימייל..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-filter-pills">
          {[
            { id: "all", label: "הכל" },
            { id: "active", label: "פעילים" },
            { id: "inactive", label: "לא פעילים" },
            { id: "admin", label: "אדמינים" },
          ].map((f) => (
            <button
              key={f.id}
              className={`admin-filter-pill${filter === f.id ? " active" : ""}`}
              onClick={() => setFilter(f.id)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card padded section">
        {loading ? (
          <div className="admin-empty">
            <div className="admin-empty-text">טוען משתמשים...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">👥</div>
            <div className="admin-empty-text">לא נמצאו משתמשים</div>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>שם</th>
                <th>אימייל</th>
                <th>סטטוס</th>
                <th>תפקיד</th>
                <th>נוצר</th>
                <th>נצפה לאחרונה</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{displayName(u)}</td>
                  <td style={{ direction: "ltr", textAlign: "right" }}>{u.email}</td>
                  <td>
                    <span className={`admin-badge ${u.isActive ? "active" : "inactive"}`}>
                      <span className="admin-badge-dot" />
                      {u.isActive ? "פעיל" : "מושבת"}
                    </span>
                  </td>
                  <td>
                    {u.isAdmin && (
                      <span className="admin-badge admin">אדמין</span>
                    )}
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>{formatTime(u.lastSeen)}</td>
                  <td>
                    <button
                      className={`admin-action-btn${!u.isActive ? "" : " danger"}`}
                      onClick={() => toggleActive(u)}
                      type="button"
                    >
                      {u.isActive ? "השבת" : "הפעל"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
