import { useState } from "react";
import SideNav from "./components/SideNav.jsx";
import TopBar from "./components/TopBar.jsx";
import OverviewDashboard from "./pages/OverviewDashboard.jsx";
import TeamPerformance from "./pages/TeamPerformance.jsx";
import SalesFunnel from "./pages/SalesFunnel.jsx";
import ForecastPlanner from "./pages/ForecastPlanner.jsx";
import AIWorkspace from "./pages/AIWorkspace.jsx";
import Settings from "./pages/Settings.jsx";
import "./dashboard.css";

const pageMap = {
  overview: OverviewDashboard,
  funnel: SalesFunnel,
  team: TeamPerformance,
  ai: AIWorkspace,
  forecast: ForecastPlanner,
  settings: Settings,
};

export default function DashboardApp() {
  const [activePage, setActivePage] = useState("overview");
  const [profileName] = useState("עמית בוקר");
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
          {isSettings ? (
            <ActiveComponent
              profileName={profileName}
              profilePhoto={profilePhoto}
              onPhotoChange={setProfilePhoto}
            />
          ) : (
            <ActiveComponent />
          )}
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
