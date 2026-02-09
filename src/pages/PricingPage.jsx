import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './PricingPage.css';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'גישה בסיסית לנתוני מכירות ודוחות ביצועים.',
    monthly: { price: 'חינם', period: '' },
    yearly: { price: 'חינם', period: '' },
    features: [
      'דאשבורד ביצועים בסיסי',
      'עד 3 משתמשים',
      'נתוני מכירות בזמן אמת',
      'דוחות שבועיים אוטומטיים',
      'תמיכה בדוא"ל',
    ],
    cta: 'התחל בחינם',
    recommended: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'לצוותי מכירות שרוצים שליטה מלאה בנתונים ותובנות מתקדמות.',
    monthly: { price: '₪199', period: '/חודש' },
    yearly: { price: '₪179', period: '/חודש' },
    features: [
      'כל מה שיש ב-Starter',
      'גרפים וייצוא נתונים',
      'ניתוח ביצועי צוות',
      'ניתוח משפכי מכירה',
      'ריענון נתונים בעדיפות גבוהה',
      'עוזר AI ללא הגבלה',
      'Projection Builder',
    ],
    cta: 'שדרג ל-Pro',
    recommended: true,
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'פתרון מותאם לארגונים עם צרכים מורכבים.',
    monthly: { price: 'נדבר', period: '' },
    yearly: { price: 'נדבר', period: '' },
    features: [
      'כל מה שיש ב-Pro',
      'מדדים ודשבורדים מותאמים אישית',
      'דוחות ייעודיים לפי צורך',
      'קונפיגורציות מתקדמות',
      'תמיכה בעדיפות גבוהה',
    ],
    cta: 'קבע שיחה',
    recommended: false,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function PricingPage() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');

  return (
    <div className="pricing">
      <div className="pricing__gradient" />

      <header className="pricing__header">
        <button
          className="pricing__back"
          onClick={() => navigate('/dashboard')}
          type="button"
        >
          ← חזרה לדאשבורד
        </button>
      </header>

      <motion.section
        className="pricing__hero"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        <motion.div
          className="pricing__social-proof"
          variants={fadeUp}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="pricing__avatars">
            {['Noa', 'Yossi', 'Liat', 'Omer', 'Dana'].map((seed) => (
              <img
                key={seed}
                className="pricing__avatar"
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                alt=""
              />
            ))}
          </div>
          <span className="pricing__social-divider" />
          <span className="pricing__social-text">מצטרפים לעשרות צוותים מרוצים</span>
          <span className="pricing__social-chevron">›</span>
        </motion.div>

        <motion.h1
          className="pricing__title"
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          בחר את התוכנית שמתאימה לרמת השליטה שאתה רוצה
        </motion.h1>
        <motion.p
          className="pricing__subtitle"
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          גישה מתקדמת לנתונים, תובנות חכמות ודוחות שעוזרים לקבל החלטות
        </motion.p>

        <motion.div
          className="pricing__toggle"
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <button
            className={`pricing__toggle-btn${billing === 'monthly' ? ' pricing__toggle-btn--active' : ''}`}
            onClick={() => setBilling('monthly')}
            type="button"
          >
            חודשי
          </button>
          <button
            className={`pricing__toggle-btn${billing === 'yearly' ? ' pricing__toggle-btn--active' : ''}`}
            onClick={() => setBilling('yearly')}
            type="button"
          >
            שנתי (חסוך 10%)
          </button>
        </motion.div>
      </motion.section>

      <motion.div
        className="pricing__grid"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            className={`pricing__card${plan.recommended ? ' pricing__card--recommended' : ''}`}
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            {plan.recommended && (
              <span className="pricing__recommended-tag">הבחירה המומלצת</span>
            )}
            <span className={`pricing__plan-badge pricing__plan-badge--${plan.id}`}>
              {plan.name}
            </span>
            <p className="pricing__plan-desc">{plan.description}</p>
            <div className="pricing__price">
              <span key={billing} className="pricing__price-value">
                {plan[billing].price}
              </span>
              {plan[billing].period && (
                <span className="pricing__price-period">{plan[billing].period}</span>
              )}
            </div>
            <hr className="pricing__divider" />
            <ul className="pricing__features">
              {plan.features.map((feat, i) => (
                <li key={i} className="pricing__feature">
                  <span className="pricing__check">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <button
              className={`pricing__cta${plan.recommended ? ' pricing__cta--primary' : ''}${plan.id === 'custom' ? ' pricing__cta--dark' : ''}`}
              type="button"
            >
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
