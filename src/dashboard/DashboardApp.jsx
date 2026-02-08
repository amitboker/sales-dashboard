import { useState } from "react";
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
  const [activePage, setActivePage] = useState("command");
  const [profileName] = useState(() => {
    const demoName = localStorage.getItem("demo_first_name");
    return demoName && demoName.trim() ? demoName.trim() : "עמית בוקר";
  });
  const [profileRole] = useState("מנהל");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const ActiveComponent = pageMap[activePage] || OverviewDashboard;
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
