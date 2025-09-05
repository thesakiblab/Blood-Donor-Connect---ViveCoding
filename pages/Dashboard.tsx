import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../services/db';
import { getBloodDonationFacts } from '../services/geminiService';
import { User } from '../types';
import PieChartComponent from '../components/PieChartComponent';
// FIX: Use namespace import for react-router-dom to avoid potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';

interface Fact {
    fact: string;
    explanation: string;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [facts, setFacts] = useState<Fact[]>([]);
    const [loadingFacts, setLoadingFacts] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const allUsers = await getUsers();
            setUsers(allUsers);
        };
        const fetchFacts = async () => {
            try {
                const fetchedFacts = await getBloodDonationFacts();
                setFacts(fetchedFacts);
            } catch (error) {
                console.error("Failed to fetch donation facts:", error);
                setFacts([{fact: "Did you know?", explanation: "Donating blood can save up to three lives. Your single donation can help multiple people in need."}]);
            } finally {
                setLoadingFacts(false);
            }
        };

        fetchData();
        fetchFacts();
    }, []);

    const totalDonors = users.length;
    const recentDonations = users.filter(u => u.lastDonationDate).length;

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome, {user?.name}!</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Thank you for being a part of our life-saving community.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="bg-red-100 dark:bg-gray-700 p-3 rounded-full">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-red-600"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Your Blood Group</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{user?.bloodGroup}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="bg-blue-100 dark:bg-gray-700 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Total Donors</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalDonors}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
                     <div className="bg-green-100 dark:bg-gray-700 p-3 rounded-full">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Profiles with Donation Dates</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{recentDonations}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Blood Group Distribution</h2>
                    <PieChartComponent users={users} />
                </div>
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Blood Donation Facts</h2>
                    {loadingFacts ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse flex space-x-4">
                                    <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                                    <div className="flex-1 space-y-3 py-1">
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-3 gap-4">
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded col-span-2"></div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {facts.map((fact, index) => (
                                <li key={index} className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">{fact.fact}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{fact.explanation}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
             <div className="text-center">
                <ReactRouterDOM.Link to="/search" className="inline-block bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-red-700 transition-transform transform hover:-translate-y-1">
                    Find a Donor Now
                </ReactRouterDOM.Link>
            </div>
        </div>
    );
};

export default Dashboard;