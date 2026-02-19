import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './AccountCreationTransition.css';

/**
 * Reusable premium transition screen.
 * State machine: "loading" →(1.8s)→ "success" →(1.1s)→ redirect
 */
export default function AccountCreationTransition({ redirectTo = '/onboarding/business' }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('loading');

  useEffect(() => {
    // loading → success after 1.8s
    const t1 = setTimeout(() => setPhase('success'), 1800);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (phase !== 'success') return;
    // success visible for 1.1s, then redirect
    const t2 = setTimeout(() => navigate(redirectTo, { replace: true }), 1100);
    return () => clearTimeout(t2);
  }, [phase, navigate, redirectTo]);

  return (
    <div className="act">
      <div className="act__content">
        <div className="act__icon-wrap">
          <AnimatePresence mode="wait">
            {phase === 'loading' ? (
              <motion.div
                key="spinner"
                className="act__spinner-wrap"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <svg className="act__spinner" viewBox="0 0 50 50">
                  <circle className="act__spinner-track" cx="25" cy="25" r="20" />
                  <circle className="act__spinner-arc" cx="25" cy="25" r="20" />
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key="check"
                className="act__check-wrap"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <svg className="act__check" viewBox="0 0 50 50">
                  <circle className="act__check-circle" cx="25" cy="25" r="20" />
                  <path className="act__check-mark" d="M15 26l7 7 13-13" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.p
          className="act__text"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
        >
          מכין לך את החשבון
        </motion.p>
      </div>
    </div>
  );
}
