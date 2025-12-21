'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';

export default function AdminSettings() {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [settings, setSettings] = useState({
        siteName: '',
        siteDescription: '',
        maintenanceMode: false,
        allowRegistration: true,
        contactEmail: '',
        maxCandidatesPerElection: 10
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/login');
        } else if (user) {
            fetchSettings();
        }
    }, [user, loading, router]);

    const fetchSettings = async () => {
        try {
            const response = await adminAPI.getSettings();
            setSettings(response.data.data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load settings' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await adminAPI.updateSettings(settings);
            setMessage({ type: 'success', text: 'Settings updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update settings' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl">
            <header className="header">
                <div className="headerContent">
                    <div>
                        <h1>System Settings</h1>
                        <p>Global platform configurations and limits</p>
                    </div>
                    <button onClick={() => router.push('/admin/dashboard')} className="btn btn-outline">
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

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Site Information */}
                        <div className="section">
                            <h2 className="sectionTitle">General Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-group">
                                    <label className="form-label">Site Name</label>
                                    <input
                                        type="text"
                                        name="siteName"
                                        value={settings.siteName}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Online Voting System"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Contact Email</label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={settings.contactEmail}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="admin@example.com"
                                        required
                                    />
                                </div>
                                <div className="form-group md:col-span-2">
                                    <label className="form-label">Site Description</label>
                                    <textarea
                                        name="siteDescription"
                                        value={settings.siteDescription}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Describe your voting platform..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* System Controls */}
                        <div className="section">
                            <h2 className="sectionTitle">System Controls</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Maintenance Mode</h3>
                                        <p className="text-sm text-gray-500">Only Admins can access the platform</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="maintenanceMode"
                                            checked={settings.maintenanceMode}
                                            onChange={handleInputChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Allow New Registrations</h3>
                                        <p className="text-sm text-gray-500">Enable or disable voter signups</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="allowRegistration"
                                            checked={settings.allowRegistration}
                                            onChange={handleInputChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Limits */}
                        <div className="section">
                            <h2 className="sectionTitle">Platform Limits</h2>
                            <div className="form-group max-w-xs pt-2">
                                <label className="form-label">Max Candidates per Election</label>
                                <input
                                    type="number"
                                    name="maxCandidatesPerElection"
                                    value={settings.maxCandidatesPerElection}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    min="2"
                                    max="50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t flex gap-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="btn btn-primary px-10"
                            >
                                {isSaving ? 'Saving...' : 'Save All Settings'}
                            </button>
                            <button
                                type="button"
                                onClick={fetchSettings}
                                className="btn btn-outline"
                            >
                                Reset Changes
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
