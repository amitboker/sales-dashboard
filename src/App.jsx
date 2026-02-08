import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardApp from './dashboard/DashboardApp';
import AdminApp from './admin/AdminApp';
import OnboardingPage from './pages/OnboardingPage';
import PageTransition from './components/PageTransition';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignUpPage /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><ProtectedRoute><OnboardingPage /></ProtectedRoute></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition variant="scale"><ProtectedRoute><DashboardApp /></ProtectedRoute></PageTransition>} />
        <Route path="/admin" element={<PageTransition variant="scale"><AdminRoute><AdminApp /></AdminRoute></PageTransition>} />
        <Route path="*" element={<PageTransition><LandingPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
