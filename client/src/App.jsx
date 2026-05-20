import React, { useMemo, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useSelector } from 'react-redux';
import getTheme from './theme/theme';
import socketService from './services/socketService';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Warehouses from './pages/Warehouses';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Vendors from './pages/Vendors';
import Orders from './pages/Orders';
import Deliveries from './pages/Deliveries';
import Transfers from './pages/Transfers';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  // Safe destructuring with fallback values
  const mode = useSelector((state) => state.theme?.mode ?? 'light');
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated ?? false);
  const token = useSelector((state) => state.auth?.token);
  
  // Ensure theme is always created with valid mode
  const theme = useMemo(() => getTheme(mode || 'light'), [mode]);

  // Connect socket when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token);
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="orders" element={<Orders />} />
          <Route path="deliveries" element={<Deliveries />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
