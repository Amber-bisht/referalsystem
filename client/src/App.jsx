import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Earnings from './pages/Earnings';
import Referrals from './pages/Referrals';
import MyPurchases from './pages/MyPurchases';
import ProductDetail from './pages/ProductDetail';

import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

export default () => (
  <BrowserRouter>
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/earnings" element={
          <ProtectedRoute>
            <Earnings />
          </ProtectedRoute>
        } />
        <Route path="/referrals" element={
          <ProtectedRoute>
            <Referrals />
          </ProtectedRoute>
        } />
        <Route path="/my-purchases" element={
          <ProtectedRoute>
            <MyPurchases />
          </ProtectedRoute>
        } />

        {/* Global slug handler - must be last */}
        <Route path="/:id" element={<ProductDetail />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
