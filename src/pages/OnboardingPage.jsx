import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1Company from './onboarding/Step1Company';
import Step2FocusAreas from './onboarding/Step2FocusAreas';
import Step3FunnelTemplate from './onboarding/Step3FunnelTemplate';
import Step4Contact from './onboarding/Step4Contact';
import './OnboardingPage.css';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [clientId, setClientId] = useState(null);
  const [clientData, setClientData] = useState({});

  useEffect(() => {
    const stored = sessionStorage.getItem('onboarding_client_id');
    if (stored) {
      setClientId(stored);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const goNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    sessionStorage.removeItem('onboarding_client_id');
    navigate('/dashboard');
  };

  const updateClientData = (data) => {
    setClientData((prev) => ({ ...prev, ...data }));
  };

  if (!clientId) return null;

  const stepProps = { clientId, clientData, updateClientData, goNext, goBack };
  const totalSteps = 4;

  return (
    <div className="onboarding">
      <div className="onboarding__header">
        <h2 className="onboarding__logo">מוקד בסקייל</h2>
      </div>

      <div className="ob-dots">
        {Array.from({ length: totalSteps }, (_, index) => {
          const dotStep = index + 1;
          const className = dotStep === step
            ? 'ob-dot ob-dot--active'
            : dotStep < step
              ? 'ob-dot ob-dot--done'
              : 'ob-dot';
          return <div key={dotStep} className={className} />;
        })}
      </div>

      <div className="onboarding__content">
        {step === 1 && <Step1Company {...stepProps} />}
        {step === 2 && <Step2FocusAreas {...stepProps} />}
        {step === 3 && <Step3FunnelTemplate {...stepProps} />}
        {step === 4 && <Step4Contact {...stepProps} onComplete={handleComplete} />}
      </div>
    </div>
  );
}
