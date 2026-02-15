import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

export default function DashboardPageWrapper({ routeKey, children }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Reset both window and .content scroll — window is the actual scroller
    // since .content has no fixed height and grows with content
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const container = document.querySelector(".content");
    if (container) container.scrollTop = 0;
  }, [routeKey]);

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" };
  const initial = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 };
  const animate = { opacity: 1, y: 0, transition };
  const exit = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -6, transition };

  return (
    <div className="dashboard-page-wrapper">
      <AnimatePresence mode="wait">
        <motion.div key={routeKey} initial={initial} animate={animate} exit={exit}>
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
