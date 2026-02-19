import clarioSymbol from '../assets/icons/clario symbol.png';
import '../pages/SignUpPage.css';

/**
 * Shared layout wrapper for all onboarding steps.
 * Renders the dot-grid background, centered card, logo, and title.
 */
export default function OnboardingLayout({ title, subtitle, children }) {
  return (
    <div className="su">
      <div className="su__card">
        <div className="su__header">
          <img src={clarioSymbol} alt="Clario" className="su__logo" />
          <h1 className="su__title">{title}</h1>
          {subtitle && <p className="su__subtitle">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
