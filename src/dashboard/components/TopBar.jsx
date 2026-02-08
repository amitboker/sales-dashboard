import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";

export default function TopBar({ profileName, profilePhoto, profileRole, onNavigate, onLogout, isAdmin }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initials = (profileName || "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleNotifications = () => {
    // Placeholder for notifications panel
    console.log("Notifications clicked");
    // TODO: Implement notifications panel/modal
  };

  const handleSettings = () => {
    onNavigate("settings");
  };

  return (
    <div className="topbar">
      <div className="topbar-user-area" ref={dropdownRef}>
        {/* User Info */}
        <div className="topbar-user-info">
          <div className="topbar-user-name">{profileName || "משתמש"}</div>
          {profileRole && (
            <div className="topbar-user-role">{profileRole}</div>
          )}
        </div>

        {/* Avatar */}
        <button
          className="topbar-avatar-btn"
          onClick={() => setDropdownOpen((v) => !v)}
          type="button"
        >
          {profilePhoto ? (
            <img src={profilePhoto} alt={profileName} className="topbar-avatar-img" />
          ) : (
            <span className="topbar-avatar-initials">{initials}</span>
          )}
        </button>

        {/* Action Buttons */}
        <div className="topbar-action-buttons">
          <button
            className="topbar-icon-btn"
            type="button"
            onClick={handleSettings}
            aria-label="הגדרות"
          >
            <Icon name="settings" size={18} />
          </button>

          <button
            className="topbar-icon-btn"
            type="button"
            onClick={handleNotifications}
            aria-label="התראות"
          >
            <Icon name="bell" size={18} />
          </button>
        </div>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="topbar-dropdown">
            <button
              className="topbar-dropdown-item"
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                onNavigate("settings");
              }}
            >
              הצג פרופיל
            </button>
            {isAdmin && (
              <>
                <div className="topbar-dropdown-divider" />
                <button
                  className="topbar-dropdown-item"
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/admin");
                  }}
                >
                  פאנל ניהול
                </button>
              </>
            )}
            <div className="topbar-dropdown-divider" />
            <button
              className="topbar-dropdown-item"
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                if (onLogout) onLogout();
              }}
            >
              התנתק
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
