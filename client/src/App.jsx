import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import ChatPage from './pages/ChatPage.jsx';
import PlannerPage from './pages/PlannerPage.jsx';
import PlansPage from './pages/PlansPage.jsx';
import PlanDetailPage from './pages/PlanDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LoadingSpinner from './components/ui/LoadingSpinner.jsx';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullscreen />;
  return user ? children : <Navigate to="/login" replace />;
};

// Public route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullscreen />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected — wrapped in Dashboard Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="plans/:id" element={<PlanDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
