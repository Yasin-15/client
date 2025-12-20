'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { electionAPI } from '@/lib/api';

export default function OfficerElections() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [elections, setElections] = useState([]);
    const [loadingElections, setLoadingElections] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && user.role !== 'election_officer' && user.role !== 'admin') {
            router.push('/');
        } else if (user) {
            fetchElections();
        }
    }, [user, loading, router]);

    const fetchElections = async () => {
        try {
            const response = await electionAPI.getAll();
            // Filter to show only elections created by this officer, or all if admin
            const filteredElections = user.role === 'admin'
                ? response.data.data
                : response.data.data.filter(e => e.createdBy?._id === user._id || e.createdBy === user._id);
            setElections(filteredElections);
        } catch (err) {
            setError('Failed to load elections');
            console.error(err);
        } finally {
            setLoadingElections(false);
        }
    };

    const handlePublishResults = async (electionId, currentStatus) => {
        if (currentStatus !== 'closed') {
            setError('Can only publish results for closed elections');
            return;
        }

        try {
            await electionAPI.publishResults(electionId);
            setSuccessMessage('Results published successfully!');
            fetchElections();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to publish results');
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'active': return 'badge-success';
            case 'draft': return 'badge-warning';
            case 'closed': return 'badge-gray';
            default: return 'badge-primary';
        }
    };

    if (loading || loadingElections) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="container">
            <header className="header">
                <div className="headerContent">
                    <div>
                        <button onClick={() => router.push('/officer/dashboard')} className="mb-4 text-primary hover:underline flex items-center gap-2">
                            ← Back to Dashboard
                        </button>
                        <h1>My Elections</h1>
                        <p>Manage and monitor the elections you've created</p>
                    </div>
                    <button
                        onClick={() => router.push('/officer/elections/new')}
                        className="btn btn-primary"
                    >
                        + Create Election
                    </button>
                </div>
            </header>

            <main className="main">
                {error && (
                    <div className="alert alert-error">
                        {error}
                        <button onClick={() => setError('')} className="ml-auto">×</button>
                    </div>
                )}

                {successMessage && (
                    <div className="alert alert-success">
                        {successMessage}
                    </div>
                )}

                {elections.length === 0 ? (
                    <div className="card emptyState">
                        <div className="emptyIcon">🗳️</div>
                        <h3>No Elections Found</h3>
                        <p>You haven't created any elections yet. Click "Create Election" to get started.</p>
                        <button
                            onClick={() => router.push('/officer/elections/new')}
                            className="btn btn-primary mt-6"
                        >
                            Create Your First Election
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {elections.map((election) => (
                            <div key={election._id} className="card hover:shadow-lg transition-all">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{election.title}</h3>
                                            <span className={`badge ${getStatusBadgeClass(election.status)}`}>
                                                {election.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-4">{election.description}</p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-gray-400 font-semibold uppercase text-xs">Starts</span>
                                                <span className="text-gray-900">{new Date(election.startDate).toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-400 font-semibold uppercase text-xs">Ends</span>
                                                <span className="text-gray-900">{new Date(election.endDate).toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-400 font-semibold uppercase text-xs">Candidates</span>
                                                <span className="text-gray-900 font-bold">{election.candidates?.length || 0}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-400 font-semibold uppercase text-xs">Votes Cast</span>
                                                <span className="text-gray-900 font-bold">{election.totalVotes || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center gap-2 min-w-[150px]">
                                        <button
                                            onClick={() => router.push(`/officer/elections/${election._id}/edit`)}
                                            className="btn btn-outline w-full"
                                            disabled={election.status !== 'draft'}
                                        >
                                            Edit Details
                                        </button>

                                        {election.status === 'closed' && !election.resultsPublished && (
                                            <button
                                                onClick={() => handlePublishResults(election._id, election.status)}
                                                className="btn btn-primary w-full"
                                            >
                                                Publish Results
                                            </button>
                                        )}

                                        {election.status === 'active' && (
                                            <div className="text-center py-2 px-4 bg-red-50 text-red-600 rounded-lg font-bold animate-pulse text-sm">
                                                🔴 LIVE NOW
                                            </div>
                                        )}

                                        {(election.status === 'active' || election.status === 'closed') && (
                                            <button
                                                onClick={() => router.push(`/officer/results/${election._id}`)}
                                                className="btn btn-secondary w-full"
                                            >
                                                {election.resultsPublished ? 'View Results' : 'View Live Scores'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
