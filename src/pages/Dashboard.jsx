import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Dashboard.css';

const stats = [
  { label: 'מכירות היום', value: '₪12,450', change: '+12%' },
  { label: 'לקוחות חדשים', value: '48', change: '+8%' },
  { label: 'שיחות פעילות', value: '23', change: '+15%' },
  { label: 'יעד חודשי', value: '67%', change: '+5%' },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <motion.aside
        className="dashboard__sidebar"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="dashboard__logo">מוקד בסקייל</div>
        <nav className="dashboard__nav">
          <a className="dashboard__nav-item dashboard__nav-item--active">דאשבורד</a>
          <a className="dashboard__nav-item">מכירות</a>
          <a className="dashboard__nav-item">לקוחות</a>
          <a className="dashboard__nav-item">דוחות</a>
          <a className="dashboard__nav-item">הגדרות</a>
        </nav>
        <button className="dashboard__logout" onClick={() => navigate('/')}>
          יציאה
        </button>
      </motion.aside>

      {/* Main */}
      <div className="dashboard__main">
        {/* Header */}
        <motion.header
          className="dashboard__header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <h1 className="dashboard__title">דאשבורד מכירות</h1>
          <span className="dashboard__date">פברואר 2026</span>
        </motion.header>

        {/* Stats Grid */}
        <motion.div
          className="dashboard__stats"
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.07, delayChildren: 0.1 }}
        >
          {stats.map((s, i) => (
            <motion.div
              className="dashboard__stat-card"
              key={i}
              variants={fadeUp}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
            >
              <span className="dashboard__stat-label">{s.label}</span>
              <span className="dashboard__stat-value">{s.value}</span>
              <span className="dashboard__stat-change">{s.change}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Placeholder chart area */}
        <motion.div
          className="dashboard__chart-area"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          <h3 className="dashboard__chart-title">סקירת ביצועים</h3>
          <div className="dashboard__chart-placeholder">
            <span>הגרף יופיע כאן</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
