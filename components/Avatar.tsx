import React from 'react';

const Avatar: React.FC<{ name: string }> = ({ name }) => {
    const getInitials = (name: string) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (name: string) => {
        if (!name) return 'bg-gray-500';
        const colors = [
            'bg-red-500', 'bg-pink-500', 'bg-purple-500', 'bg-indigo-500',
            'bg-blue-500', 'bg-cyan-500', 'bg-teal-500', 'bg-green-500',
            'bg-orange-500', 'bg-yellow-500'
        ];
        const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[charCodeSum % colors.length];
    };

    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${getAvatarColor(name)}`}>
            {getInitials(name)}
        </div>
    );
};

export default Avatar;
