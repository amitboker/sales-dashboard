import { useLayoutEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardApp from './dashboard/DashboardApp';
import AdminApp from './admin/AdminApp';
import OnboardingPage from './pages/OnboardingPage';
import PageTransition from './components/PageTransition';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingRoute from './components/OnboardingRoute';
import AdminRoute from './components/AdminRoute';
import PricingPage from './pages/PricingPage';
import AuthCallback from './pages/AuthCallback';
import DevOnboardingPreview from './pages/DevOnboardingPreview';
import OnboardingName from './pages/OnboardingName';
import OnboardingBusiness from './pages/OnboardingBusiness';

// Disable browser scroll restoration globally — we handle scroll ourselves
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function App() {
  const location = useLocation();

  // Global scroll reset on route changes (login → dashboard, etc.)
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const content = document.querySelector('.content');
    if (content) content.scrollTop = 0;
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignUpPage /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><OnboardingRoute><OnboardingPage /></OnboardingRoute></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition variant="scale"><ProtectedRoute><DashboardApp /></ProtectedRoute></PageTransition>} />
        <Route path="/admin" element={<PageTransition variant="scale"><AdminRoute><AdminApp /></AdminRoute></PageTransition>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/pricing" element={<PageTransition><PricingPage /></PageTransition>} />
        <Route path="/onboarding/name" element={<PageTransition><OnboardingRoute><OnboardingName /></OnboardingRoute></PageTransition>} />
        <Route path="/onboarding/business" element={<PageTransition><OnboardingRoute><OnboardingBusiness /></OnboardingRoute></PageTransition>} />
        <Route path="/onboarding/next-step" element={<PageTransition><OnboardingRoute><div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f6', color: '#8b8b8b', fontFamily: '"Liebling","Heebo",system-ui,sans-serif', fontSize: 17, direction: 'rtl' }}>שלב הבא — בקרוב</div></OnboardingRoute></PageTransition>} />
        <Route path="/dev/onboarding" element={<DevOnboardingPreview />} />
        <Route path="/dev/onboarding-name" element={<OnboardingName />} />
        <Route path="/dev/onboarding-business" element={<OnboardingBusiness />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
