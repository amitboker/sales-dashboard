const levelMap = {
  "מתחיל": { label: "Beginner", cls: "beginner" },
  "בינוני": { label: "Intermediate", cls: "intermediate" },
  "מתקדם": { label: "Advanced", cls: "advanced" },
};

export default function CourseCard({ course }) {
  const level = levelMap[course.level] || levelMap["מתחיל"];

  return (
    <article className="ac-card">
      {/* Thumbnail */}
      <div className="ac-card-thumb" style={{ background: course.gradient }}>
        <div className="ac-card-thumb-label">{course.category}</div>
      </div>

      {/* Body */}
      <div className="ac-card-body">
        <div className="ac-card-top-row">
          <span className={`ac-card-level ${level.cls}`}>{level.label}</span>
          <span className="ac-card-duration">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {course.duration}
          </span>
        </div>

        <h3 className="ac-card-title">{course.title}</h3>
        <p className="ac-card-desc">{course.description}</p>

        {/* Footer */}
        <div className="ac-card-footer">
          <span className="ac-card-lessons">
            {course.lessons} שיעורים
          </span>
          <button className="ac-card-btn" type="button">התחל</button>
        </div>
      </div>
    </article>
  );
}
