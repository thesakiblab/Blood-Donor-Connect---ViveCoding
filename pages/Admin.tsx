import React, { useState, useEffect, useCallback } from 'react';
import { getAllSystemUsers, addUser, updateUser, deleteUser, getAllMessages, getAdmins, getUsers } from '../services/db';
import { User, UserRole, BloodGroup } from '../types';
import BloodGroupSelector from '../components/BloodGroupSelector';
import PieChartComponent from '../components/PieChartComponent';
import LineChartComponent from '../components/LineChartComponent';


const StatCard: React.FC<{title: string, value: number | string, icon: React.ReactNode}> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const Admin: React.FC = () => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [donorUsers, setDonorUsers] = useState<User[]>([]);
    const [adminUsers, setAdminUsers] = useState<User[]>([]);
    const [totalMessages, setTotalMessages] = useState(0);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [systemUsers, donors, admins, messages] = await Promise.all([
            getAllSystemUsers(),
            getUsers(),
            getAdmins(),
            getAllMessages()
        ]);
        
        setAllUsers(systemUsers);
        setDonorUsers(donors);
        setAdminUsers(admins);
        setTotalMessages(messages.length);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };
    
    const handleApprove = async (userId: string) => {
        await updateUser(userId, { isVerified: true });
        fetchData();
    }

    const handleDelete = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            await deleteUser(userId);
            fetchData();
        }
    };

    const handleAddNew = () => {
        setEditingUser({
            id: '', name: '', email: '', password: '', role: UserRole.DONOR, phone: '', city: '', country: '', bloodGroup: BloodGroup.A_POSITIVE, isVerified: false, contactVisible: true, isPhoneVerified: false
        });
        setIsModalOpen(true);
    };

    const handleSave = async (userToSave: User) => {
        if (userToSave.id) {
            const {id, ...updateData} = userToSave;
            await updateUser(id, updateData);
        } else {
            const { id, ...newUserPayload } = userToSave;
            await addUser(newUserPayload);
        }
        fetchData();
        setIsModalOpen(false);
        setEditingUser(null);
    };
    
    if (isLoading) {
        return <div className="text-center p-8 dark:text-gray-300">Loading Admin Dashboard...</div>
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Donors" value={donorUsers.length} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-red-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>} />
                <StatCard title="Total Admins" value={adminUsers.length} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-indigo-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>} />
                <StatCard title="Total Messages" value={totalMessages} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Donor Blood Groups</h2>
                    <PieChartComponent users={donorUsers} />
                </div>
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">User Registrations Over Time</h2>
                    <LineChartComponent users={allUsers} />
                </div>
            </div>


            {/* User Management Table */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>
                    <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Add New User
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Phone Verified</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {allUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {user.isVerified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isPhoneVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {user.isPhoneVerified ? 'Verified' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {!user.isVerified && user.role !== UserRole.ADMIN && (
                                             <button onClick={() => handleApprove(user.id)} className="text-green-600 hover:text-green-900 mr-4">Approve</button>
                                        )}
                                        <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {isModalOpen && editingUser && <UserModal user={editingUser} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
            </div>
        </div>
    );
};


const UserModal: React.FC<{ user: User, onSave: (user: User) => void, onClose: () => void }> = ({ user, onSave, onClose }) => {
    const [formData, setFormData] = useState<User>({...user, contactVisible: user.contactVisible ?? true, isPhoneVerified: user.isPhoneVerified ?? false });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{user.id ? 'Edit User' : 'Add User'}</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label><input name="name" value={formData.name} onChange={handleChange} className="w-full input" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label><input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full input" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password {user.id ? '(leave blank to keep)' : ''}</label><input name="password" type="password" placeholder="New Password" onChange={handleChange} className="w-full input" required={!user.id} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label><input name="phone" value={formData.phone} onChange={handleChange} className="w-full input" required/></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label><input name="city" value={formData.city} onChange={handleChange} className="w-full input" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label><input name="country" value={formData.country} onChange={handleChange} className="w-full input" required/></div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full input">
                                {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Blood Group</label>
                             <BloodGroupSelector name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} />
                        </div>
                         <div className="md:col-span-2 grid grid-cols-3 gap-4">
                            <div className="flex items-center">
                                 <input type="checkbox" name="isVerified" id="isVerified" checked={formData.isVerified} onChange={handleChange} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                                 <label htmlFor="isVerified" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">User is verified</label>
                            </div>
                             <div className="flex items-center">
                                 <input type="checkbox" name="contactVisible" id="contactVisibleModal" checked={formData.contactVisible} onChange={handleChange} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                                 <label htmlFor="contactVisibleModal" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Visible</label>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" name="isPhoneVerified" id="isPhoneVerifiedModal" checked={formData.isPhoneVerified} onChange={handleChange} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                                <label htmlFor="isPhoneVerifiedModal" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Verified</label>
                           </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// Simple utility class for inputs to avoid repetition
const _ = `
    .input { 
        @apply mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400;
    }
`;


export default Admin;