import { useState, useEffect, useCallback, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

/* ── Provider Logos (PNG imports) ── */
import gohighlevelLogo from "../../assets/integrations/gohighlevel.png";
import mondayLogo from "../../assets/integrations/monday.png";
import powerlinkLogo from "../../assets/integrations/powerlink.png";
import hubspotLogo from "../../assets/integrations/hubspot.png";

const PROVIDER_LOGOS = {
  gohighlevel: gohighlevelLogo,
  monday: mondayLogo,
  powerlink: powerlinkLogo,
  hubspot: hubspotLogo,
};

const PROVIDERS = [
  {
    id: "gohighlevel",
    name: "GoHighLevel",
    type: "CRM & Marketing",
    description: "סנכרון לידים, אנשי קשר ומשפכי מכירות מחשבון GoHighLevel שלך",
    ready: true,
    helpText: "ניתן למצוא את מפתח ה-API תחת Settings > API Keys במערכת GoHighLevel",
  },
  {
    id: "monday",
    name: "Monday.com",
    type: "ניהול פרויקטים",
    description: "סנכרון לוחות Monday עם Clario לניהול משימות ולידים",
    ready: false,
  },
  {
    id: "powerlink",
    name: "Powerlink CRM",
    type: "CRM",
    description: "ייבוא נתוני לקוחות, עסקאות ופעילויות מ-Powerlink",
    ready: false,
  },
  {
    id: "hubspot",
    name: "HubSpot",
    type: "CRM & Marketing",
    description: "סנכרון אנשי קשר, עסקאות ומשפכים מ-HubSpot CRM",
    ready: false,
  },
];

/* ── Inline SVG Icons ── */
const LockIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CheckIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" fill="#4CAF50" opacity="0.1" />
    <path d="M9 12l2 2 4-4" stroke="#4CAF50" strokeWidth="2.2" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="connect-modal__spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.2" />
    <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function IntegrationsPage({ client }) {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProvider, setModalProvider] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [connectSuccess, setConnectSuccess] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!client?.id || !supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await supabase
          .from("integrations")
          .select("id, provider, status, createdAt, updatedAt")
          .eq("clientId", client.id);

        if (!cancelled && !error && data) {
          setIntegrations(data);
        }
      } catch {
        // swallow
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [client?.id]);

  const getStatus = useCallback(
    (providerId) => {
      const found = integrations.find((i) => i.provider === providerId);
      return found?.status || null;
    },
    [integrations]
  );

  function openConnectModal(provider) {
    setModalProvider(provider);
    setApiKeyInput("");
    setShowKey(false);
    setConnectError("");
    setConnectSuccess(false);
    setModalOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function closeModal() {
    if (connecting) return;
    setModalOpen(false);
  }

  async function handleConnect() {
    if (!apiKeyInput.trim() || !modalProvider || connecting) return;
    setConnecting(true);
    setConnectError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/integrations/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          provider: modalProvider.id,
          apiKey: apiKeyInput.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setConnectError(data.error || "שגיאה בחיבור — בדוק את מפתח ה-API ונסה שוב");
        return;
      }

      setConnectSuccess(true);
      setIntegrations((prev) => {
        const existing = prev.findIndex((i) => i.provider === modalProvider.id);
        const newEntry = {
          id: data.integration.id,
          provider: data.integration.provider,
          status: data.integration.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = newEntry;
          return updated;
        }
        return [...prev, newEntry];
      });

      setTimeout(() => setModalOpen(false), 1400);
    } catch {
      setConnectError("שגיאה בחיבור — נסה שוב");
    } finally {
      setConnecting(false);
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    handleConnect();
  }

  const connectedCount = integrations.filter((i) => i.status === "connected").length;

  return (
    <div className="page-enter integrations-page">
      <div className="integrations-container">
        {/* ── Page Header ── */}
        <div className="integrations-header">
          <div className="integrations-header__text">
            <h1>מקורות נתונים</h1>
            <p>חבר את מערכות ה-CRM והשיווק שלך לסנכרון אוטומטי של נתונים</p>
          </div>
          <div className="integrations-header__meta">
            <span className="integrations-counter">
              {connectedCount}/{PROVIDERS.length} מחוברים
            </span>
          </div>
        </div>

        {/* ── Provider Grid ── */}
        <div className="integrations-grid">
          {PROVIDERS.map((provider) => {
            const status = getStatus(provider.id);
            const isConnected = status === "connected";
            const isAvailable = provider.ready && !isConnected;
            const isComingSoon = !provider.ready;

            return (
              <div
                key={provider.id}
                className={`integrations-card${isConnected ? " is-connected" : ""}${isComingSoon ? " is-coming-soon" : ""}`}
              >
                <div className="integrations-card__top">
                  <div className="integrations-card__logo">
                    <img src={PROVIDER_LOGOS[provider.id]} alt={provider.name} width={44} height={44} />
                  </div>
                  {isConnected ? (
                    <span className="integrations-badge is-connected">
                      <span className="integrations-badge__dot" />
                      מחובר
                    </span>
                  ) : isComingSoon ? (
                    <span className="integrations-badge is-coming-soon">בקרוב</span>
                  ) : (
                    <span className="integrations-badge is-available">זמין</span>
                  )}
                </div>

                <div className="integrations-card__body">
                  <h3 className="integrations-card__name">{provider.name}</h3>
                  <span className="integrations-card__type">{provider.type}</span>
                  <p className="integrations-card__desc">{provider.description}</p>
                </div>

                <div className="integrations-card__footer">
                  {isConnected ? (
                    <button
                      className="button integrations-btn"
                      type="button"
                      onClick={() => openConnectModal(provider)}
                    >
                      עדכן חיבור
                    </button>
                  ) : isAvailable ? (
                    <button
                      className="button primary integrations-btn"
                      type="button"
                      onClick={() => openConnectModal(provider)}
                    >
                      חבר עכשיו
                    </button>
                  ) : (
                    <button className="button integrations-btn" type="button" disabled>
                      בקרוב
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ Connect Provider Modal ═══ */}
      <Dialog.Root open={modalOpen} onOpenChange={(next) => { if (!next) closeModal(); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="connect-modal__overlay" />
          <Dialog.Content
            className="connect-modal"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            {connectSuccess ? (
              /* ── Success State ── */
              <div className="connect-modal__success">
                <div className="connect-modal__success-icon">
                  <CheckIcon />
                </div>
                <h3>החיבור בוצע בהצלחה</h3>
                <p>{modalProvider?.name} מחובר ל-Clario</p>
              </div>
            ) : (
              /* ── Form State ── */
              <form onSubmit={handleFormSubmit}>
                {/* Header */}
                <div className="connect-modal__header">
                  <div className="connect-modal__provider-icon">
                    {modalProvider && <img src={PROVIDER_LOGOS[modalProvider.id]} alt={modalProvider.name} width={44} height={44} />}
                  </div>
                  <Dialog.Title className="connect-modal__title">
                    חיבור {modalProvider?.name}
                  </Dialog.Title>
                  <Dialog.Description className="connect-modal__subtitle">
                    הזן מפתח API כדי לחבר את החשבון שלך ל-Clario
                  </Dialog.Description>
                </div>

                {/* Input section */}
                <div className="connect-modal__body">
                  <div className="connect-modal__field">
                    <div className="connect-modal__label-row">
                      <label className="connect-modal__label" htmlFor="api-key-input">
                        מפתח API
                      </label>
                      <span className="connect-modal__secure-tag">
                        <LockIcon size={12} />
                        מוצפן
                      </span>
                    </div>
                    <div className={`connect-modal__input-wrap${connectError ? " has-error" : ""}`}>
                      <input
                        ref={inputRef}
                        id="api-key-input"
                        type={showKey ? "text" : "password"}
                        value={apiKeyInput}
                        onChange={(e) => {
                          setApiKeyInput(e.target.value);
                          if (connectError) setConnectError("");
                        }}
                        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        dir="ltr"
                        autoComplete="off"
                        spellCheck="false"
                        className="connect-modal__input"
                        disabled={connecting}
                      />
                      <button
                        type="button"
                        className="connect-modal__toggle-vis"
                        onClick={() => setShowKey((v) => !v)}
                        tabIndex={-1}
                        aria-label={showKey ? "הסתר מפתח" : "הצג מפתח"}
                      >
                        {showKey ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>

                    {connectError && (
                      <p className="connect-modal__error">{connectError}</p>
                    )}

                    {modalProvider?.helpText && !connectError && (
                      <p className="connect-modal__help">{modalProvider.helpText}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="connect-modal__actions">
                  <button
                    type="submit"
                    className="connect-modal__submit"
                    disabled={connecting || !apiKeyInput.trim()}
                  >
                    {connecting ? (
                      <>
                        <SpinnerIcon />
                        <span>מתחבר...</span>
                      </>
                    ) : (
                      "חבר מערכת"
                    )}
                  </button>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="connect-modal__cancel"
                      disabled={connecting}
                    >
                      ביטול
                    </button>
                  </Dialog.Close>
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
