import React from 'react';
// FIX: Use namespace import for react-router-dom to avoid potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Messenger from './pages/Messenger';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <ReactRouterDOM.Navigate to="/login" />;
    }
    return children;
};

const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <ReactRouterDOM.Navigate to="/admin/login" />;
    }
    if (user.role !== UserRole.ADMIN) {
        return <ReactRouterDOM.Navigate to="/dashboard" />;
    }
    return children;
};

const AppRoutes: React.FC = () => {
    const { user } = useAuth();

    return (
        <Layout>
            <ReactRouterDOM.Routes>
                <ReactRouterDOM.Route path="/login" element={<Login />} />
                <ReactRouterDOM.Route path="/admin/login" element={<AdminLogin />} />
                <ReactRouterDOM.Route path="/register" element={<Register />} />
                <ReactRouterDOM.Route path="/forgot-password" element={<ForgotPassword />} />
                <ReactRouterDOM.Route path="/" element={user ? <ReactRouterDOM.Navigate to="/dashboard" /> : <ReactRouterDOM.Navigate to="/login" />} />

                <ReactRouterDOM.Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <ReactRouterDOM.Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                <ReactRouterDOM.Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <ReactRouterDOM.Route path="/messenger" element={<ProtectedRoute><Messenger /></ProtectedRoute>} />
                <ReactRouterDOM.Route path="/messenger/:userId" element={<ProtectedRoute><Messenger /></ProtectedRoute>} />
                
                <ReactRouterDOM.Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            </ReactRouterDOM.Routes>
        </Layout>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ReactRouterDOM.HashRouter>
                <AppRoutes />
            </ReactRouterDOM.HashRouter>
        </AuthProvider>
    );
};

export default App;