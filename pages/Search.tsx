import React, { useState, useEffect } from 'react';
// FIX: Use namespace import for react-router-dom to avoid potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { getUsers } from '../services/db';
import { User, BloodGroup } from '../types';
import BloodGroupSelector from '../components/BloodGroupSelector';
import { useAuth } from '../context/AuthContext';

const Search: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [donors, setDonors] = useState<User[]>([]);
    const [filteredDonors, setFilteredDonors] = useState<User[]>([]);
    const [filters, setFilters] = useState({
        bloodGroup: '',
        city: '',
        country: '',
    });
    const navigate = ReactRouterDOM.useNavigate();

    useEffect(() => {
        const fetchDonors = async () => {
            const allUsers = await getUsers();
            const fourMonthsAgo = new Date();
            fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

            // Exclude current user, unverified users, and users who donated in last 4 months
            const availableDonors = allUsers.filter(u => {
                if (u.id === currentUser?.id || !u.isVerified) {
                    return false;
                }
                if (u.lastDonationDate) {
                    const lastDonation = new Date(u.lastDonationDate);
                    if (lastDonation > fourMonthsAgo) {
                        return false;
                    }
                }
                return true;
            });
            setDonors(availableDonors);
            setFilteredDonors(availableDonors);
        };
        fetchDonors();
    }, [currentUser]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    useEffect(() => {
        let result = donors;
        if (filters.bloodGroup) {
            result = result.filter(d => d.bloodGroup === filters.bloodGroup);
        }
        if (filters.city) {
            result = result.filter(d => d.city.toLowerCase().includes(filters.city.toLowerCase()));
        }
        if (filters.country) {
            result = result.filter(d => d.country.toLowerCase().includes(filters.country.toLowerCase()));
        }
        setFilteredDonors(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, donors]);

    const handleChat = (donorId: string) => {
        navigate(`/messenger/${donorId}`);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Find a Donor</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                    <BloodGroupSelector
                        value={filters.bloodGroup as BloodGroup | ''}
                        onChange={handleFilterChange}
                        includeAllOption
                        name="bloodGroup"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                    <input
                        type="text"
                        name="city"
                        value={filters.city}
                        onChange={handleFilterChange}
                        placeholder="e.g. New York"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                    <input
                        type="text"
                        name="country"
                        value={filters.country}
                        onChange={handleFilterChange}
                        placeholder="e.g. USA"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Blood Group</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Donated</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredDonors.length > 0 ? filteredDonors.map(donor => (
                            <tr key={donor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{donor.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className="font-bold text-red-600">{donor.bloodGroup}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{donor.city}, {donor.country}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{donor.contactVisible ? donor.phone : 'Hidden'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{donor.lastDonationDate || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleChat(donor.id)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">
                                        Chat
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">No donors found matching your criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Search;