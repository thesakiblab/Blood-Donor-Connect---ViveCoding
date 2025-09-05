import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../services/db';
import { User, BloodGroup } from '../types';
import BloodGroupSelector from '../components/BloodGroupSelector';
import { md5 } from '../services/crypto';

const Profile: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const [formData, setFormData] = useState<Partial<User>>({});
    const [message, setMessage] = useState('');
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone,
                city: user.city,
                country: user.country,
                bloodGroup: user.bloodGroup,
                lastDonationDate: user.lastDonationDate || '',
                contactVisible: user.contactVisible ?? true,
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        if (user) {
            try {
                await updateUser(user.id, formData);
                await refreshUser(); // FIX: Refresh user data in context
                setMessage('Profile updated successfully!');
                setTimeout(() => setMessage(''), 3000);
            } catch (err) {
                setMessage(err instanceof Error ? err.message : 'Failed to update profile.');
            }
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (!user || !user.password) return;

        if (md5(passwordData.currentPassword) !== user.password) {
            setPasswordMessage({ type: 'error', text: 'Current password is incorrect.' });
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long.'});
            return;
        }

        try {
            await updateUser(user.id, { password: passwordData.newPassword });
            await refreshUser(); // FIX: Refresh user data to get new password hash
            setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setPasswordMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setPasswordMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to change password.' });
        }
    }

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Your Profile</h1>
                {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full input"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required disabled className="mt-1 block w-full input bg-gray-100 dark:bg-gray-600 cursor-not-allowed"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                            <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} required className="mt-1 block w-full input"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                            <input type="text" name="city" value={formData.city || ''} onChange={handleChange} required className="mt-1 block w-full input"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                            <input type="text" name="country" value={formData.country || ''} onChange={handleChange} required className="mt-1 block w-full input"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Blood Group</label>
                            <BloodGroupSelector name="bloodGroup" value={formData.bloodGroup || BloodGroup.A_POSITIVE} onChange={handleChange} required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Donation Date</label>
                            <input type="date" name="lastDonationDate" value={formData.lastDonationDate || ''} onChange={handleChange} className="mt-1 block w-full input"/>
                        </div>
                         <div className="md:col-span-2 pt-4">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    name="contactVisible"
                                    checked={formData.contactVisible ?? true}
                                    onChange={handleChange}
                                    className="form-checkbox h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show my phone number in search results</span>
                            </label>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
                        Update Profile
                    </button>
                </form>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Change Password</h2>
                {passwordMessage.text && <p className={`${passwordMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} p-3 rounded mb-4`}>{passwordMessage.text}</p>}
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                        <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required className="mt-1 block w-full input"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                        <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required className="mt-1 block w-full input"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                        <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required className="mt-1 block w-full input"/>
                    </div>
                    <button type="submit" className="w-full bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors">
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
};
// Simple utility class for inputs to avoid repetition
const _ = `
    .input { 
        @apply px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white;
    }
`;

export default Profile;