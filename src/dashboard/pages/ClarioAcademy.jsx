import { useState, useMemo, useCallback, useRef } from "react";
import CourseCard from "../components/CourseCard.jsx";
import { academyCourses, categories, sidebarNav } from "../data/academyData.js";

/* ── Sidebar icons ── */
const SideIcon = ({ type }) => {
  const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (type) {
    case "grid":    return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
    case "star":    return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    case "clock":   return <svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case "trending": return <svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
    default: return null;
  }
};

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
    // In RTL, scrollLeft is negative in some browsers, positive in others.
    // We use el.scrollBy which handles direction correctly.
    const cardWidth = el.querySelector(".ac-card")?.offsetWidth || 300;
    const amount = cardWidth + 18; // card + gap
    el.scrollBy({ left: direction === "forward" ? -amount : amount, behavior: "smooth" });
  }, []);

  return (
    <div className="ac-carousel-wrap">
      <div className="ac-carousel-header">
        {label && <span className="ac-carousel-label">{label}</span>}
        <div className="ac-carousel-arrows">
          <button type="button" className="ac-arrow" onClick={() => scroll("forward")} aria-label="הבא">
            <ChevronLeft />
          </button>
          <button type="button" className="ac-arrow" onClick={() => scroll("back")} aria-label="הקודם">
            <ChevronRight />
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
  const [activeSection, setActiveSection] = useState("all");
  const [activeCategory, setActiveCategory] = useState("הכל");
  const [search, setSearch] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const displayCourses = useMemo(() => {
    let courses = academyCourses;
    if (activeSection === "featured") courses = courses.filter((c) => c.featured);
    if (activeSection === "new") courses = courses.slice(-3).reverse();
    if (activeSection === "revenue") courses = courses.filter((c) => c.category === "סגירה" || c.category === "תמחור");

    if (activeCategory !== "הכל") courses = courses.filter((c) => c.category === activeCategory);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      courses = courses.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return courses;
  }, [activeSection, activeCategory, search]);

  const featuredCourses = useMemo(() => academyCourses.filter((c) => c.featured), []);
  const totalLessons = academyCourses.reduce((s, c) => s + c.lessons, 0);

  const handleSectionChange = useCallback((id) => {
    setActiveSection(id);
    setActiveCategory("הכל");
    setSearch("");
  }, []);

  /* ── Filter panel (shared desktop / mobile) ── */
  const filterPanel = (
    <div className="ac-filters">
      <div className="ac-search-wrap">
        <svg className="ac-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" className="ac-search" placeholder="חיפוש קורסים..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="ac-nav-section">
        <span className="ac-nav-label">ניווט</span>
        {sidebarNav.map((item) => (
          <button key={item.id} type="button" className={`ac-nav-item${activeSection === item.id ? " active" : ""}`} onClick={() => handleSectionChange(item.id)}>
            <SideIcon type={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="ac-nav-section">
        <span className="ac-nav-label">קטגוריות</span>
        {categories.map((cat) => (
          <button key={cat} type="button" className={`ac-nav-item${activeCategory === cat ? " active" : ""}`} onClick={() => setActiveCategory(cat)}>
            <span>{cat}</span>
            {cat !== "הכל" && (
              <span className="ac-nav-count">{academyCourses.filter((c) => c.category === cat).length}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

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

      {/* Mobile filter toggle */}
      <button type="button" className="ac-mobile-filter-btn" onClick={() => setMobileFiltersOpen((v) => !v)}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        סינון
      </button>

      {/* Mobile drawer */}
      {mobileFiltersOpen && (
        <>
          <div className="ac-drawer-overlay" onClick={() => setMobileFiltersOpen(false)} />
          <div className="ac-drawer">
            <div className="ac-drawer-head">
              <span>סינון קורסים</span>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} className="ac-drawer-close">&times;</button>
            </div>
            {filterPanel}
          </div>
        </>
      )}

      {/* ── Body ── */}
      <div className="ac-layout">
        <aside className="ac-sidebar">{filterPanel}</aside>

        <main className="ac-main">
          {/* Featured carousel */}
          {activeSection === "all" && activeCategory === "הכל" && !search.trim() && (
            <Carousel label="מומלצים">
              {featuredCourses.map((c) => <CourseCard key={c.id} course={c} />)}
            </Carousel>
          )}

          {/* All courses carousel */}
          <Carousel label={
            `${displayCourses.length} קורסים` +
            (activeCategory !== "הכל" ? ` ב${activeCategory}` : "") +
            (activeSection === "featured" ? " — מומלצים" : "") +
            (activeSection === "new" ? " — נוספו לאחרונה" : "") +
            (activeSection === "revenue" ? " — חשובים להכנסות" : "")
          }>
            {displayCourses.map((c) => <CourseCard key={c.id} course={c} />)}
          </Carousel>

          {displayCourses.length === 0 && (
            <div className="ac-empty">
              <span className="ac-empty-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <span>לא נמצאו קורסים מתאימים</span>
              <button type="button" className="ac-empty-reset" onClick={() => { setSearch(""); setActiveCategory("הכל"); setActiveSection("all"); }}>אפס סינון</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
