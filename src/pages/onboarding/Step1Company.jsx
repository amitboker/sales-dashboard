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

const EMPLOYEE_RANGES = [
  { label: '1-10', value: 10 },
  { label: '11-25', value: 25 },
  { label: '26-50', value: 50 },
  { label: '51-100', value: 100 },
  { label: '101-200', value: 200 },
  { label: '201-500+', value: 500 },
];

const SALES_REP_RANGES = [
  { label: '1-3', value: 3 },
  { label: '4-10', value: 10 },
  { label: '11-25', value: 25 },
  { label: '26-50', value: 50 },
  { label: '51-100+', value: 100 },
];

const CheckIcon = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Step1Company({ clientId, updateClientData, goNext }) {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [employeesIndex, setEmployeesIndex] = useState(0);
  const [salesIndex, setSalesIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const employees = EMPLOYEE_RANGES[employeesIndex];
  const salesReps = SALES_REP_RANGES[salesIndex];
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
        salesReps: salesReps.value,
        industry,
        employees: employees.label,
        companyTypes: selectedTypes,
      });
      updateClientData({
        companyName,
        salesReps: salesReps.value,
        industry,
        employees: employees.label,
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
          <span className="ob-slider-label__value">{employees.label} עובדים</span>
        </div>
        <input
          type="range"
          min="0"
          max={EMPLOYEE_RANGES.length - 1}
          value={employeesIndex}
          onChange={(e) => setEmployeesIndex(Number(e.target.value))}
          className="ob-slider"
        />
      </div>

      <div className="ob-slider-group">
        <div className="ob-slider-label">
          <span className="ob-slider-label__text">כמה אנשי מכירות?</span>
          <span className="ob-slider-label__value">{salesReps.label} נציגים</span>
        </div>
        <input
          type="range"
          min="0"
          max={SALES_REP_RANGES.length - 1}
          value={salesIndex}
          onChange={(e) => setSalesIndex(Number(e.target.value))}
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
