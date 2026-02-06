import { motion, AnimatePresence } from 'framer-motion';
import './LoadingOverlay.css';

function LoadingOverlay({ isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className="loading-overlay__content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <div className="loading-overlay__spinner" />
            <p className="loading-overlay__text">...מכין את הדאשבורד שלך</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoadingOverlay;
