import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DottedBackground from '../components/DottedBackground';
import './PricingPage.css';

const plans = [
  {
    id: 'starter',
    name: 'סטארטר',
    description: 'מושלם לצוותים קטנים שמתחילים',
    monthly: { price: '₪199', period: '/לחודש' },
    yearly: { price: '₪139', period: '/לחודש' },
    features: [
      'עד 3 מקורות נתונים',
      '5 דשבורדים',
      'עדכון יומי',
      'תמיכה במייל',
      'משתמש אחד',
    ],
    cta: 'התחילו תקופת ניסיון חינם',
    popular: false,
  },
  {
    id: 'pro',
    name: 'פרו',
    description: 'לצוותי מכירות שרוצים לצמוח',
    monthly: { price: '₪499', period: '/לחודש' },
    yearly: { price: '₪349', period: '/לחודש' },
    features: [
      'מקורות נתונים ללא הגבלה',
      'דשבורדים ללא הגבלה',
      'סנכרון בזמן אמת',
      'תובנות AI מתקדמות',
      'עד 10 משתמשים',
      'תמיכת פרימיום',
    ],
    cta: 'התחילו תקופת ניסיון חינם',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'אנטרפרייז',
    description: 'לארגונים עם צרכים מתקדמים',
    monthly: { price: 'צרו קשר', period: '' },
    yearly: { price: 'צרו קשר', period: '' },
    features: [
      'הכל בפרו, ובנוסף:',
      'SSO ואימות מתקדם',
      'API גישה מלאה',
      'SLA מותאם אישית',
      'משתמשים ללא הגבלה',
      'מנהל הצלחת לקוח ייעודי',
    ],
    cta: 'דברו איתנו',
    popular: false,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

/* ── Price swap — vertical crossfade, both visible simultaneously ── */
function AnimatedPrice({ price }) {
  return (
    <span className="pricing__price-swap">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={price}
          className="pricing__price-value"
          initial={{ y: '40%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-40%', opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          {price}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');

  return (
    <div className="pricing">
      <DottedBackground vignette={false} />

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
          className="pricing__toggle-wrapper"
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="pricing__toggle">
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
              שנתי
            </button>
          </div>
          <span className="pricing__discount-badge">-30%</span>
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
            className={`pricing__card${plan.popular ? ' pricing__card--popular' : ''}`}
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            {plan.popular && (
              <span className="pricing__popular-tag">הכי פופולרי</span>
            )}
            <span className="pricing__plan-name">{plan.name}</span>
            <p className="pricing__plan-desc">{plan.description}</p>
            <div className="pricing__price">
              <AnimatedPrice price={plan[billing].price} />
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
              className={`pricing__cta${plan.popular ? ' pricing__cta--primary' : ''}`}
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
