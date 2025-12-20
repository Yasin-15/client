'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { electionAPI, voteAPI } from '@/lib/api';

export default function VoterDashboard() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();
    const [elections, setElections] = useState([]);
    const [votedElections, setVotedElections] = useState(new Set());
    const [loadingElections, setLoadingElections] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && user.role !== 'voter') {
            if (user.role === 'admin') {
                router.push('/admin/dashboard');
            } else if (user.role === 'election_officer') {
                router.push('/officer/dashboard');
            }
        } else if (user) {
            fetchElections();
        }
    }, [user, loading, router]);

    const fetchElections = async () => {
        try {
            const response = await electionAPI.getActive();
            setElections(response.data.data);

            // Use voting history from user context instead of making individual API calls
            const votedSet = new Set(
                (user.votingHistory || []).map(v =>
                    typeof v.election === 'object' ? v.election._id : v.election
                )
            );
            setVotedElections(votedSet);
        } catch (err) {
            setError('Failed to load elections');
            console.error(err);
        } finally {
            setLoadingElections(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const handleVote = (electionId) => {
        router.push(`/voter/vote/${electionId}`);
    };

    const handleViewResults = (electionId) => {
        router.push(`/voter/results/${electionId}`);
    };

    if (loading || loadingElections) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-8 shadow-lg">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Voter Dashboard</h1>
                            <p className="text-indigo-100 text-lg">Welcome, {user.name}!</p>
                        </div>
                        <button onClick={handleLogout} className="btn btn-outline border-white text-white hover:bg-white/10">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* User Info Card */}
                <div className="card mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-gray-200">Your Information</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="font-semibold text-gray-700">Email:</span>
                            <span className="text-gray-900">{user.email}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="font-semibold text-gray-700">Voter ID:</span>
                            <span className="text-gray-900 font-mono">{user.voterId}</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="font-semibold text-gray-700">Verification Status:</span>
                            <span>
                                {user.isVerified ? (
                                    <span className="badge badge-success">Verified</span>
                                ) : (
                                    <span className="badge badge-warning">Pending Verification</span>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Verification Notice */}
                {!user.isVerified && (
                    <div className="alert alert-warning mb-8">
                        <strong>Account Verification Required:</strong> Your account needs to be verified by an administrator before you can vote.
                    </div>
                )}

                {/* Active Elections */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Elections</h2>

                    {error && (
                        <div className="alert alert-error mb-6">{error}</div>
                    )}

                    {elections.length === 0 ? (
                        <div className="card text-center py-16">
                            <div className="text-8xl mb-4 opacity-50">🗳️</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Elections</h3>
                            <p className="text-gray-600">There are currently no active elections. Check back later!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {elections.map((election) => {
                                const hasVoted = votedElections.has(election._id);
                                const canVote = user.isVerified && !hasVoted;

                                return (
                                    <div key={election._id} className="card hover:shadow-xl transition-all">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-4 border-b-2 border-gray-200 mb-6">
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{election.title}</h3>
                                                <p className="text-gray-600 leading-relaxed">{election.description}</p>
                                            </div>
                                            <span className="badge badge-success flex-shrink-0">Active</span>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                                            <div>
                                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Voting Type:</span>
                                                <span className="text-base font-semibold text-gray-900">
                                                    {election.votingType === 'single-choice' ? 'Single Choice' : 'Multiple Choice'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ends:</span>
                                                <span className="text-base font-semibold text-gray-900">
                                                    {new Date(election.endDate).toLocaleDateString()} at{' '}
                                                    {new Date(election.endDate).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Candidates:</span>
                                                <span className="text-base font-semibold text-gray-900">{election.candidates?.length || 0}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 items-center justify-end">
                                            {hasVoted ? (
                                                <>
                                                    <span className="badge badge-success">✓ You've Voted</span>
                                                    {election.resultsPublished && (
                                                        <button
                                                            onClick={() => handleViewResults(election._id)}
                                                            className="btn btn-outline"
                                                        >
                                                            View Results
                                                        </button>
                                                    )}
                                                </>
                                            ) : canVote ? (
                                                <button
                                                    onClick={() => handleVote(election._id)}
                                                    className="btn btn-primary"
                                                >
                                                    Vote Now
                                                </button>
                                            ) : (
                                                <button className="btn btn-primary" disabled>
                                                    {!user.isVerified ? 'Account Not Verified' : 'Cannot Vote'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Voting History */}
                {user.votingHistory && user.votingHistory.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Voting History</h2>
                        <div className="card overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Election</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Voted At</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {user.votingHistory.map((vote, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-900">{vote.election?.title || 'Unknown Election'}</td>
                                            <td className="px-6 py-4 text-gray-900">{new Date(vote.votedAt).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className="badge badge-success">Completed</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
