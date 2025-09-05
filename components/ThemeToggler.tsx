import React, { useState, useEffect } from 'react';

const ThemeToggler: React.FC = () => {
    // Initialize state using the same logic as Layout.tsx to ensure consistency.
    // This prevents the button icon from being out of sync with the actual theme.
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                return 'dark';
            }
        }
        return 'light';
    });

    // This function handles the theme toggle logic
    const toggleTheme = () => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            
            // Update localStorage, which acts as the source of truth for other tabs and future visits.
            localStorage.setItem('theme', newTheme);
            
            // Apply the new theme to the document's class list for TailwindCSS to pick up.
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            
            return newTheme;
        });
    };
    
    // This effect listens for changes in localStorage from other tabs to keep the theme synchronized.
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            // Only act on changes to the 'theme' key.
            if (e.key === 'theme') {
                const newTheme = e.newValue || 'light';
                setTheme(newTheme);
                
                // Update the current tab's DOM to reflect the change.
                if (newTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        }

        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-5 right-5 z-50 p-3 bg-gray-800 dark:bg-yellow-400 text-white dark:text-gray-900 rounded-full shadow-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-yellow-500 transition-all duration-200"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                // Moon Icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
                // Sun Icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
        </button>
    );
};

export default ThemeToggler;