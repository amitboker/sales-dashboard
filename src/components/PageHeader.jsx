export default function PageHeader({ title, subtitle, actions, filters }) {
  const hasButtons = actions || filters;
  return (
    <div className="page-header">
      <div className="page-header-text">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {hasButtons && (
        <div className="page-header-bar">
          <div className="page-actions">{actions}</div>
          {filters && <div className="page-filters">{filters}</div>}
        </div>
      )}
    </div>
  );
}
