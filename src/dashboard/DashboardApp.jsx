import { useState } from "react";
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
import "./dashboard.css";

const pageMap = {
  command: OverviewDashboard,
  funnel: SalesFunnel,
  team: TeamPerformance,
  ai: AIWorkspace,
  projection: ProjectionBuilder,
  settings: Settings,
};

export default function DashboardApp() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  usePageTracking("/dashboard");
  const [activePage, setActivePage] = useState("ai");
  const profileName = (() => {
    if (user && profile) {
      const first = profile.firstName || "";
      const last = profile.lastName || "";
      const full = `${first} ${last}`.trim();
      if (full) return full;
      return user.email;
    }
    const demoName = localStorage.getItem("demo_first_name");
    if (demoName && demoName.trim()) return demoName.trim();
    return "משתמש";
  })();
  const [profileRole] = useState("מנהל");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        <main className="content">
          <TopBar
            profileName={profileName}
            profileRole={profileRole}
            profilePhoto={profilePhoto}
            onNavigate={setActivePage}
            onLogout={handleLogout}
            isAdmin={isAdmin}
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
