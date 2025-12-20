'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { voteAPI, electionAPI } from '@/lib/api';

export default function ResultsPage() {
    const router = useRouter();
    const params = useParams();
    const { user, loading } = useAuth();
    const [election, setElection] = useState(null);
    const [results, setResults] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && params.id) {
            fetchResults();
        }
    }, [loading, params.id]);

    const fetchResults = async () => {
        try {
            const response = await voteAPI.getResults(params.id);
            setElection(response.data.data.election);
            setResults(response.data.data.results);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load results');
            console.error(err);
        } finally {
            setLoadingData(false);
        }
    };

    if (loading || loadingData) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="card max-w-md text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={() => router.back()} className="btn btn-primary">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const maxVotes = Math.max(...results.map(r => r.voteCount), 1);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-8 shadow-lg">
                <div className="max-w-6xl mx-auto px-4">
                    <button
                        onClick={() => router.back()}
                        className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm font-semibold"
                    >
                        ← Go Back
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{election?.title || 'Election Results'}</h1>
                    <div className="flex flex-wrap gap-4 text-sm mt-4">
                        <span className="bg-white/20 px-3 py-1 rounded-full">
                            Total Votes: {election?.totalVotes || 0}
                        </span>
                        <span className="bg-white/20 px-3 py-1 rounded-full">
                            Status: {election?.status?.toUpperCase()}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Winner Card */}
                {results.length > 0 && (
                    <div className="card bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="text-6xl">🏆</div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">Winner</h2>
                                <p className="text-3xl font-bold text-indigo-600 mb-1">{results[0].name}</p>
                                <p className="text-gray-700 font-semibold">{results[0].position}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {results[0].voteCount} votes ({results[0].percentage}%)
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* All Results */}
                <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Results</h2>

                    {results.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Yet</h3>
                            <p className="text-gray-600">Results will appear once voting ends.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {results.map((candidate, index) => (
                                <div key={candidate.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                                                <p className="text-sm text-gray-600">{candidate.position}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900">{candidate.voteCount}</p>
                                            <p className="text-sm text-gray-600">votes</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 flex items-center justify-end px-4 ${index === 0
                                                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                                                    : index === 1
                                                        ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                                                        : index === 2
                                                            ? 'bg-gradient-to-r from-orange-300 to-orange-400'
                                                            : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                                                }`}
                                            style={{ width: `${(candidate.voteCount / maxVotes) * 100}%` }}
                                        >
                                            <span className="text-sm font-bold text-white">{candidate.percentage}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Statistics */}
                {results.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                        <div className="card text-center">
                            <div className="text-4xl mb-2">👥</div>
                            <p className="text-3xl font-bold text-gray-900">{election?.totalVotes || 0}</p>
                            <p className="text-gray-600">Total Votes Cast</p>
                        </div>
                        <div className="card text-center">
                            <div className="text-4xl mb-2">📊</div>
                            <p className="text-3xl font-bold text-gray-900">{results.length}</p>
                            <p className="text-gray-600">Total Candidates</p>
                        </div>
                        <div className="card text-center">
                            <div className="text-4xl mb-2">🏆</div>
                            <p className="text-3xl font-bold text-gray-900">{results[0]?.percentage}%</p>
                            <p className="text-gray-600">Winning Percentage</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
