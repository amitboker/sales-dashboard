export default function DashboardPageWrapper({ routeKey, children }) {
  return (
    <div className="dashboard-page-wrapper" key={routeKey}>
      {children}
    </div>
  );
}
