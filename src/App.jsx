import { useState } from "react";
import SideNav from "./components/SideNav.jsx";
import OverviewDashboard from "./pages/OverviewDashboard.jsx";
import TeamPerformance from "./pages/TeamPerformance.jsx";
import SalesFunnel from "./pages/SalesFunnel.jsx";
import ForecastPlanner from "./pages/ForecastPlanner.jsx";
import AIWorkspace from "./pages/AIWorkspace.jsx";

const pageMap = {
  overview: OverviewDashboard,
  funnel: SalesFunnel,
  team: TeamPerformance,
  ai: AIWorkspace,
  forecast: ForecastPlanner,
};

export default function App() {
  const [activePage, setActivePage] = useState("overview");
  const ActiveComponent = pageMap[activePage] || OverviewDashboard;

  return (
    <div className="app">
      <main className="content">
        <ActiveComponent />
      </main>
      <SideNav activeId={activePage} onSelect={setActivePage} />
    </div>
  );
}

