import { useState } from 'react';
import { useAuth } from '../lib/auth';
import OnboardingLayout from '../components/OnboardingLayout';
import AccountCreationTransition from '../components/AccountCreationTransition';

export default function OnboardingName() {
  const { updateUserMeta } = useAuth();
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      // Persist full_name to user_metadata — route guards read this
      await updateUserMeta({ full_name: trimmed });
      console.log('[NAV] onboarding/name: saved full_name →', trimmed);
    } catch (err) {
      console.warn('[onboarding/name] metadata update failed, continuing:', err?.message);
    }

    setSubmitted(true);
  };

  if (submitted) {
    return <AccountCreationTransition redirectTo="/onboarding/business" />;
  }

  return (
    <OnboardingLayout title="מה השם המלא שלך?">
      <form className="su__form" onSubmit={handleSubmit}>
        <div className="su__input-wrap">
          <input
            className="su__input"
            type="text"
            placeholder="שם מלא"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            autoComplete="name"
          />
        </div>

        <button
          className="su__btn su__btn--primary"
          type="submit"
          disabled={!name.trim()}
        >
          המשך
        </button>
      </form>
    </OnboardingLayout>
  );
}
