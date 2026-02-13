import { useState, useMemo, useCallback, useRef } from "react";
import CourseCard from "../components/CourseCard.jsx";
import { academyCourses, categories } from "../data/academyData.js";

/* ── Chevron arrows ── */
const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
);
const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
);

/* ── Carousel wrapper ── */
function Carousel({ children, label }) {
  const scrollRef = useRef(null);

  const scroll = useCallback((direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(".ac-card")?.offsetWidth || 300;
    const amount = cardWidth + 16;
    el.scrollBy({ left: direction === "forward" ? -amount : amount, behavior: "smooth" });
  }, []);

  return (
    <div className="ac-carousel-wrap">
      <div className="ac-carousel-header">
        {label && <span className="ac-carousel-label">{label}</span>}
        <div className="ac-carousel-arrows">
          <button type="button" className="ac-arrow" onClick={() => scroll("back")} aria-label="הקודם">
            <ChevronRight />
          </button>
          <button type="button" className="ac-arrow" onClick={() => scroll("forward")} aria-label="הבא">
            <ChevronLeft />
          </button>
        </div>
      </div>
      <div className="ac-carousel" ref={scrollRef}>
        {children}
      </div>
    </div>
  );
}

export default function ClarioAcademy() {
  const [activeCategory, setActiveCategory] = useState("הכל");

  const displayCourses = useMemo(() => {
    if (activeCategory === "הכל") return academyCourses;
    return academyCourses.filter((c) => c.category === activeCategory);
  }, [activeCategory]);

  const featuredCourses = useMemo(() => academyCourses.filter((c) => c.featured), []);
  const totalLessons = academyCourses.reduce((s, c) => s + c.lessons, 0);

  return (
    <div className="ac-page">
      {/* ── Header ── */}
      <header className="ac-header">
        <div className="ac-header-text">
          <h1 className="ac-title">Clario Academy</h1>
          <p className="ac-subtitle">Best practices לשיפור אחוזי המרה וביצועי הכנסות</p>
        </div>
        <div className="ac-header-stats">
          <div className="ac-hstat"><span className="ac-hstat-val">{academyCourses.length}</span><span className="ac-hstat-lbl">קורסים</span></div>
          <div className="ac-hstat"><span className="ac-hstat-val">{totalLessons}</span><span className="ac-hstat-lbl">שיעורים</span></div>
          <div className="ac-hstat"><span className="ac-hstat-val">{categories.length - 1}</span><span className="ac-hstat-lbl">קטגוריות</span></div>
        </div>
      </header>

      {/* ── Category pills ── */}
      <div className="ac-categories">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`ac-cat-pill${activeCategory === cat ? " active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
            {cat !== "הכל" && (
              <span className="ac-cat-count">
                {academyCourses.filter((c) => c.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="ac-content">
        {/* Featured carousel */}
        {activeCategory === "הכל" && (
          <Carousel label="מומלצים">
            {featuredCourses.map((c) => <CourseCard key={c.id} course={c} />)}
          </Carousel>
        )}

        {/* All courses carousel */}
        <Carousel label={
          activeCategory !== "הכל"
            ? `${displayCourses.length} קורסים ב${activeCategory}`
            : "כל הקורסים"
        }>
          {displayCourses.map((c) => <CourseCard key={c.id} course={c} />)}
        </Carousel>

        {displayCourses.length === 0 && (
          <div className="ac-empty">
            <span className="ac-empty-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <span>לא נמצאו קורסים מתאימים</span>
            <button type="button" className="ac-empty-reset" onClick={() => setActiveCategory("הכל")}>
              הצג את כל הקורסים
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
