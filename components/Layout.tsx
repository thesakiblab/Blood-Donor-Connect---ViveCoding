import React, { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import ThemeToggler from './ThemeToggler';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
        // On mount, read theme from localStorage and apply it.
        // Also check for system preference if no theme is set.
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>
            <Footer />
            <ThemeToggler />
        </div>
    );
};

export default Layout;