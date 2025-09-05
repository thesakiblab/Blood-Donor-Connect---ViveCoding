import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700">
            <div className="container mx-auto py-4 px-4 text-center text-gray-600 dark:text-gray-400">
                <p>&copy; {new Date().getFullYear()} Blood Donor Connect. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;