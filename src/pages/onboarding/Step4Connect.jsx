import { useState } from 'react';

const CRM_CONNECTORS = {
  monday: { name: 'Monday', icon: '📋', color: '#6C63FF' },
  hubspot: { name: 'HubSpot', icon: '🟠', color: '#FF7A59' },
  salesforce: { name: 'Salesforce', icon: '☁️', color: '#00A1E0' },
  pipedrive: { name: 'Pipedrive', icon: '🟢', color: '#25C16F' },
  zoho: { name: 'Zoho', icon: '📊', color: '#E42527' },
};

export default function Step4Connect({ data, onChange, goNext, goBack }) {
  const [connectState, setConnectState] = useState(data.crmConnected ? 'connected' : 'idle');
  // idle | connecting | connected

  const selectedCrm = data.crm;
  const connector = CRM_CONNECTORS[selectedCrm];
  const isOther = selectedCrm === 'other';

  const handleConnect = () => {
    setConnectState('connecting');
    // Simulate connection with 1.5s delay
    setTimeout(() => {
      setConnectState('connected');
      onChange({ crmConnected: true });
    }, 1500);
  };

  const handleNext = () => {
    goNext();
  };

  return (
    <div className="ob-card ob-step-enter">
      <div className="ob-card__icon">⚡</div>
      <h2 className="ob-card__title">חבר את ה-CRM שלך</h2>
      <p className="ob-card__subtitle">חיבור בלחיצה אחת — הנתונים שלך יסונכרנו אוטומטית</p>

      {isOther ? (
        /* "Other" CRM — no auto-connect */
        <div className="ob-connect-card">
          <div className="ob-connect-card__icon">⚙️</div>
          <div className="ob-connect-card__info">
            <div className="ob-connect-card__name">{data.crmOther || 'CRM מותאם'}</div>
            <div className="ob-connect-card__desc">חיבור מותאם אישית — נחזור אליך בקרוב</div>
          </div>
          <div className="ob-connect-badge ob-connect-badge--soon">בקרוב</div>
        </div>
      ) : connector ? (
        /* Known CRM — mock connect */
        <div className="ob-connect-card">
          <div className="ob-connect-card__icon">{connector.icon}</div>
          <div className="ob-connect-card__info">
            <div className="ob-connect-card__name">{connector.name}</div>
            <div className="ob-connect-card__desc">
              {connectState === 'connected'
                ? 'מחובר בהצלחה (תצוגה מקדימה)'
                : 'חבר בלחיצה אחת'}
            </div>
          </div>

          {connectState === 'idle' && (
            <button className="ob-connect-btn" onClick={handleConnect}>
              חבר עכשיו
            </button>
          )}
          {connectState === 'connecting' && (
            <div className="ob-connect-badge ob-connect-badge--loading">
              <span className="ob-spinner ob-spinner--small" />
              מתחבר...
            </div>
          )}
          {connectState === 'connected' && (
            <div className="ob-connect-badge ob-connect-badge--success">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              מחובר
            </div>
          )}
        </div>
      ) : null}

      <div className="ob-connect-note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>זוהי תצוגה מקדימה — חיבור אמיתי יהיה זמין בקרוב</span>
      </div>

      <div className="ob-nav">
        <button className="ob-btn ob-btn--back" onClick={goBack}>→ חזור</button>
        <button className="ob-btn ob-btn--primary" onClick={handleNext}>
          המשך ←
        </button>
      </div>
    </div>
  );
}
