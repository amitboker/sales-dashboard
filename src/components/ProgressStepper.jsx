import './ProgressStepper.css';

const STEPS = [
  { num: 1, label: 'פרטי חברה' },
  { num: 2, label: 'משפך מכירות' },
  { num: 3, label: 'חיבור נתונים' },
  { num: 4, label: 'אימות' },
];

export default function ProgressStepper({ currentStep }) {
  return (
    <div className="stepper">
      {STEPS.map((step, i) => {
        const isActive = currentStep === step.num;
        const isComplete = currentStep > step.num;
        const cls = isComplete ? 'stepper__step--complete' : isActive ? 'stepper__step--active' : '';

        return (
          <div className="stepper__item" key={step.num}>
            {i > 0 && (
              <div className={`stepper__line ${currentStep > step.num ? 'stepper__line--complete' : currentStep >= step.num ? 'stepper__line--active' : ''}`} />
            )}
            <div className={`stepper__step ${cls}`}>
              {isComplete ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                step.num
              )}
            </div>
            <span className={`stepper__label ${isActive || isComplete ? 'stepper__label--active' : ''}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
