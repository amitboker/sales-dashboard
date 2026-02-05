import { useState, useRef, useEffect } from "react";
import Icon from "./Icon.jsx";

export default function TopBar({ profileName, profilePhoto, onNavigate }) {
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

  return (
    <div className="topbar">
      <div className="topbar-actions" ref={dropdownRef}>
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

        <button className="topbar-icon-btn" type="button">
          <Icon name="bell" size={20} />
        </button>

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
            <div className="topbar-dropdown-divider" />
            <button
              className="topbar-dropdown-item"
              type="button"
              onClick={() => {
                setDropdownOpen(false);
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
