import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardApp from './dashboard/DashboardApp';
import PageTransition from './components/PageTransition';

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition variant="scale"><DashboardApp /></PageTransition>} />
        <Route path="*" element={<PageTransition><LandingPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
