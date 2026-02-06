import { useRef } from "react";

export default function Settings({ profileName, profilePhoto, onPhotoChange }) {
  const fileRef = useRef(null);

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onPhotoChange(reader.result);
    reader.readAsDataURL(file);
  }

  const initials = profileName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

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
    </div>
  );
}
