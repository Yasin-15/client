'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI, electionAPI } from '@/lib/api';

export default function AdminOfficers() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [officers, setOfficers] = useState([]);
    const [elections, setElections] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/login');
        } else if (user) {
            fetchData();
        }
    }, [user, loading, router]);

    const fetchData = async () => {
        try {
            const [usersRes, electionsRes] = await Promise.all([
                adminAPI.getUsers(),
                electionAPI.getAll()
            ]);

            const officerList = usersRes.data.data.filter(u => u.role === 'election_officer');
            setOfficers(officerList);
            setElections(electionsRes.data.data);
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoadingData(false);
        }
    };

    const handleRemoveOfficer = async (officerId) => {
        if (!confirm('Remove officer role from this user? They will become a regular voter.')) {
            return;
        }

        try {
            await adminAPI.updateUserRole(officerId, 'voter');
            setSuccessMessage('Officer demoted to voter successfully!');
            fetchData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update role');
        }
    };

    if (loading || loadingData) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container">
            <header className="header">
                <div className="headerContent">
                    <div>
                        <button onClick={() => router.push('/admin/dashboard')} className="mb-4 text-primary hover:underline flex items-center gap-2">
                            ← Back to Dashboard
                        </button>
                        <h1>Election Officers</h1>
                        <p>Monitor and manage platform staff</p>
                    </div>
                </div>
            </header>

            <main className="main">
                {error && <div className="alert alert-error">{error}</div>}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {officers.length === 0 ? (
                        <div className="md:col-span-3 text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="text-6xl mb-4">👮</div>
                            <h3 className="text-xl font-bold text-gray-500">No Officers Appointed</h3>
                            <p className="text-gray-400">Promote users to officers in the User Management section.</p>
                            <button
                                onClick={() => router.push('/admin/users')}
                                className="mt-4 btn btn-primary"
                            >
                                Go to User Management
                            </button>
                        </div>
                    ) : (
                        officers.map(officer => {
                            const managedElections = elections.filter(e =>
                                (e.createdBy?._id === officer._id || e.createdBy === officer._id)
                            );

                            return (
                                <div key={officer._id} className="card hover:border-primary/30 transition-all border-2 border-transparent">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                                            👤
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{officer.name}</h3>
                                            <p className="text-sm text-gray-500">{officer.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Managed Elections:</span>
                                            <span className="font-bold text-primary">{managedElections.length}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Status:</span>
                                            <span className={`badge ${officer.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {officer.isActive ? 'Active' : 'Suspended'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Verified:</span>
                                            <span className="badge badge-primary">{officer.isVerified ? 'Yes' : 'No'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleRemoveOfficer(officer._id)}
                                            className="btn btn-outline btn-sm text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                            Demote to Voter
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="section mt-12">
                    <h2 className="sectionTitle">Recent Officer Activity</h2>
                    <div className="card">
                        <p className="text-gray-500 italic">Feature coming soon: Detailed activity logs per officer.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
