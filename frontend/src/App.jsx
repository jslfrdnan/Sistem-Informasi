import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StokTBS from './pages/StokTBS';
import CreateOrder from './pages/CreateOrder';
import MyOrders from './pages/MyOrders';
import ManageStok from './pages/ManageStok';
import ManageOrders from './pages/ManageOrders';
import Jadwal from './pages/Jadwal';
import Timbangan from './pages/Timbangan';
import Pembayaran from './pages/Pembayaran';
import Dokumen from './pages/Dokumen';
import Reports from './pages/Reports';
import LogAktivitas from './pages/LogAktivitas';

// Styles
import './styles/global.css';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/stok"
        element={
          <ProtectedRoute>
            <StokTBS />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-order"
        element={
          <ProtectedRoute>
            <CreateOrder />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-orders"
        element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manage-stok"
        element={
          <ProtectedRoute requiredRole="admin">
            <ManageStok />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <ManageOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/jadwal"
        element={
          <ProtectedRoute>
            <Jadwal />
          </ProtectedRoute>
        }
      />

      <Route
        path="/timbangan"
        element={
          <ProtectedRoute requiredRole="staff">
            <Timbangan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pembayaran"
        element={
          <ProtectedRoute>
            <Pembayaran />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dokumen"
        element={
          <ProtectedRoute>
            <Dokumen />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/logs"
        element={
          <ProtectedRoute requiredRole="admin">
            <LogAktivitas />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
