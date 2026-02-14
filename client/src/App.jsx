import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Earnings from './pages/Earnings';
import Referrals from './pages/Referrals';
import Landing from './pages/Landing';
import MyPurchases from './pages/MyPurchases';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

export default () => (
  <BrowserRouter>
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/shop" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
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
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
