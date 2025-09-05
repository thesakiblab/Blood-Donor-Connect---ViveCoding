import React, { useState } from 'react';
// FIX: Use namespace import for react-router-dom to avoid potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BloodGroup } from '../types';
import BloodGroupSelector from '../components/BloodGroupSelector';
import { getUserByEmail } from '../services/db';

const Register: React.FC = () => {
    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        city: '',
        country: '',
        bloodGroup: BloodGroup.A_POSITIVE,
    });
    const [generatedOtp, setGeneratedOtp] = useState<string>('');
    const [enteredOtp, setEnteredOtp] = useState<string>('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = ReactRouterDOM.useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const existingUser = await getUserByEmail(formData.email);
        if (existingUser) {
            setError('An account with this email already exists.');
            setLoading(false);
            return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otp);
        setLoading(false);

        // Simulate sending OTP via SMS
        alert(`SIMULATED OTP: Your verification code is ${otp}`);
        
        setStep('otp');
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (enteredOtp !== generatedOtp) {
            setError('Invalid OTP. Please try again.');
            setLoading(false);
            return;
        }

        try {
            await register(formData);
            setMessage('Registration successful! Your account is pending admin approval.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };
    
    if (message) {
        return (
            <div className="flex items-center justify-center min-h-full">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Registration Complete!</h2>
                    <p className="text-green-600 dark:text-green-400">{message}</p>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-full">
            <div className="max-w-lg w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                {step === 'details' ? (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">Create a Donor Account</h2>
                        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
                        <form onSubmit={handleDetailsSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                                    <input type="text" name="country" value={formData.country} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                                </div>
                                <div className="md:col-span-2">
                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Blood Group</label>
                                     <BloodGroupSelector value={formData.bloodGroup} onChange={handleChange} required name="bloodGroup" />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
                                {loading ? 'Sending OTP...' : 'Send Verification Code'}
                            </button>
                        </form>
                         <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <ReactRouterDOM.Link to="/login" className="font-medium text-red-600 hover:text-red-500">
                                Sign in
                            </ReactRouterDOM.Link>
                        </p>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">Verify Your Phone Number</h2>
                        <p className="text-center text-gray-600 dark:text-gray-400 mb-4">An OTP has been sent to your phone. Please enter it below.</p>
                        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enter OTP</label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={enteredOtp}
                                    onChange={(e) => setEnteredOtp(e.target.value)}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
                                {loading ? 'Verifying...' : 'Verify & Register'}
                            </button>
                        </form>
                        <button onClick={() => setStep('details')} className="mt-4 w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:underline">
                            Back to details
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
// FIX: Remove local conflicting BloodGroupSelector declaration.
// The imported component from '../components/BloodGroupSelector' will be used instead.


export default Register;