import { useState } from 'react';
import { saveFocusAreas } from '../../lib/onboarding-api';

const AREAS = [
  { id: 'conversion', icon: '📈', title: 'שיפור אחוזי המרה', desc: 'להעלות המרות בכל שלב במשפך' },
  { id: 'bottlenecks', icon: '🔍', title: 'זיהוי צווארי בקבוק', desc: 'למצוא איפה מאבדים לידים' },
  { id: 'performance', icon: '📊', title: 'ניתוח ביצועים', desc: 'להבין מה עובד ומה לא' },
  { id: 'forecast', icon: '🎯', title: 'חיזוי הכנסות', desc: 'לדעת כמה נסגור החודש' },
  { id: 'team', icon: '👥', title: 'ניהול צוות', desc: 'לעקוב אחרי הנציגים' },
  { id: 'automation', icon: '🤖', title: 'אוטומציות', desc: 'לחסוך זמן בתהליכים' },
];

const CheckIcon = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Step2FocusAreas({ clientId, updateClientData, goNext, goBack }) {
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    setError('');

    try {
      await saveFocusAreas(clientId, selected);
      updateClientData({ focusAreas: selected });
      goNext();
    } catch (err) {
      setError('שגיאה בשמירת הבחירה. נסה שוב.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ob-card">
      <div className="ob-card__icon">✨</div>
      <h2 className="ob-card__title">במה נעזור לך?</h2>
      <p className="ob-card__subtitle">בחר את התחומים הכי חשובים עבורך (ניתן לבחור כמה)</p>

      <div className="ob-grid">
        {AREAS.map((area) => {
          const isSelected = selected.includes(area.id);
          return (
            <div
              key={area.id}
              className={`ob-focus-card ${isSelected ? 'ob-focus-card--selected' : ''}`}
              onClick={() => toggle(area.id)}
            >
              <div className="ob-focus-card__check">
                <CheckIcon />
              </div>
              <div className="ob-focus-card__icon">{area.icon}</div>
              <div className="ob-focus-card__title">{area.title}</div>
              <div className="ob-focus-card__desc">{area.desc}</div>
            </div>
          );
        })}
      </div>

      {error && <p style={{ color: '#d9534f', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}

      <div className="ob-nav">
        <button className="ob-btn ob-btn--back" onClick={goBack}>→ חזור</button>
        <button className="ob-btn ob-btn--primary" onClick={handleSubmit} disabled={selected.length === 0 || saving}>
          {saving ? <span className="ob-spinner" /> : 'המשך ←'}
        </button>
      </div>
    </div>
  );
}
