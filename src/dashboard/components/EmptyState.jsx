/**
 * Reusable empty-state component for dashboard pages.
 * Shown when the current user has no connected data source yet.
 */
export default function EmptyState({
  title = "אין נתונים עדיין",
  description = "כדי להתחיל, חבר מקור נתונים למערכת",
  ctaLabel = "חבר מקור נתונים",
  onCta,
  secondaryLabel = "מה זה אומר?",
  onSecondary,
  icon,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        {icon || (
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect x="8" y="12" width="48" height="40" rx="6" stroke="#c5c5c5" strokeWidth="2" fill="#faf9f6" />
            <path d="M8 22h48" stroke="#e0e0e0" strokeWidth="2" />
            <circle cx="16" cy="17" r="2" fill="#DAFD68" />
            <circle cx="22" cy="17" r="2" fill="#c8ec55" />
            <circle cx="28" cy="17" r="2" fill="#e0e0e0" />
            <path d="M24 36h16M28 42h8" stroke="#c5c5c5" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__desc">{description}</p>
      <div className="empty-state__actions">
        {onCta && (
          <button className="button primary" type="button" onClick={onCta}>
            {ctaLabel}
          </button>
        )}
        {onSecondary && (
          <button className="button" type="button" onClick={onSecondary}>
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
