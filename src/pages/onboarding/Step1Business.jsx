import { useState, useEffect } from 'react';

const INDUSTRIES = [
  'טכנולוגיה',
  'פיננסים וביטוח',
  'נדל"ן',
  'קמעונאות',
  'בריאות',
  'חינוך',
  'שירותים עסקיים',
  'תעשייה',
  'מדיה ופרסום',
  'אחר',
];

export default function Step1Business({ data, onChange, goNext }) {
  const [businessName, setBusinessName] = useState(data.businessName || '');
  const [industry, setIndustry] = useState(data.industry || '');
  const [country, setCountry] = useState(data.country || 'ישראל');
  const [timezone, setTimezone] = useState(data.timezone || '');

  // Detect browser timezone on mount
  useEffect(() => {
    if (!data.timezone) {
      try {
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      } catch {
        setTimezone('Asia/Jerusalem');
      }
    }
  }, [data.timezone]);

  const isValid = businessName.trim() && industry;

  const handleNext = () => {
    if (!isValid) return;
    onChange({ businessName: businessName.trim(), industry, country, timezone });
    goNext();
  };

  return (
    <div className="ob-card ob-step-enter">
      <div className="ob-card__icon">🏢</div>
      <h2 className="ob-card__title">ספר לנו על העסק שלך</h2>
      <p className="ob-card__subtitle">נתאים את Clario במיוחד עבורך</p>

      <div className="ob-field">
        <label className="ob-label">שם העסק</label>
        <input
          className="ob-input"
          type="text"
          placeholder="לדוגמה: חברת ABC"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />
      </div>

      <div className="ob-field">
        <label className="ob-label">תחום פעילות</label>
        <select
          className="ob-select"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        >
          <option value="">בחר תחום</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      <div className="ob-form-row">
        <div className="ob-field">
          <label className="ob-label">מדינה</label>
          <input
            className="ob-input"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>
        <div className="ob-field">
          <label className="ob-label">אזור זמן</label>
          <input
            className="ob-input"
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            dir="ltr"
          />
        </div>
      </div>

      <div className="ob-nav">
        <div />
        <button className="ob-btn ob-btn--primary" onClick={handleNext} disabled={!isValid}>
          המשך ←
        </button>
      </div>
    </div>
  );
}
