'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading, checkAuth } = useAuth();

    const [activeTab, setActiveTab] = useState('details');
    const [details, setDetails] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            setDetails({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user, loading, router]);

    const handleDetailsChange = (e) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const updateDetails = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setMessage({ type: '', text: '' });

        try {
            await authAPI.updateDetails(details);
            await checkAuth();
            setMessage({ type: 'success', text: 'Profile details updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setIsUpdating(false);
        }
    };

    const updatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setMessage({ type: 'error', text: 'New passwords do not match' });
        }

        setIsUpdating(true);
        setMessage({ type: '', text: '' });

        try {
            await authAPI.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password' });
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="container max-w-4xl">
            <header className="header">
                <div className="headerContent">
                    <div>
                        <h1>Account Settings</h1>
                        <p>Manage your profile information and security</p>
                    </div>
                    <button
                        onClick={() => {
                            if (user.role === 'admin') router.push('/admin/dashboard');
                            else if (user.role === 'election_officer') router.push('/officer/dashboard');
                            else router.push('/voter/dashboard');
                        }}
                        className="btn btn-outline"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="main">
                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                        <button className="closeAlert" onClick={() => setMessage({ type: '', text: '' })}>×</button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="md:col-span-1 space-y-2">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${activeTab === 'details'
                                    ? 'bg-primary text-white shadow-md'
                                    : 'hover:bg-gray-100 text-gray-600'
                                }`}
                        >
                            👤 Profile Details
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${activeTab === 'security'
                                    ? 'bg-primary text-white shadow-md'
                                    : 'hover:bg-gray-100 text-gray-600'
                                }`}
                        >
                            🔒 Security
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-3">
                        <div className="card">
                            {activeTab === 'details' ? (
                                <form onSubmit={updateDetails} className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-900 border-b pb-4 mb-6">Personal Information</h2>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="form-group">
                                            <label className="form-label">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={details.name}
                                                onChange={handleDetailsChange}
                                                className="form-input"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={details.email}
                                                onChange={handleDetailsChange}
                                                className="form-input"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Phone Number</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={details.phone}
                                                onChange={handleDetailsChange}
                                                className="form-input"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-gray-700">Role: <span className="text-primary uppercase">{user.role.replace('_', ' ')}</span></p>
                                                <p className="text-xs text-gray-500">Your role determines your permissions in the system.</p>
                                            </div>
                                            <div className={`badge badge-${user.isVerified ? 'success' : 'warning'}`}>
                                                {user.isVerified ? 'Verified' : 'Pending Verification'}
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={isUpdating}
                                                className="btn btn-primary w-full md:w-auto px-8"
                                            >
                                                {isUpdating ? 'Updating...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={updatePassword} className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-900 border-b pb-4 mb-6">Change Password</h2>

                                    <div className="space-y-6">
                                        <div className="form-group">
                                            <label className="form-label">Current Password</label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                className="form-input"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">New Password</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className="form-input"
                                                required
                                                minLength={6}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Confirm New Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="form-input"
                                                required
                                                minLength={6}
                                            />
                                        </div>

                                        <div className="pt-4 border-t">
                                            <h3 className="font-bold text-gray-900 mb-2">Password Requirements:</h3>
                                            <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
                                                <li>Minimum 6 characters long</li>
                                                <li>Must be different from your current password</li>
                                            </ul>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={isUpdating}
                                                className="btn btn-primary w-full md:w-auto px-8"
                                            >
                                                {isUpdating ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
