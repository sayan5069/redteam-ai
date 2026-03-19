import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Toast, { useToast } from './components/Toast';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import SessionPage from './pages/SessionPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex items-center gap-2 text-accent-red">
          <span className="text-sm font-mono">Loading</span>
          <span className="cursor-blink" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppLayout() {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <Navbar />
      <main className="main-content min-h-screen bg-bg">
        <Routes>
          <Route path="/dashboard" element={<DashboardPage addToast={addToast} />} />
          <Route path="/history" element={<HistoryPage addToast={addToast} />} />
          <Route path="/session/:id" element={<SessionPage addToast={addToast} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
