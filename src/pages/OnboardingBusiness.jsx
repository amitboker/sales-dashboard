import { useState } from 'react';
import { useAuth } from '../lib/auth';
import OnboardingLayout from '../components/OnboardingLayout';
import AccountCreationTransition from '../components/AccountCreationTransition';

const BUSINESS_TYPES = [
  { value: 'agency', label: 'סוכנות' },
  { value: 'consulting', label: 'ייעוץ' },
  { value: 'financial', label: 'שירותים פיננסיים' },
  { value: 'insurance', label: 'ביטוח' },
  { value: 'saas', label: 'SaaS' },
  { value: 'other', label: 'אחר' },
];

const TEAM_SIZES = [
  { value: '1', label: '1' },
  { value: '2-5', label: '2–5' },
  { value: '6-10', label: '6–10' },
  { value: '10+', label: '10+' },
];

const CHANNELS = [
  { value: 'inbound', label: 'אינבאונד' },
  { value: 'outbound', label: 'אאוטבאונד' },
  { value: 'mixed', label: 'שילוב' },
];

export default function OnboardingBusiness() {
  const { updateUserMeta, completeOnboarding } = useAuth();
  const [businessType, setBusinessType] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [channel, setChannel] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isValid = businessType && teamSize && channel;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    const data = {
      business_type: businessType,
      sales_reps: teamSize,
      marketing_channel: channel,
      onboarding_completed: true,
    };

    try {
      // Save business info + mark onboarding complete in user_metadata
      await updateUserMeta(data);
      console.log('[NAV] onboarding/business: saved metadata →', data);

      // Also update profiles table (fire-and-forget)
      completeOnboarding(data).catch((err) =>
        console.warn('[onboarding/business] completeOnboarding failed:', err?.message)
      );
    } catch (err) {
      console.warn('[onboarding/business] metadata update failed, continuing:', err?.message);
    }

    setSubmitted(true);
  };

  if (submitted) {
    return <AccountCreationTransition redirectTo="/dashboard" />;
  }

  return (
    <OnboardingLayout title="ספר לנו קצת על העסק שלך">
      <form className="su__form" onSubmit={handleSubmit}>
        {/* Business Type */}
        <div className="su__input-wrap">
          <label className="su__label">סוג העסק</label>
          <select
            className={`su__select${!businessType ? ' su__select--empty' : ''}`}
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            required
          >
            <option value="" disabled>בחר סוג עסק</option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Team Size */}
        <div className="su__input-wrap">
          <label className="su__label">מספר אנשי מכירות</label>
          <select
            className={`su__select${!teamSize ? ' su__select--empty' : ''}`}
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            required
          >
            <option value="" disabled>בחר מספר</option>
            {TEAM_SIZES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Marketing Channel */}
        <div className="su__input-wrap">
          <label className="su__label">ערוץ שיווק עיקרי</label>
          <div className="su__radio-group">
            {CHANNELS.map((c) => (
              <div className="su__radio-option" key={c.value}>
                <input
                  type="radio"
                  name="channel"
                  id={`channel-${c.value}`}
                  value={c.value}
                  checked={channel === c.value}
                  onChange={(e) => setChannel(e.target.value)}
                />
                <label className="su__radio-label" htmlFor={`channel-${c.value}`}>
                  {c.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          className="su__btn su__btn--primary"
          type="submit"
          disabled={!isValid}
        >
          המשך
        </button>
      </form>
    </OnboardingLayout>
  );
}
