import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Step1Business from './onboarding/Step1Business';
import Step2Team from './onboarding/Step2Team';
import Step3CRM from './onboarding/Step3CRM';
import Step4Connect from './onboarding/Step4Connect';
import Step5Summary from './onboarding/Step5Summary';
import './OnboardingPage.css';

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 — Business basics
    businessName: '',
    industry: '',
    country: 'ישראל',
    timezone: '',
    // Step 2 — Team & sales
    repCount: '',
    hasSalesManager: null,
    salesChannel: '',
    // Step 3 — CRM selection
    crm: '',
    crmOther: '',
    // Step 4 — CRM connect
    crmConnected: false,
  });

  const goNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateData = (partial) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  };

  const handleComplete = async () => {
    await completeOnboarding(formData);
    navigate('/dashboard', { replace: true });
  };

  const stepProps = { data: formData, onChange: updateData, goNext, goBack };

  return (
    <div className="onboarding">
      <div className="onboarding__header">
        <h2 className="onboarding__logo">Clario</h2>
      </div>

      {/* Progress dots */}
      <div className="ob-dots">
        {Array.from({ length: TOTAL_STEPS }, (_, index) => {
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
        {step === 1 && <Step1Business {...stepProps} />}
        {step === 2 && <Step2Team {...stepProps} />}
        {step === 3 && <Step3CRM {...stepProps} />}
        {step === 4 && <Step4Connect {...stepProps} />}
        {step === 5 && <Step5Summary data={formData} goBack={goBack} onComplete={handleComplete} />}
      </div>
    </div>
  );
}
