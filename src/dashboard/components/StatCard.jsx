import { AnimatePresence, motion } from "framer-motion";
import Icon from "./Icon.jsx";

const iconToSvg = {
  dollar: "dollar",
  briefcase: "package",
  chart: "bar-chart",
  clock: "clock",
};

export default function StatCard({ icon, label, value, delta, deltaDirection, deltaLabel, animateKey }) {
  const svgName = iconToSvg[icon];

  return (
    <div className="card stat-card">
      <div className="stat-icon">
        {svgName ? (
          <Icon name={svgName} size={20} style={{ filter: "sepia(1) saturate(3) hue-rotate(90deg) brightness(0.7)" }} />
        ) : (
          icon
        )}
      </div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={animateKey || value}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ display: "inline-block" }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>
        {delta && (
          <div className="stat-delta">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`${animateKey || value}-delta`}
                className={deltaDirection || ""}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                <Icon
                  name={deltaDirection === "up" ? "trending-up" : "trending-down"}
                  size={14}
                  style={{
                    filter: deltaDirection === "up"
                      ? "sepia(1) saturate(5) hue-rotate(90deg) brightness(0.6)"
                      : "sepia(1) saturate(5) hue-rotate(0deg) brightness(0.7)",
                    marginLeft: 4,
                  }}
                />
                {" "}{delta}
              </motion.span>
            </AnimatePresence>
            {deltaLabel && <span> {deltaLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
