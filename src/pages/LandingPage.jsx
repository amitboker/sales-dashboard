import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LandingPage.css';

const testimonials = [
  {
    name: 'שרה כהן',
    handle: '@sarahdigital',
    text: 'פלטפורמה מדהימה! חווית המשתמש חלקה והתכונות בדיוק מה שצריך.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    name: 'מרקוס ג׳ונסון',
    handle: '@marcustech',
    text: 'השירות הזה שינה את איך שאני עובד. עיצוב נקי, תכונות חזקות ותמיכה מעולה.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
  },
  {
    name: 'דוד מרטינז',
    handle: '@davidcreates',
    text: 'ניסיתי פלטפורמות רבות, אבל זו בולטת. אינטואיטיבית, אמינה ומועילה באמת.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="landing__glow" />

      {/* Hero */}
      <motion.section
        className="landing__hero"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        <motion.div className="landing__badge" variants={fadeUp} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
          <span className="landing__badge-text">RevOps למוקדי מכירות — בצורה ברורה</span>
          <span className="landing__badge-new">חדש</span>
        </motion.div>

        <motion.h1 className="landing__title" variants={fadeUp} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}>
          ביצועי מוקד המכירות, בזמן אמת
        </motion.h1>
        <motion.h2 className="landing__subtitle" variants={fadeUp} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}>
          כל הלידים, היעדים והמשפך במקום אחד
        </motion.h2>

        <motion.p className="landing__description" variants={fadeUp} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
          אם קשה להבין מה עובד ומה לא — אנחנו מפשטים את התמונה. דשבורד אחד שנותן
          מיקוד יומי, סדר עדיפויות והחלטות מהירות לצוות המכירות שלך.
        </motion.p>

        <motion.div className="landing__ctas" variants={fadeUp} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
          <motion.button
            className="landing__cta-primary"
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(218,253,104,0.15)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <span>כניסה לדמו</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </motion.button>
        </motion.div>
        <motion.div className="landing__hero-note" variants={fadeUp} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
          כולל נתוני דמו להתרשמות מיידית
        </motion.div>
      </motion.section>

      {/* Value Props */}
      <section className="landing__section">
        <motion.h3
          className="landing__section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          מה תדעו בכל רגע
        </motion.h3>
        <div className="landing__features">
          {[
            {
              title: 'תמונה אחת של הביצועים',
              text: 'הכנסות, יעדים ואחוזי המרה — בלי לקפוץ בין קבצים.',
              icon: '📊',
            },
            {
              title: 'איפה נופלים לידים',
              text: 'זיהוי צווארי בקבוק כדי לטפל במה שבאמת חוסם תוצאות.',
              icon: '🔍',
            },
            {
              title: 'מה הצעד הבא היום',
              text: 'מיקוד לצוות על פעולות שמזיזות את המדדים קדימה.',
              icon: '🎯',
            },
          ].map((item) => (
            <div className="landing__feature-card" key={item.title}>
              <div className="landing__feature-icon">{item.icon}</div>
              <div className="landing__feature-title">{item.title}</div>
              <p className="landing__feature-text">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="landing__section landing__section--compact">
        <motion.h3
          className="landing__section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          איך זה עובד
        </motion.h3>
        <div className="landing__steps">
          <div className="landing__step">
            <span className="landing__step-number">1</span>
            <div>
              <div className="landing__step-title">מחברים נתונים</div>
              <p className="landing__step-text">העלאה או חיבור מקור נתונים — פשוט ומהיר.</p>
            </div>
          </div>
          <div className="landing__step">
            <span className="landing__step-number">2</span>
            <div>
              <div className="landing__step-title">מגדירים משפך</div>
              <p className="landing__step-text">הגדרה קצרה של שלבים ומטרות.</p>
            </div>
          </div>
          <div className="landing__step">
            <span className="landing__step-number">3</span>
            <div>
              <div className="landing__step-title">מקבלים תובנות</div>
              <p className="landing__step-text">דשבורד ברור שממקד את היום‑יום של הצוות.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fit */}
      <section className="landing__section landing__section--compact">
        <motion.h3
          className="landing__section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          למי זה מתאים (ולמי לא)
        </motion.h3>
        <div className="landing__fit-grid">
          <div className="landing__fit-card">
            <div className="landing__fit-title">מתאים ל־</div>
            <ul className="landing__fit-list">
              <li>מוקדי מכירות שרוצים שליטה יומית על המשפך.</li>
              <li>מנהלי צוותים שצריכים תמונה מהירה וברורה.</li>
              <li>צוותים שמחפשים סדר עדיפויות לפי נתונים.</li>
            </ul>
          </div>
          <div className="landing__fit-card landing__fit-card--muted">
            <div className="landing__fit-title">לא מתאים ל־</div>
            <ul className="landing__fit-list">
              <li>מי שמחפש כלי כללי בלי תהליך מכירה ברור.</li>
              <li>צוותים שלא עובדים עם יעדים או משפך.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing__testimonials" id="testimonials">
        <motion.h3
          className="landing__section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          מה הלקוחות שלנו אומרים
        </motion.h3>
        <div className="landing__testimonials-grid">
          {testimonials.map((t, i) => (
            <motion.div
              className="landing__card"
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
              whileHover={{ y: -4 }}
            >
              <img className="landing__card-avatar" src={t.avatar} alt={t.name} />
              <h4 className="landing__card-name">{t.name}</h4>
              <span className="landing__card-handle">{t.handle}</span>
              <p className="landing__card-text">{t.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing__cta-band">
        <div className="landing__cta-content">
          <div className="landing__cta-title">רוצים לראות את זה עובד אצלכם?</div>
          <p className="landing__cta-text">דמו קצר שמראה בדיוק איך זה נראה על הנתונים שלכם.</p>
        </div>
        <button className="landing__cta-primary landing__cta-primary--solid" onClick={() => navigate('/login')}>
          כניסה לדמו
        </button>
      </section>

      {/* Footer */}
      <motion.footer
        className="landing__footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="landing__footer-inner">
          <span className="landing__footer-brand">מוקד בסקייל</span>
          <span className="landing__footer-links">
            <a href="mailto:contact@mokedbescale.com">צור קשר</a>
            <span className="landing__footer-sep">|</span>
            <button className="landing__footer-demo" onClick={() => navigate('/login')}>
              בקש דמו
            </button>
          </span>
          <span className="landing__footer-copy">&copy; 2026 כל הזכויות שמורות</span>
        </div>
      </motion.footer>
    </div>
  );
}

export default LandingPage;
