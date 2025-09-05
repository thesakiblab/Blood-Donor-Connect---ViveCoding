import React, { useState, useEffect, useCallback } from 'react';
// FIX: Use namespace import for react-router-dom to avoid potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { getUnreadMessages, MESSAGES_KEY } from '../services/db';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = ReactRouterDOM.useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshUnreadCount = useCallback(async () => {
        if (user) {
            const messages = await getUnreadMessages(user.id);
            setUnreadCount(messages.length);
        } else {
            setUnreadCount(0);
        }
    }, [user]);

    useEffect(() => {
        refreshUnreadCount();

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === MESSAGES_KEY) {
                refreshUnreadCount();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [refreshUnreadCount]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
            isActive ? 'bg-red-700 text-white' : 'text-gray-300 hover:bg-red-600 hover:text-white dark:hover:bg-gray-700'
        }`;

    return (
        <header className="bg-red-800 dark:bg-gray-800 shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white mr-2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
                        <span className="text-white text-xl font-bold">Blood Donor Connect</span>
                    </div>
                    <nav className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                <ReactRouterDOM.NavLink to="/dashboard" className={navLinkClass}>Dashboard</ReactRouterDOM.NavLink>
                                <ReactRouterDOM.NavLink to="/search" className={navLinkClass}>Search</ReactRouterDOM.NavLink>
                                <ReactRouterDOM.NavLink to="/messenger" className={navLinkClass}>
                                    Messenger
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </ReactRouterDOM.NavLink>
                                <ReactRouterDOM.NavLink to="/profile" className={navLinkClass}>Profile</ReactRouterDOM.NavLink>
                                {user.role === UserRole.ADMIN && (
                                    <ReactRouterDOM.NavLink to="/admin" className={navLinkClass}>Admin</ReactRouterDOM.NavLink>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white dark:hover:bg-gray-700"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <ReactRouterDOM.NavLink to="/login" className={navLinkClass}>Login</ReactRouterDOM.NavLink>
                                <ReactRouterDOM.NavLink to="/register" className={navLinkClass}>Register</ReactRouterDOM.NavLink>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;