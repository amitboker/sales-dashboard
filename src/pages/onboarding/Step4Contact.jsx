import { useState } from 'react';
import { saveContactDetails } from '../../lib/onboarding-api';

export default function Step4Contact({ clientId, updateClientData, goBack, onComplete }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isValid = firstName.trim() && lastName.trim() && email.trim();

  const handleSubmit = async () => {
    if (!isValid) return;
    setSaving(true);
    setError('');

    const contactDetails = {
      firstName,
      lastName,
      email,
      phone,
      message,
    };

    try {
      await saveContactDetails(clientId, contactDetails);
      updateClientData(contactDetails);
      onComplete();
    } catch (err) {
      setError('שגיאה בשמירת הנתונים. נסה שוב.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ob-card">
      <div className="ob-card__icon">📨</div>
      <h2 className="ob-card__title">פרטי קשר</h2>

      <div className="ob-form-row">
        <div className="ob-field">
          <label className="ob-label">שם פרטי</label>
          <input
            className="ob-input"
            type="text"
            placeholder="שם פרטי"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="ob-field">
          <label className="ob-label">שם משפחה</label>
          <input
            className="ob-input"
            type="text"
            placeholder="שם משפחה"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="ob-field">
        <label className="ob-label">אימייל</label>
        <input
          className="ob-input"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          dir="ltr"
        />
      </div>

      <div className="ob-field">
        <label className="ob-label">טלפון</label>
        <input
          className="ob-input"
          type="tel"
          placeholder="050-000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="ob-field">
        <label className="ob-label">הודעה</label>
        <textarea
          className="ob-textarea"
          placeholder="ספר לנו עוד..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {error && <p style={{ color: '#d9534f', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}

      <div className="ob-nav">
        <button className="ob-btn ob-btn--back" onClick={goBack}>→ חזור</button>
        <button className="ob-btn ob-btn--finish" onClick={handleSubmit} disabled={!isValid || saving}>
          {saving ? <span className="ob-spinner" /> : 'סיום! 🎉'}
        </button>
      </div>
    </div>
  );
}
