import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { ToastProvider, useToast } from './context/ToastContext';

// Protected Route Wrapper
const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/" />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" />;

  return children;
};

const AppContent = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('userId', data.userId);
    showToast('Login successful!', 'success');
    
    if (data.role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/user');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<Login onLogin={handleLogin} />} />
      <Route 
        path="/admin" 
        element={
          <PrivateRoute requiredRole="ADMIN">
            <AdminDashboard onLogout={handleLogout} />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/user" 
        element={
          <PrivateRoute requiredRole="USER">
            <UserDashboard onLogout={handleLogout} />
          </PrivateRoute>
        } 
      />
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
