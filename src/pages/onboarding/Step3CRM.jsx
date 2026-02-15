import { useState } from 'react';

const CRM_OPTIONS = [
  { id: 'monday', name: 'Monday', icon: '📋', color: '#6C63FF' },
  { id: 'hubspot', name: 'HubSpot', icon: '🟠', color: '#FF7A59' },
  { id: 'salesforce', name: 'Salesforce', icon: '☁️', color: '#00A1E0' },
  { id: 'pipedrive', name: 'Pipedrive', icon: '🟢', color: '#25C16F' },
  { id: 'zoho', name: 'Zoho', icon: '📊', color: '#E42527' },
  { id: 'other', name: 'אחר', icon: '⚙️', color: '#828282' },
];

export default function Step3CRM({ data, onChange, goNext, goBack }) {
  const [crm, setCrm] = useState(data.crm || '');
  const [crmOther, setCrmOther] = useState(data.crmOther || '');

  const isValid = crm && (crm !== 'other' || crmOther.trim());

  const handleSelect = (id) => {
    setCrm(id);
    if (id !== 'other') setCrmOther('');
  };

  const handleNext = () => {
    if (!isValid) return;
    onChange({ crm, crmOther: crm === 'other' ? crmOther.trim() : '' });
    goNext();
  };

  return (
    <div className="ob-card ob-step-enter">
      <div className="ob-card__icon">🔗</div>
      <h2 className="ob-card__title">באיזה CRM אתם משתמשים?</h2>
      <p className="ob-card__subtitle">נחבר את המערכת שלכם ל-Clario</p>

      <div className="ob-crm-grid">
        {CRM_OPTIONS.map((opt) => {
          const selected = crm === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={`ob-crm-card ${selected ? 'ob-crm-card--selected' : ''}`}
              onClick={() => handleSelect(opt.id)}
            >
              <span className="ob-crm-card__icon">{opt.icon}</span>
              <span className="ob-crm-card__name">{opt.name}</span>
              {selected && (
                <span className="ob-crm-card__check">
                  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {crm === 'other' && (
        <div className="ob-field" style={{ marginTop: '1rem' }}>
          <label className="ob-label">שם ה-CRM</label>
          <input
            className="ob-input"
            type="text"
            placeholder="לדוגמה: Freshsales, Close..."
            value={crmOther}
            onChange={(e) => setCrmOther(e.target.value)}
          />
        </div>
      )}

      <div className="ob-nav">
        <button className="ob-btn ob-btn--back" onClick={goBack}>→ חזור</button>
        <button className="ob-btn ob-btn--primary" onClick={handleNext} disabled={!isValid}>
          המשך ←
        </button>
      </div>
    </div>
  );
}
