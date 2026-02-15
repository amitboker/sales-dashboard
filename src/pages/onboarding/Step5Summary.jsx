import { useState } from 'react';

const CRM_LABELS = {
  monday: 'Monday',
  hubspot: 'HubSpot',
  salesforce: 'Salesforce',
  pipedrive: 'Pipedrive',
  zoho: 'Zoho',
  other: 'אחר',
};

const CHANNEL_LABELS = {
  inbound: 'Inbound — לידים נכנסים',
  outbound: 'Outbound — פנייה יזומה',
  both: 'שניהם',
};

export default function Step5Summary({ data, goBack, onComplete }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFinish = async () => {
    setSaving(true);
    setError('');
    try {
      await onComplete();
    } catch (err) {
      setError('שגיאה בשמירת הנתונים. נסה שוב.');
      setSaving(false);
    }
  };

  const crmDisplay = data.crm === 'other'
    ? data.crmOther || 'אחר'
    : CRM_LABELS[data.crm] || data.crm;

  return (
    <div className="ob-card ob-step-enter">
      <div className="ob-card__icon">🎉</div>
      <h2 className="ob-card__title">הכל מוכן!</h2>
      <p className="ob-card__subtitle">הנה סיכום הפרטים שלך</p>

      <div className="ob-summary">
        <div className="ob-summary__section">
          <div className="ob-summary__label">עסק</div>
          <div className="ob-summary__value">{data.businessName}</div>
        </div>
        <div className="ob-summary__section">
          <div className="ob-summary__label">תחום</div>
          <div className="ob-summary__value">{data.industry}</div>
        </div>
        <div className="ob-summary__section">
          <div className="ob-summary__label">מדינה / אזור זמן</div>
          <div className="ob-summary__value">{data.country} — {data.timezone}</div>
        </div>
        <div className="ob-summary__divider" />
        <div className="ob-summary__section">
          <div className="ob-summary__label">אנשי מכירות</div>
          <div className="ob-summary__value">{data.repCount}</div>
        </div>
        <div className="ob-summary__section">
          <div className="ob-summary__label">מנהל מכירות</div>
          <div className="ob-summary__value">{data.hasSalesManager ? 'כן' : 'לא'}</div>
        </div>
        <div className="ob-summary__section">
          <div className="ob-summary__label">ערוץ מכירות</div>
          <div className="ob-summary__value">{CHANNEL_LABELS[data.salesChannel] || data.salesChannel}</div>
        </div>
        <div className="ob-summary__divider" />
        <div className="ob-summary__section">
          <div className="ob-summary__label">CRM</div>
          <div className="ob-summary__value">{crmDisplay}</div>
        </div>
        <div className="ob-summary__section">
          <div className="ob-summary__label">סטטוס חיבור</div>
          <div className="ob-summary__value">
            {data.crmConnected
              ? '✅ מחובר (תצוגה מקדימה)'
              : '⏳ ממתין לחיבור'}
          </div>
        </div>
      </div>

      {error && <p style={{ color: '#d9534f', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}

      <div className="ob-nav">
        <button className="ob-btn ob-btn--back" onClick={goBack}>→ חזור</button>
        <button className="ob-btn ob-btn--finish" onClick={handleFinish} disabled={saving}>
          {saving ? <span className="ob-spinner" /> : 'כניסה ל-Clario 🚀'}
        </button>
      </div>
    </div>
  );
}
