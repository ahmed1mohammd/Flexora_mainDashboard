// ============================================================
// التطبيق الجذري — App.jsx
// يحتوي على: نظام التوجيه، الحماية، التخطيط الأساسي
// ============================================================

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import PWAInstallBanner from './components/PWAInstallBanner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GymsPage from './pages/GymsPage';
import PlansPage from './pages/PlansPage';
import TeamPage from './pages/TeamPage';
import UsersPage from './pages/UsersPage';
import ActivityPage from './pages/ActivityPage';
import PlatformExpensesPage from './pages/PlatformExpensesPage';
import SettingsPage from './pages/SettingsPage';
import BranchesPage from './pages/BranchesPage';

// ── حارس المسار المحمي ────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('flexora_auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ── تخطيط لوحة التحكم مع الشريط الجانبي ─────────────────
const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout" dir="rtl">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="main-content" role="main">
        <div className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="top-bar-title">منظومة فليكسورا الإدارية</div>
          </div>
          <div className="top-bar-meta">
            <div className="top-bar-user" id="top-bar-user-btn">
              <div className="user-avatar">م</div>
              <span className="user-name-text" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {localStorage.getItem('flexora_user_name') || 'المدير'}
              </span>
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};

// ── الشجرة الجذرية للتوجيه ───────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <PWAInstallBanner />
      <Routes>
        {/* المسار الجذري — إعادة توجيه */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* مسارات المصادقة (بدون شريط جانبي) */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* مسارات لوحة التحكم المحمية */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/gyms"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <GymsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/plans"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PlansPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <UsersPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ActivityPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PlatformExpensesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TeamPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/branches"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BranchesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 — مسار غير موجود */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
