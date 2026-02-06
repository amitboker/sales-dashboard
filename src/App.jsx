import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardApp from './dashboard/DashboardApp';
import OnboardingPage from './pages/OnboardingPage';
import PageTransition from './components/PageTransition';

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignUpPage /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><OnboardingPage /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition variant="scale"><DashboardApp /></PageTransition>} />
        <Route path="*" element={<PageTransition><LandingPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
