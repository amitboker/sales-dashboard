import { useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import RevenueBlueprint from "./RevenueBlueprint.jsx";
import { ProjectionBuilderView } from "./ForecastPlanner.jsx";

export default function ProjectionBuilder() {
  const [mode, setMode] = useState("forecast");

  return (
    <div className="page-enter">
      <PageHeader
        title="בניית תחזית"
        subtitle="כלי תחזית ותכנון לפי יעדים"
      />

      <div className="forecast-toggle-wrap">
        <div className="forecast-toggle">
          <div
            className="forecast-toggle-slider"
            style={{ transform: mode === "forecast" ? "translateX(100%)" : "translateX(0)" }}
          />
          <button
            type="button"
            className={`forecast-toggle-btn ${mode === "blueprint" ? "active" : ""}`}
            onClick={() => setMode("blueprint")}
          >
            Revenue Blueprint
          </button>
          <button
            type="button"
            className={`forecast-toggle-btn ${mode === "forecast" ? "active" : ""}`}
            onClick={() => setMode("forecast")}
          >
            בניית תחזית
          </button>
        </div>
      </div>

      <div className="forecast-view-content" key={mode}>
        {mode === "forecast" ? (
          <ProjectionBuilderView />
        ) : (
          <RevenueBlueprint embedded />
        )}
      </div>

      <div className="footer">
        Powered by &nbsp; מוקד בסקייל &nbsp; | &nbsp; RevOps Intelligence
      </div>
    </div>
  );
}
