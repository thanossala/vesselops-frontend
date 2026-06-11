// ─────────────────────────────────────────────
//  VesselOps — App.tsx  (updated)
//  Changes vs original:
//    ✓ Wrapped in ErrorBoundary (catches unexpected crashes)
//    ✓ Navbar updated to be mobile-responsive (hamburger menu)
// ─────────────────────────────────────────────

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Crew from './pages/Crew';
import Vessels from './pages/Vessels';
import Watches from './pages/Watches';
import Logbook from './pages/Logbook';
import Certificates from './pages/Certificates';
import { ErrorBoundary } from './components/ErrorState';
import './App.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, loading } = useAuth();
  if (loading) return (
    <div className="loading" style={{ minHeight: '100vh' }}>
      <div className="spinner" /> Loading...
    </div>
  );
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', flexDirection: 'column' }}>
    <Navbar />
    <main style={{ flex: 1 }}>{children}</main>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"        element={<Login />} />
      <Route path="/register"     element={<Register />} />
      <Route path="/"             element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/crew"         element={<ProtectedRoute><Layout><Crew /></Layout></ProtectedRoute>} />
      <Route path="/vessels"      element={<ProtectedRoute><Layout><Vessels /></Layout></ProtectedRoute>} />
      <Route path="/watches"      element={<ProtectedRoute><Layout><Watches /></Layout></ProtectedRoute>} />
      <Route path="/logbook"      element={<ProtectedRoute><Layout><Logbook /></Layout></ProtectedRoute>} />
      <Route path="/certificates" element={<ProtectedRoute><Layout><Certificates /></Layout></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    // ErrorBoundary catches any unexpected crash in the whole app
    // and shows a friendly error screen instead of a blank white page
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
