import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { usePageTracking } from "../lib/usePageTracking";
import useClientData from "./hooks/useClientData.js";
import { DemoModeProvider, useDemoMode } from "./context/DemoModeContext.jsx";
import SideNav from "./components/SideNav.jsx";
import TopBar from "./components/TopBar.jsx";
import DashboardPageWrapper from "./components/DashboardPageWrapper.jsx";
import OverviewDashboard from "./pages/OverviewDashboard.jsx";
import TeamPerformance from "./pages/TeamPerformance.jsx";
import SalesFunnel from "./pages/SalesFunnel.jsx";
import ProjectionBuilder from "./pages/ProjectionBuilder.jsx";
import AIWorkspace from "./pages/AIWorkspace.jsx";
import Settings from "./pages/Settings.jsx";
import IntegrationsPage from "./pages/IntegrationsPage.jsx";
import "./dashboard.css";

const pageMap = {
  command: OverviewDashboard,
  funnel: SalesFunnel,
  team: TeamPerformance,
  ai: AIWorkspace,
  projection: ProjectionBuilder,
  integrations: IntegrationsPage,
  settings: Settings,
};

function DashboardAppInner() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  usePageTracking("/dashboard");
  const { client, hasData, loading: clientLoading } = useClientData();
  const { isDemo } = useDemoMode();
  const [activePage, setActivePage] = useState("ai");

  const effectiveHasData = isDemo || hasData;

  const profileName = (() => {
    if (user) {
      if (profile) {
        const first = profile.firstName || "";
        const last = profile.lastName || "";
        const full = `${first} ${last}`.trim();
        if (full) return full;
      }
      const meta = user.user_metadata;
      if (meta) {
        const metaName = meta.full_name || `${meta.first_name || ""} ${meta.last_name || ""}`.trim();
        if (metaName) return metaName;
      }
      return "משתמש";
    }
    return "משתמש";
  })();
  const [profileRole] = useState("מנהל");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const contentRef = useRef(null);

  const handleExitComplete = useCallback(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (_) { /* ignore */ }
    navigate("/login");
  };

  // Navigate to integrations page for data connection
  const handleConnectData = useCallback(() => {
    setActivePage("integrations");
  }, []);

  const ActiveComponent = pageMap[activePage] || AIWorkspace;
  const isSettings = activePage === "settings";

  // Common props for data-dependent pages
  const dataProps = { hasData: effectiveHasData, clientLoading, onConnectData: handleConnectData };

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
            isAdmin={isAdmin}
          />
          <DashboardPageWrapper routeKey={activePage} onExitComplete={handleExitComplete}>
            {isSettings ? (
              <ActiveComponent
                profileName={profileName}
                profilePhoto={profilePhoto}
                onPhotoChange={setProfilePhoto}
                client={client}
                onNavigate={setActivePage}
              />
            ) : activePage === "integrations" ? (
              <ActiveComponent client={client} />
            ) : activePage === "ai" ? (
              <ActiveComponent profilePhoto={profilePhoto} {...dataProps} isDemo={isDemo} />
            ) : (
              <ActiveComponent {...dataProps} />
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

export default function DashboardApp() {
  const { isAdmin } = useAuth();
  return (
    <DemoModeProvider isAdmin={isAdmin}>
      <DashboardAppInner />
    </DemoModeProvider>
  );
}
