import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateOrder from './pages/CreateOrder';
import OrderManagement from './pages/OrderManagement';
import ServiceManagement from './pages/ServiceManagement';
import AdminCustomers from './pages/AdminCustomers';
import AdminReports from './pages/AdminReports';
import AdminExpenses from './pages/AdminExpenses';
import OrderHistory from './pages/OrderHistory';

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'CUSTOMER' | 'ADMIN' }> = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} />;

  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Customer Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute role="CUSTOMER">
          <CustomerDashboard />
        </ProtectedRoute>
      } />

      <Route path="/orders/history" element={
        <ProtectedRoute role="CUSTOMER">
          <OrderHistory />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute role="ADMIN">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute role="ADMIN">
          <OrderManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/orders/new" element={
        <ProtectedRoute role="ADMIN">
          <CreateOrder />
        </ProtectedRoute>
      } />
      <Route path="/admin/services" element={
        <ProtectedRoute role="ADMIN">
          <ServiceManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/customers" element={
        <ProtectedRoute role="ADMIN">
          <AdminCustomers />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute role="ADMIN">
          <AdminReports />
        </ProtectedRoute>
      } />
      <Route path="/admin/expenses" element={
        <ProtectedRoute role="ADMIN">
          <AdminExpenses />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppRoutes />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
