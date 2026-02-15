import { useState, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { usePageTracking } from "../lib/usePageTracking";
import TopBar from "../dashboard/components/TopBar.jsx";
import DashboardPageWrapper from "../dashboard/components/DashboardPageWrapper.jsx";
import AdminSideNav from "./components/AdminSideNav.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminAnalytics from "./pages/AdminAnalytics.jsx";
import AdminEvents from "./pages/AdminEvents.jsx";
import "../dashboard/dashboard.css";
import "./admin.css";

const pageMap = {
  users: AdminUsers,
  analytics: AdminAnalytics,
  events: AdminEvents,
};

export default function AdminApp() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [activePage, setActivePage] = useState("users");
  const KNOWN_NAMES = {
    "amitbokershud@gmail.com": "עמית בוקר",
    "amitboker@gmail.com": "עמית בוקר",
  };

  const profileName = (() => {
    if (user) {
      const known = KNOWN_NAMES[user.email];
      if (known) return known;
      if (profile) {
        const first = profile.firstName || "";
        const last = profile.lastName || "";
        const full = `${first} ${last}`.trim();
        if (full) return full;
      }
      return "משתמש";
    }
    const demoName = localStorage.getItem("demo_first_name");
    if (demoName && demoName.trim()) return demoName.trim();
    return "Admin";
  })();

  usePageTracking("/admin");
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [activePage]);

  const handleLogout = async () => {
    try { await signOut(); } catch (_) {}
    localStorage.removeItem("demo_first_name");
    navigate("/login");
  };

  const ActiveComponent = pageMap[activePage] || AdminUsers;

  return (
    <div className="admin-wrapper">
      <div className="app">
        <main className="content" ref={contentRef}>
          <TopBar
            profileName={profileName}
            profileRole="אדמין"
            profilePhoto={null}
            onNavigate={setActivePage}
            onLogout={handleLogout}
          />
          <DashboardPageWrapper routeKey={activePage}>
            <ActiveComponent />
          </DashboardPageWrapper>
        </main>
        <AdminSideNav
          activeId={activePage}
          onSelect={setActivePage}
        />
      </div>
    </div>
  );
}
