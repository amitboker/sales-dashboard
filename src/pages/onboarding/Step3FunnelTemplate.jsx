import { useState } from 'react';
import { saveFunnelTemplate } from '../../lib/onboarding-api';

const TEMPLATES = [
  {
    id: 'b2c_classic',
    icon: '📊',
    name: 'B2C קלאסי',
    desc: 'לידים → שיחה → עסקה',
  },
  {
    id: 'call_center',
    icon: '☎️',
    name: 'Call Center',
    desc: 'שיחות → מעוניין → המרה',
  },
  {
    id: 'custom',
    icon: '✨',
    name: 'Custom',
    desc: 'אבנה בעצמי',
  },
];

const CheckIcon = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Step3FunnelTemplate({ clientId, updateClientData, goNext, goBack }) {
  const [selected, setSelected] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');

    try {
      const funnel = await saveFunnelTemplate(clientId, selected);
      updateClientData({ funnelTemplate: selected, funnel });
      goNext();
    } catch (err) {
      setError('שגיאה בשמירת המשפך. נסה שוב.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ob-card">
      <div className="ob-card__icon">📌</div>
      <h2 className="ob-card__title">איך נראה תהליך המכירה שלך?</h2>
      <p className="ob-card__subtitle">בחר את התבנית שמתאימה לך ביותר</p>

      <div className="ob-templates">
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            className={`ob-template ${selected === t.id ? 'ob-template--selected' : ''}`}
            onClick={() => setSelected(t.id)}
          >
            <div className="ob-template__check">
              <CheckIcon />
            </div>
            <div className="ob-template__icon">{t.icon}</div>
            <div className="ob-template__name">{t.name}</div>
            <div className="ob-template__stages">{t.desc}</div>
          </div>
        ))}
      </div>

      {error && <p style={{ color: '#d9534f', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}

      <div className="ob-nav">
        <button className="ob-btn ob-btn--back" onClick={goBack}>→ חזור</button>
        <button className="ob-btn ob-btn--primary" onClick={handleSubmit} disabled={!selected || saving}>
          {saving ? <span className="ob-spinner" /> : 'המשך ←'}
        </button>
      </div>
    </div>
  );
}
