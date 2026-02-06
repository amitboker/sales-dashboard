import { useState } from 'react';
import { saveCompanyDetails } from '../../lib/onboarding-api';

const COMPANY_TYPES = [
  'Tech Startup',
  'חברת ביטוח',
  'מוקד שירות',
  'חברת פיננסים',
  'קמעונאות',
  'נדל"ן',
  'שירותים עסקיים',
  'אחר',
];

const CheckIcon = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Step1Company({ clientId, updateClientData, goNext }) {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [employeesCount, setEmployeesCount] = useState(1);
  const [salesCount, setSalesCount] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const isValid = selectedTypes.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSaving(true);
    setError('');

    try {
      const companyName = 'חברה חדשה';
      const industry = selectedTypes.join(', ');
      const data = await saveCompanyDetails(clientId, {
        companyName,
        salesReps: salesCount,
        industry,
        employees: employeesCount,
        companyTypes: selectedTypes,
      });
      updateClientData({
        companyName,
        salesReps: salesCount,
        industry,
        employees: employeesCount,
        companyTypes: selectedTypes,
      });
      goNext();
    } catch (err) {
      setError('שגיאה בשמירת הנתונים. נסה שוב.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ob-card">
      <div className="ob-card__icon">🏢</div>
      <h2 className="ob-card__title">ספר לנו על החברה שלך</h2>
      <p className="ob-card__subtitle">נתאים את המערכת במיוחד עבורך</p>

      <div className="ob-slider-group">
        <div className="ob-slider-label">
          <span className="ob-slider-label__text">סוג החברה</span>
        </div>
        <div className="ob-pills">
          {COMPANY_TYPES.map((type) => {
            const selected = selectedTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                className={`ob-pill ${selected ? 'ob-pill--selected' : ''}`}
                onClick={() => toggleType(type)}
              >
                {selected && (
                  <span className="ob-pill__check">
                    <CheckIcon />
                  </span>
                )}
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div className="ob-slider-group">
        <div className="ob-slider-label">
          <span className="ob-slider-label__text">כמה עובדים בחברה?</span>
          <span className="ob-slider-label__value">{employeesCount} עובדים</span>
        </div>
        <input
          type="range"
          min="1"
          max="200"
          step="1"
          value={employeesCount}
          onChange={(e) => setEmployeesCount(Number(e.target.value))}
          className="ob-slider"
        />
      </div>

      <div className="ob-slider-group">
        <div className="ob-slider-label">
          <span className="ob-slider-label__text">כמה אנשי מכירות?</span>
          <span className="ob-slider-label__value">{salesCount} נציגים</span>
        </div>
        <input
          type="range"
          min="1"
          max="200"
          step="1"
          value={salesCount}
          onChange={(e) => setSalesCount(Number(e.target.value))}
          className="ob-slider"
        />
      </div>

      {error && <p style={{ color: '#d9534f', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}

      <div className="ob-nav">
        <div />
        <button className="ob-btn ob-btn--primary" onClick={handleSubmit} disabled={!isValid || saving}>
          {saving ? <span className="ob-spinner" /> : 'המשך ←'}
        </button>
      </div>
    </div>
  );
}
