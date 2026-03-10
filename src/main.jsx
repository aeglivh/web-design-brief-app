import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/supabase';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ClientForm from './pages/ClientForm.jsx';

function Root() {
  const session = useAuth();
  if (session === undefined) return null;
  return <Navigate to={session ? "/dashboard" : "/login"} replace />;
}

function ProtectedRoute({ children }) {
  const session = useAuth();
  if (session === undefined) return null;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/studio/:slug" element={<ClientForm />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
