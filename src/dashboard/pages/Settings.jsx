import { useMemo, useRef, useState } from "react";
import SettingsModal from "../components/SettingsModal.jsx";

export default function Settings({ profileName, profilePhoto, onPhotoChange }) {
  const fileRef = useRef(null);
  const companyLogoRef = useRef(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyName, setCompanyName] = useState("מוקד בסקייל");
  const [industry, setIndustry] = useState("מוקד שירות");
  const [timezone, setTimezone] = useState("Asia/Jerusalem");
  const [currency, setCurrency] = useState("ILS");
  const [defaultCurrency, setDefaultCurrency] = useState("ILS");
  const [defaultTimezone, setDefaultTimezone] = useState("Asia/Jerusalem");
  const [themePreference, setThemePreference] = useState("light");
  const [salesReps, setSalesReps] = useState([
    { id: "rep-1", name: "נועם לויגנר", role: "Sales Rep", active: true },
    { id: "rep-2", name: "שירה כהן", role: "Sales Manager", active: true },
    { id: "rep-3", name: "עומר דוד", role: "Sales Rep", active: false },
  ]);
  const [isRepModalOpen, setIsRepModalOpen] = useState(false);
  const [editingRepId, setEditingRepId] = useState(null);
  const [repName, setRepName] = useState("");
  const [repRole, setRepRole] = useState("Sales Rep");
  const [repActive, setRepActive] = useState(true);

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onPhotoChange(reader.result);
    reader.readAsDataURL(file);
  }

  function handleCompanyLogoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCompanyLogo(reader.result);
    reader.readAsDataURL(file);
  }

  const repModalTitle = useMemo(
    () => (editingRepId ? "עריכת נציג מכירות" : "הוספת נציג מכירות"),
    [editingRepId]
  );

  const initials = profileName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  function openAddRep() {
    setEditingRepId(null);
    setRepName("");
    setRepRole("Sales Rep");
    setRepActive(true);
    setIsRepModalOpen(true);
  }

  function openEditRep(rep) {
    setEditingRepId(rep.id);
    setRepName(rep.name);
    setRepRole(rep.role);
    setRepActive(rep.active);
    setIsRepModalOpen(true);
  }

  function handleSaveRep() {
    if (!repName.trim()) return;
    if (editingRepId) {
      setSalesReps((prev) =>
        prev.map((rep) =>
          rep.id === editingRepId
            ? { ...rep, name: repName.trim(), role: repRole, active: repActive }
            : rep
        )
      );
    } else {
      setSalesReps((prev) => [
        ...prev,
        { id: `rep-${Date.now()}`, name: repName.trim(), role: repRole, active: repActive },
      ]);
    }
    setIsRepModalOpen(false);
  }

  function toggleRepStatus(repId) {
    setSalesReps((prev) =>
      prev.map((rep) => (rep.id === repId ? { ...rep, active: !rep.active } : rep))
    );
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <div className="page-header-text">
          <h1>הגדרות</h1>
          <p>ניהול פרופיל והעדפות</p>
        </div>
      </div>

      <div className="settings-card card padded">
        <div className="settings-profile-section">
          <button
            className="settings-avatar-btn"
            onClick={() => fileRef.current?.click()}
            type="button"
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt={profileName} className="settings-avatar-img" />
            ) : (
              <span className="settings-avatar-initials">{initials}</span>
            )}
            <span className="settings-avatar-overlay">שנה תמונה</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            hidden
          />
          <div className="settings-name">{profileName}</div>
          <div className="settings-role">מנהל מכירות</div>
        </div>

        <div className="settings-info">
          <div className="settings-info-row">
            <span className="settings-info-label">שם מלא</span>
            <span className="settings-info-value">{profileName}</span>
          </div>
          <div className="settings-info-row">
            <span className="settings-info-label">תפקיד</span>
            <span className="settings-info-value">מנהל מכירות</span>
          </div>
          <div className="settings-info-row">
            <span className="settings-info-label">אימייל</span>
            <span className="settings-info-value" style={{ direction: "ltr" }}>amit@mokad.co.il</span>
          </div>
        </div>
      </div>

      <div className="settings-section card padded">
        <div className="settings-section-header">
          <div>
            <h2>פרופיל חברה</h2>
            <p>ניהול פרטי החברה והמותג</p>
          </div>
        </div>
        <div className="settings-form-grid">
          <div className="settings-field">
            <label>שם חברה</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="settings-field">
            <label>לוגו חברה</label>
            <div className="settings-logo-row">
              <button
                className="button"
                type="button"
                onClick={() => companyLogoRef.current?.click()}
              >
                העלה לוגו
              </button>
              {companyLogo && <img src={companyLogo} alt="לוגו חברה" className="settings-logo-preview" />}
              <input
                ref={companyLogoRef}
                type="file"
                accept="image/*"
                onChange={handleCompanyLogoSelect}
                hidden
              />
            </div>
          </div>
          <div className="settings-field">
            <label>תחום פעילות</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
              <option>Tech Startup</option>
              <option>חברת ביטוח</option>
              <option>מוקד שירות</option>
              <option>חברת פיננסים</option>
              <option>קמעונאות</option>
              <option>נדל"ן</option>
              <option>שירותים עסקיים</option>
              <option>אחר</option>
            </select>
          </div>
          <div className="settings-field">
            <label>אזור זמן</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              <option value="Asia/Jerusalem">Asia/Jerusalem</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </div>
          <div className="settings-field">
            <label>מטבע</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="ILS">₪ ILS</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
          </div>
        </div>
        <div className="settings-actions-row">
          <button className="button primary">שמור שינויים</button>
        </div>
      </div>

      <div className="settings-section card padded">
        <div className="settings-section-header">
          <div>
            <h2>צוות מכירות</h2>
            <p>ניהול נציגים ותפקידים</p>
          </div>
          <button className="button primary" type="button" onClick={openAddRep}>
            הוסף נציג מכירות
          </button>
        </div>
        <div className="settings-table">
          <div className="settings-table-header">
            <span>שם מלא</span>
            <span>תפקיד</span>
            <span>סטטוס</span>
            <span>פעולות</span>
          </div>
          {salesReps.map((rep) => (
            <div key={rep.id} className="settings-table-row">
              <span>{rep.name}</span>
              <span>{rep.role === "Sales Manager" ? "מנהל מכירות" : "נציג מכירות"}</span>
              <span className={`settings-status ${rep.active ? "active" : "inactive"}`}>
                {rep.active ? "פעיל" : "לא פעיל"}
              </span>
              <div className="settings-row-actions">
                <button className="button" type="button" onClick={() => openEditRep(rep)}>
                  עריכה
                </button>
                <button className="button" type="button" onClick={() => toggleRepStatus(rep.id)}>
                  {rep.active ? "השבת" : "הפעל"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section card padded">
        <div className="settings-section-header">
          <div>
            <h2>העדפות</h2>
            <p>הגדרות בסיסיות למערכת</p>
          </div>
        </div>
        <div className="settings-form-grid">
          <div className="settings-field">
            <label>מטבע ברירת מחדל</label>
            <select value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)}>
              <option value="ILS">₪ ILS</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
          </div>
          <div className="settings-field">
            <label>אזור זמן ברירת מחדל</label>
            <select value={defaultTimezone} onChange={(e) => setDefaultTimezone(e.target.value)}>
              <option value="Asia/Jerusalem">Asia/Jerusalem</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </div>
          <div className="settings-field">
            <label>ערכת נושא</label>
            <select value={themePreference} onChange={(e) => setThemePreference(e.target.value)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
        <div className="settings-actions-row">
          <button className="button primary">שמור העדפות</button>
        </div>
      </div>

      <SettingsModal
        open={isRepModalOpen}
        onClose={() => setIsRepModalOpen(false)}
        title={repModalTitle}
        actions={
          <>
            <button className="button" type="button" onClick={() => setIsRepModalOpen(false)}>
              ביטול
            </button>
            <button className="button primary" type="button" onClick={handleSaveRep}>
              שמור
            </button>
          </>
        }
      >
        <div className="settings-field">
          <label>שם מלא</label>
          <input
            type="text"
            value={repName}
            onChange={(e) => setRepName(e.target.value)}
          />
        </div>
        <div className="settings-field">
          <label>תפקיד</label>
          <select value={repRole} onChange={(e) => setRepRole(e.target.value)}>
            <option value="Sales Rep">נציג מכירות</option>
            <option value="Sales Manager">מנהל מכירות</option>
          </select>
        </div>
        <div className="settings-field checkbox">
          <label>סטטוס פעיל</label>
          <input
            type="checkbox"
            checked={repActive}
            onChange={(e) => setRepActive(e.target.checked)}
          />
        </div>
      </SettingsModal>
    </div>
  );
}
