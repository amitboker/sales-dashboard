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
          <span className="landing__badge-text">RevOps Intelligence פורמל ללקוחות</span>
          <span className="landing__badge-new">חדש</span>
        </motion.div>

        <motion.h1 className="landing__title" variants={fadeUp} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}>
          מוקד בסקייל
        </motion.h1>
        <motion.h2 className="landing__subtitle" variants={fadeUp} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}>
          חממה טכנולוגית למוקדנים חכמים
        </motion.h2>

        <motion.p className="landing__description" variants={fadeUp} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
          פלטפורמת RevOps Intelligence מתקדמת לניהול וניתוח ביצועי מכירות. קבל תובנות
          מבוססות נתונים בזמן אמת להצלחות העסק שלך.
        </motion.p>

        <motion.div className="landing__ctas" variants={fadeUp} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
          <motion.button
            className="landing__cta-primary"
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(218,253,104,0.15)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <span>התחבר לדאשבורד</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </motion.button>
          <motion.button
            className="landing__cta-secondary"
            onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>למד עוד</span>
          </motion.button>
        </motion.div>
      </motion.section>

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
