import { useLayoutEffect } from "react";

export default function DashboardPageWrapper({ routeKey, children }) {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const container = document.querySelector(".content");
    if (container) container.scrollTop = 0;
  }, [routeKey]);

  return (
    <div className="dashboard-page-wrapper" key={routeKey}>
      {children}
    </div>
  );
}
