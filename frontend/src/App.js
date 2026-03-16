import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { BudgetProvider } from './context/BudgetContext';

import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetPage from './pages/BudgetPage';
import ReportsPage from './pages/ReportsPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TransactionProvider>
          <BudgetProvider>
            <Routes>
              <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard"    element={<DashboardPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="budget"       element={<BudgetPage />} />
                <Route path="reports"      element={<ReportsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              theme="dark"
              toastStyle={{ background: '#1c1e18', border: '1px solid #2a2d22', fontFamily: 'DM Mono, monospace', fontSize: '13px' }}
            />
          </BudgetProvider>
        </TransactionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
