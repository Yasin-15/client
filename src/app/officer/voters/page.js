'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';

export default function OfficerVoterVerification() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [users, setUsers] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!loading && (!user || (user.role !== 'election_officer' && user.role !== 'admin'))) {
            router.push('/login');
        } else if (user) {
            fetchUsers();
        }
    }, [user, loading, router]);

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getUsers();
            // Filter only voters for this view
            const voters = response.data.data.filter(u => u.role === 'voter');
            setUsers(voters);
        } catch (err) {
            setError('Failed to load voters');
        } finally {
            setLoadingData(false);
        }
    };

    const handleVerify = async (userId) => {
        try {
            await adminAPI.verifyUser(userId);
            setSuccessMessage('Voter verified successfully!');
            fetchUsers();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify voter');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.voterId.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        <button onClick={() => router.push('/officer/dashboard')} className="mb-4 text-primary hover:underline flex items-center gap-2">
                            ← Back to Dashboard
                        </button>
                        <h1>Voter Verification</h1>
                        <p>Verify voter identities to allow them to cast ballots</p>
                    </div>
                </div>
            </header>

            <main className="main">
                {error && <div className="alert alert-error">{error}</div>}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}

                <div className="card mb-8">
                    <div className="form-group flex gap-4">
                        <div className="flex-1">
                            <label className="form-label">Search Voter</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by name, email, or Voter ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="section">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUsers.length === 0 ? (
                            <div className="md:col-span-3 text-center py-12 card bg-gray-50 border-none shadow-none">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-gray-400">No matching voters found</h3>
                            </div>
                        ) : (
                            filteredUsers.map(voter => (
                                <div key={voter._id} className={`card ${voter.isVerified ? 'opacity-75 bg-gray-50' : 'border-2 border-yellow-100'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{voter.name}</h3>
                                            <p className="text-sm text-gray-500">{voter.email}</p>
                                        </div>
                                        <div className={`badge ${voter.isVerified ? 'badge-success' : 'badge-warning'}`}>
                                            {voter.isVerified ? 'Verified' : 'Pending'}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Voter ID:</span>
                                            <span className="font-mono bg-gray-100 px-2 rounded">{voter.voterId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">National ID:</span>
                                            <span className="font-semibold">{voter.nationalId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Joined:</span>
                                            <span>{new Date(voter.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {!voter.isVerified && (
                                        <button
                                            onClick={() => handleVerify(voter._id)}
                                            className="btn btn-primary w-full py-2 flex items-center justify-center gap-2"
                                        >
                                            ✅ Verify Voter
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
