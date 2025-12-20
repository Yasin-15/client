'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { voteAPI } from '@/lib/api';

export default function OfficerResultsPage() {
    const router = useRouter();
    const params = useParams();
    const { user, loading } = useAuth();
    const [election, setElection] = useState(null);
    const [results, setResults] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && user.role !== 'election_officer' && user.role !== 'admin') {
            router.push('/');
        } else if (user && params.id) {
            fetchResults();
        }
    }, [user, loading, params.id, router]);

    const fetchResults = async () => {
        try {
            const response = await voteAPI.getLiveResults(params.id);
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
            <div className="container text-center py-20">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold mb-2">Error</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button onClick={() => router.back()} className="btn btn-primary">
                    Go Back
                </button>
            </div>
        );
    }

    const maxVotes = Math.max(...results.map(r => r.voteCount), 1);

    return (
        <div className="container">
            <header className="header">
                <div className="headerContent">
                    <div>
                        <button onClick={() => router.back()} className="mb-4 text-primary hover:underline flex items-center gap-2">
                            ← Back
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">{election?.title || 'Election Results'}</h1>
                        <p className="text-gray-500">
                            {election?.resultsPublished
                                ? 'Official results and analytics'
                                : `Live monitoring • Last updated: ${new Date().toLocaleTimeString()}`}
                        </p>
                    </div>
                </div>
            </header>

            <main className="main">
                {/* Winner Card */}
                {results.length > 0 && (
                    <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 mb-8 items-center flex gap-6 p-8">
                        <div className="text-6xl bg-white p-4 rounded-2xl shadow-sm">🏆</div>
                        <div className="flex-1">
                            <h2 className="text-sm font-bold text-yellow-600 uppercase tracking-widest mb-1">Declared Winner</h2>
                            <p className="text-3xl font-extrabold text-gray-900">{results[0].name}</p>
                            <p className="text-gray-600 font-medium">{results[0].position}</p>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-primary">{results[0].voteCount}</span>
                                <span className="text-gray-500 text-sm font-bold uppercase">Votes ({results[0].percentage}%)</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Vote Distribution</h2>
                            <div className="space-y-8">
                                {results.map((candidate, index) => (
                                    <div key={candidate.id} className="relative">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <h3 className="font-bold text-gray-900">{candidate.name}</h3>
                                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{candidate.position}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-bold text-gray-900">{candidate.voteCount}</span>
                                                <span className="text-gray-400 text-xs ml-1 font-bold">({candidate.percentage}%)</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-primary' : 'bg-gray-400'
                                                    }`}
                                                style={{ width: `${(candidate.voteCount / maxVotes) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="card statCard">
                            <div className="statIcon">🗳️</div>
                            <div className="statNumber">{election?.totalVotes || 0}</div>
                            <div className="statLabel">Total Votes Cast</div>
                        </div>
                        <div className="card statCard">
                            <div className="statIcon">👥</div>
                            <div className="statNumber">{results.length}</div>
                            <div className="statLabel">Candidates</div>
                        </div>
                        <div className="card statCard">
                            <div className="statIcon">📊</div>
                            <div className="statNumber">{results[0]?.percentage}%</div>
                            <div className="statLabel">Winning Margin</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
