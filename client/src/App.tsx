import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './app';
import { LoginPage, RegisterPage } from './features/auth';
import { Layout } from './components/layout';
import { DashboardPage, LeadDetailPage } from './features/leads';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}