import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const easing = [0.25, 0.1, 0.25, 1.0];

const variants = {
  enter: { opacity: 1, y: 0, transition: { duration: 0.25, ease: easing } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15, ease: easing } },
};

const reducedVariants = {
  enter: { opacity: 1, y: 0, transition: { duration: 0.15, ease: easing } },
  exit: { opacity: 0, y: 0, transition: { duration: 0.1, ease: easing } },
};

export default function DashboardPageWrapper({ routeKey, children, onExitComplete }) {
  const prefersReduced = useReducedMotion();
  const v = prefersReduced ? reducedVariants : variants;

  return (
    <AnimatePresence mode="wait" onExitComplete={onExitComplete}>
      <motion.div
        key={routeKey}
        className="dashboard-page-wrapper"
        initial={{ opacity: 0, y: prefersReduced ? 0 : 8 }}
        animate={v.enter}
        exit={v.exit}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
