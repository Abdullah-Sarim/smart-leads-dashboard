import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './app/ProtectedRoute';
import { LoginPage, RegisterPage, UsersPage, AccountPage } from './features/auth';
import { Layout } from './components/layout';
import { DashboardPage, LeadsPage, LeadDetailPage, AssignedLeadsPage } from './features/leads';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/assigned" element={<AssignedLeadsPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
