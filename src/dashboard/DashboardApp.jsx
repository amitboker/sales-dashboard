import { useState, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { usePageTracking } from "../lib/usePageTracking";
import { trackEvent } from "../lib/tracking";
import SideNav from "./components/SideNav.jsx";
import TopBar from "./components/TopBar.jsx";
import DashboardPageWrapper from "./components/DashboardPageWrapper.jsx";
import OverviewDashboard from "./pages/OverviewDashboard.jsx";
import TeamPerformance from "./pages/TeamPerformance.jsx";
import SalesFunnel from "./pages/SalesFunnel.jsx";
import ProjectionBuilder from "./pages/ProjectionBuilder.jsx";
import AIWorkspace from "./pages/AIWorkspace.jsx";
import Settings from "./pages/Settings.jsx";
import ClarioAcademy from "./pages/ClarioAcademy.jsx";
import "./dashboard.css";

const pageMap = {
  command: OverviewDashboard,
  funnel: SalesFunnel,
  team: TeamPerformance,
  ai: AIWorkspace,
  projection: ProjectionBuilder,
  academy: ClarioAcademy,
  settings: Settings,
};

export default function DashboardApp() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  usePageTracking("/dashboard");
  const [activePage, setActivePage] = useState("ai");
  const KNOWN_NAMES = {
    "amitbokershud@gmail.com": "עמית בוקר",
    "amitboker@gmail.com": "עמית בוקר",
  };

  const profileName = (() => {
    // Authenticated user — never fall through to stale localStorage
    if (user) {
      // Known users — guaranteed Hebrew display name
      const known = KNOWN_NAMES[user.email];
      if (known) return known;
      if (profile) {
        const first = profile.firstName || "";
        const last = profile.lastName || "";
        const full = `${first} ${last}`.trim();
        if (full) return full;
      }
      // Try auth metadata as fallback
      const meta = user.user_metadata;
      if (meta) {
        const metaName = meta.full_name || `${meta.first_name || ""} ${meta.last_name || ""}`.trim();
        if (metaName) return metaName;
      }
      return "משתמש";
    }
    // Demo mode only
    const demoName = localStorage.getItem("demo_first_name");
    if (demoName && demoName.trim()) return demoName.trim();
    return "משתמש";
  })();
  const [profileRole] = useState("מנהל");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const contentRef = useRef(null);

  // Reset scroll to top before paint on every tab change
  useLayoutEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [activePage]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (_) { /* ignore */ }
    localStorage.removeItem("demo_first_name");
    navigate("/login");
  };

  const ActiveComponent = pageMap[activePage] || AIWorkspace;
  const isSettings = activePage === "settings";

  return (
    <div className="dashboard-wrapper">
      <div className="app">
        <main className="content" ref={contentRef}>
          <TopBar
            profileName={profileName}
            profileRole={profileRole}
            profilePhoto={profilePhoto}
            onNavigate={setActivePage}
            onLogout={handleLogout}
            isAdmin={isAdmin || !!localStorage.getItem("demo_first_name")}
          />
          <DashboardPageWrapper routeKey={activePage}>
            {isSettings ? (
              <ActiveComponent
                profileName={profileName}
                profilePhoto={profilePhoto}
                onPhotoChange={setProfilePhoto}
              />
            ) : (
              <ActiveComponent />
            )}
          </DashboardPageWrapper>
        </main>
        <SideNav
          activeId={activePage}
          onSelect={setActivePage}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />
      </div>
    </div>
  );
}
