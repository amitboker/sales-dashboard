/**
 * DottedBackground — premium dotted/particle-style background layer.
 *
 * Pure CSS radial-gradient approach: zero JS overhead, GPU-composited,
 * no repaints on scroll/resize. Respects prefers-reduced-motion.
 *
 * Props (all optional — sensible defaults):
 *   dotSize     – radius of each dot in px          (default: 1)
 *   spacing     – grid cell size in px               (default: 22)
 *   dotColor    – CSS color for dots                 (default: rgba(0,0,0,0.10))
 *   vignette    – show soft edge vignette            (default: true)
 *   className   – extra classes on the wrapper
 *   style       – extra inline styles on the wrapper
 */
export default function DottedBackground({
  dotSize = 1,
  spacing = 22,
  dotColor = "rgba(0,0,0,0.10)",
  vignette = true,
  className = "",
  style = {},
}) {
  return (
    <div
      className={`dotted-bg-wrapper ${className}`}
      style={style}
      aria-hidden="true"
    >
      {/* Dot grid layer */}
      <div
        className="dotted-bg-dots"
        style={{
          backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${spacing}px ${spacing}px`,
        }}
      />
      {/* Soft vignette overlay for depth */}
      {vignette && <div className="dotted-bg-vignette" />}
    </div>
  );
}
