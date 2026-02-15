import { useState } from 'react';

const REP_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2-5', label: '2–5' },
  { value: '6-15', label: '6–15' },
  { value: '16+', label: '16+' },
];

const CHANNEL_OPTIONS = [
  { value: 'inbound', label: 'Inbound', desc: 'לידים נכנסים' },
  { value: 'outbound', label: 'Outbound', desc: 'פנייה יזומה' },
  { value: 'both', label: 'שניהם', desc: 'שילוב ערוצים' },
];

const CheckIcon = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Step2Team({ data, onChange, goNext, goBack }) {
  const [repCount, setRepCount] = useState(data.repCount || '');
  const [hasSalesManager, setHasSalesManager] = useState(data.hasSalesManager ?? null);
  const [salesChannel, setSalesChannel] = useState(data.salesChannel || '');

  const isValid = repCount && hasSalesManager !== null && salesChannel;

  const handleNext = () => {
    if (!isValid) return;
    onChange({ repCount, hasSalesManager, salesChannel });
    goNext();
  };

  return (
    <div className="ob-card ob-step-enter">
      <div className="ob-card__icon">👥</div>
      <h2 className="ob-card__title">הצוות והמכירות שלך</h2>
      <p className="ob-card__subtitle">נבין איך צוות המכירות שלך עובד</p>

      {/* Number of reps */}
      <div className="ob-field">
        <label className="ob-label">כמה אנשי מכירות יש בצוות?</label>
        <div className="ob-pills">
          {REP_OPTIONS.map((opt) => {
            const selected = repCount === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`ob-pill ${selected ? 'ob-pill--selected' : ''}`}
                onClick={() => setRepCount(opt.value)}
              >
                {selected && (
                  <span className="ob-pill__check"><CheckIcon /></span>
                )}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sales manager */}
      <div className="ob-field">
        <label className="ob-label">יש מנהל מכירות ייעודי?</label>
        <div className="ob-pills">
          <button
            type="button"
            className={`ob-pill ${hasSalesManager === true ? 'ob-pill--selected' : ''}`}
            onClick={() => setHasSalesManager(true)}
          >
            {hasSalesManager === true && (
              <span className="ob-pill__check"><CheckIcon /></span>
            )}
            כן
          </button>
          <button
            type="button"
            className={`ob-pill ${hasSalesManager === false ? 'ob-pill--selected' : ''}`}
            onClick={() => setHasSalesManager(false)}
          >
            {hasSalesManager === false && (
              <span className="ob-pill__check"><CheckIcon /></span>
            )}
            לא
          </button>
        </div>
      </div>

      {/* Sales channel */}
      <div className="ob-field">
        <label className="ob-label">ערוץ מכירות עיקרי</label>
        <div className="ob-pills">
          {CHANNEL_OPTIONS.map((opt) => {
            const selected = salesChannel === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`ob-pill ${selected ? 'ob-pill--selected' : ''}`}
                onClick={() => setSalesChannel(opt.value)}
              >
                {selected && (
                  <span className="ob-pill__check"><CheckIcon /></span>
                )}
                {opt.label}
                <span style={{ fontSize: '0.78rem', color: '#999', marginRight: '0.2rem' }}>
                  — {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="ob-nav">
        <button className="ob-btn ob-btn--back" onClick={goBack}>→ חזור</button>
        <button className="ob-btn ob-btn--primary" onClick={handleNext} disabled={!isValid}>
          המשך ←
        </button>
      </div>
    </div>
  );
}
