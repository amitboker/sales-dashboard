import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import {
  Menu,
  Sparkles,
  Clock,
  X,
  Paperclip,
  Mic,
  BarChart3,
  FileText,
  TrendingUp,
  Users,
  CircleDot,
  Search,
  Image,
  Video,
  RefreshCw,
  ArrowUpLeft,
  MessageSquare,
  Calculator,
  Settings,
  Plug,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import ChatInput from "../../components/chat/ChatInput";
import ModeSelector from "../../components/chat/ModeSelector";
import { MODELS, SAMPLE_PROMPTS, PROMPTS_PER_PAGE, MODES } from "../../components/chat/modes";
import { sendChatMessage } from "../../ai/service";
import { trackEvent } from "../../lib/tracking";
import logo from "../../assets/icons/clario-symbol.png";

/* ── Mobile nav items (mirrors desktop SideNav pages) ── */
const MOBILE_NAV_ITEMS = [
  { id: "home", label: "בית", icon: BarChart3, isHome: true },
  { id: "ai", label: "Clario AI", icon: MessageSquare, badge: "חדש" },
  { id: "command", label: "מרכז שליטה", icon: BarChart3 },
  { id: "team", label: "ביצועי צוות", icon: Users },
  { id: "funnel", label: "משפך מכירות", icon: CircleDot },
  { id: "projection", label: "בניית תחזית", icon: Calculator },
  { id: "integrations", label: "אינטגרציות", icon: Plug },
  { id: "settings", label: "הגדרות", icon: Settings },
];

/* ── Quick-action chips (matches the Utari reference layout) ── */
const ACTION_CHIPS = [
  { id: "dashboard", label: "דשבורד", icon: BarChart3 },
  { id: "reports", label: "דוחות", icon: FileText },
  { id: "analysis", label: "ניתוח", icon: TrendingUp },
  { id: "team", label: "צוות", icon: Users },
  { id: "funnel", label: "משפך", icon: CircleDot },
  { id: "research", label: "מחקר", icon: Search },
  { id: "media", label: "מדיה", icon: Image },
];

/* ── Stagger animation variants ── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const chipVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function MobileHome({ onNavigate, profilePhoto, hasData, isDemo }) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const displayName = (() => {
    if (user && profile) {
      const first = profile.firstName || "";
      if (first) return first;
      return user.email?.split("@")[0] || "משתמש";
    }
    return "משתמש";
  })();

  const [showProBanner, setShowProBanner] = useState(true);
  const [activeChip, setActiveChip] = useState(null);
  const [activeMode, setActiveMode] = useState(null);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [prefillValue, setPrefillValue] = useState("");
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  /* ── Prompt rotation for active chip ── */
  const [promptOffset, setPromptOffset] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getVisiblePrompts = useCallback(
    (chipId) => {
      const pool = SAMPLE_PROMPTS[chipId] || [];
      if (!pool.length) return [];
      const offset = promptOffset[chipId] || 0;
      const count = Math.min(PROMPTS_PER_PAGE, pool.length);
      const result = [];
      for (let i = 0; i < count; i++) {
        result.push(pool[(offset + i) % pool.length]);
      }
      return result;
    },
    [promptOffset]
  );

  const handleRefreshPrompts = useCallback((chipId) => {
    setIsRefreshing(true);
    setPromptOffset((prev) => {
      const pool = SAMPLE_PROMPTS[chipId] || [];
      const current = prev[chipId] || 0;
      const next = (current + PROMPTS_PER_PAGE) % pool.length;
      return { ...prev, [chipId]: next };
    });
    setTimeout(() => setIsRefreshing(false), 400);
  }, []);

  const handleChipClick = (chip) => {
    if (activeChip?.id === chip.id) {
      setActiveChip(null);
    } else {
      setActiveChip(chip);
    }
  };

  const handleSuggestionClick = (text) => {
    trackEvent("mobile_home_suggestion", { text });
    setPrefillValue(text);
    // Switch to AI workspace with the prefilled prompt
    if (onNavigate) onNavigate("ai");
  };

  const handleSubmit = (payload) => {
    // Navigate to AI workspace to handle the message
    if (onNavigate) onNavigate("ai");
  };

  /* ── Greeting based on time of day ── */
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 6) return "לילה טוב";
    if (hour < 12) return "בוקר טוב";
    if (hour < 17) return "צהריים טובים";
    if (hour < 21) return "ערב טוב";
    return "לילה טוב";
  })();

  const handleNavSelect = (id) => {
    setSideMenuOpen(false);
    if (id === "home") return; // already on home
    if (onNavigate) onNavigate(id);
  };

  return (
    <div className="mobile-home-wrapper">
      {/* ── Mobile Navigation Drawer ── */}
      <AnimatePresence>
        {sideMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="mobile-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSideMenuOpen(false)}
            />
            {/* Drawer panel */}
            <motion.aside
              className="mobile-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* Drawer header */}
              <div className="mobile-drawer-header">
                <div className="mobile-drawer-brand">
                  <img src={logo} alt="Clario" className="mobile-drawer-logo" />
                  <span className="mobile-drawer-brand-name">Clario</span>
                </div>
                <button
                  className="mobile-drawer-close"
                  onClick={() => setSideMenuOpen(false)}
                  aria-label="סגור תפריט"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>

              {/* Nav items */}
              <nav className="mobile-drawer-nav">
                {MOBILE_NAV_ITEMS.map((item) => {
                  const NavIcon = item.icon;
                  const isActive = item.isHome; // home is the current page
                  return (
                    <button
                      key={item.id}
                      className={`mobile-drawer-item${isActive ? " active" : ""}`}
                      onClick={() => handleNavSelect(item.id)}
                    >
                      <NavIcon size={18} strokeWidth={1.6} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="mobile-drawer-badge">{item.badge}</span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Drawer footer */}
              <div className="mobile-drawer-footer">
                <div className="mobile-drawer-pro-card" onClick={() => { setSideMenuOpen(false); navigate("/pricing"); }}>
                  <div className="mobile-drawer-pro-title">
                    <Sparkles size={14} strokeWidth={1.8} />
                    <span>Clario Pro</span>
                  </div>
                  <p className="mobile-drawer-pro-desc">גישה מלאה לכל הכלים והתחזיות</p>
                  <span className="mobile-drawer-pro-btn">צפה בתוכניות</span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="mobile-home-phone">
        <motion.div
          className="mobile-home-inner"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ── Header ── */}
          <motion.header className="mobile-home-header" variants={itemVariants}>
            <button
              className="mobile-home-menu-btn"
              aria-label="תפריט ראשי"
              onClick={() => setSideMenuOpen(true)}
            >
              <Menu size={20} strokeWidth={1.8} />
            </button>

            <div className="mobile-home-header-pills">
              <button
                className="mobile-home-plan-pill"
                onClick={() => navigate("/pricing")}
              >
                <Sparkles size={13} strokeWidth={1.8} />
                <span className="mobile-home-plan-label">Basic</span>
                <span className="mobile-home-plan-divider" />
                <span className="mobile-home-credits">86 Credits</span>
              </button>
              <button className="mobile-home-time-btn" aria-label="היסטוריה">
                <Clock size={16} strokeWidth={1.8} />
              </button>
            </div>
          </motion.header>

          {/* ── Main title ── */}
          <motion.div className="mobile-home-title-area" variants={itemVariants}>
            <h1 className="mobile-home-title">מה תרצה לקדם היום?</h1>
          </motion.div>

          {/* ── Chat card ── */}
          <motion.div className="mobile-home-card" variants={itemVariants}>
            {/* Pro banner */}
            <AnimatePresence>
              {showProBanner && (
                <motion.div
                  className="mobile-home-pro-banner"
                  initial={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div className="mobile-home-pro-banner-content">
                    <div className="mobile-home-pro-icon">
                      <Sparkles size={14} strokeWidth={1.8} />
                      <span>Pro</span>
                    </div>
                    <span className="mobile-home-pro-text">
                      גישה מלאה ל-Clario — כלים מתקדמים, אינטגרציות, ועוד
                    </span>
                  </div>
                  <button
                    className="mobile-home-pro-close"
                    onClick={() => setShowProBanner(false)}
                    aria-label="סגור באנר Pro"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input area */}
            <ChatInput
              activeMode={activeMode}
              onClearMode={() => setActiveMode(null)}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              onSubmit={handleSubmit}
              onProClick={() => navigate("/pricing")}
              prefillValue={prefillValue}
              onPrefillConsumed={() => setPrefillValue("")}
              isStreaming={false}
              onStop={() => {}}
            />
          </motion.div>

          {/* ── Action chips ── */}
          <motion.div
            className="mobile-home-chips-area"
            variants={containerVariants}
          >
            <div className="mobile-home-chips">
              {ACTION_CHIPS.map((chip) => {
                const isActive = activeChip?.id === chip.id;
                const ChipIcon = chip.icon;
                return (
                  <motion.button
                    key={chip.id}
                    variants={chipVariants}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChipClick(chip)}
                    className={`mobile-home-chip${isActive ? " active" : ""}`}
                  >
                    <ChipIcon size={15} strokeWidth={1.6} />
                    <span>{chip.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* ── Sample prompts for active chip ── */}
          <AnimatePresence mode="wait">
            {activeChip && SAMPLE_PROMPTS[activeChip.id] && (
              <motion.div
                key={activeChip.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="mobile-home-prompts-section"
              >
                <div className="mobile-home-prompts-header">
                  <p className="mobile-home-prompts-label">
                    הצעות ל{activeChip.label}
                  </p>
                  <button
                    onClick={() => handleRefreshPrompts(activeChip.id)}
                    className="mobile-home-refresh-btn"
                    title="הצעות חדשות"
                  >
                    <RefreshCw
                      size={13}
                      style={{
                        transition: "transform 0.4s ease",
                        transform: isRefreshing ? "rotate(360deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                </div>
                <div className="mobile-home-prompts-grid">
                  <AnimatePresence mode="wait">
                    {getVisiblePrompts(activeChip.id).map((text, i) => (
                      <motion.button
                        key={text}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2, delay: i * 0.05, ease: "easeOut" }}
                        onClick={() => handleSuggestionClick(text)}
                        className="mobile-home-prompt-card"
                      >
                        <span>{text}</span>
                        <ArrowUpLeft size={14} className="mobile-home-prompt-arrow" />
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Footer ── */}
          <motion.div className="mobile-home-footer" variants={itemVariants}>
            <span>דוגמאות פרומפטים</span>
            <span className="mobile-home-footer-dot">·</span>
            <span>Powered by Clario</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
