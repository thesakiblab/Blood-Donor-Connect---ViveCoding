import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User } from '../types';
import { loginUser, registerUser, loginAdmin, handleForgotPassword } from '../services/auth';
import { getUserById } from '../services/db';
import type { LoginCredentials, RegisterData } from '../services/auth';


interface AuthContextType {
    user: User | null;
    login: (credentials: LoginCredentials) => Promise<User>;
    adminLogin: (credentials: LoginCredentials) => Promise<User>;
    logout: () => void;
    register: (data: RegisterData) => Promise<User>;
    loading: boolean;
    refreshUser: () => Promise<void>;
    forgotPassword: (email: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkSession = useCallback(async () => {
        setLoading(true);
        try {
            const userId = localStorage.getItem('userId');
            if (userId) {
                const loggedInUser = await getUserById(userId);
                setUser(loggedInUser || null);
            }
        } catch (error) {
            console.error("Session check failed", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const handleSuccessfulLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
        localStorage.setItem('userId', loggedInUser.id);
        return loggedInUser;
    };

    const login = async (credentials: LoginCredentials) => {
        const loggedInUser = await loginUser(credentials);
        return handleSuccessfulLogin(loggedInUser);
    };
    
    const adminLogin = async (credentials: LoginCredentials) => {
        const loggedInUser = await loginAdmin(credentials);
        return handleSuccessfulLogin(loggedInUser);
    };

    const register = async (data: RegisterData) => {
        const newUser = await registerUser(data);
        // Do not automatically log in user, they need to be verified first.
        return newUser;
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userId');
    };

    const refreshUser = async () => {
        await checkSession();
    }

    const forgotPassword = async (email: string) => {
        return handleForgotPassword(email);
    }
    
    return (
        <AuthContext.Provider value={{ user, login, adminLogin, logout, register, loading, refreshUser, forgotPassword }}>
            {!loading && children}
        {/* FIX: Corrected typo in closing tag from 'Auth-context.Provider' to 'AuthContext.Provider'. */}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};