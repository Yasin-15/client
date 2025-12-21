'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { electionAPI } from '@/lib/api';

export default function OfficerResultsList() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [elections, setElections] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');

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
            const officerElections = user.role === 'admin'
                ? response.data.data
                : response.data.data.filter(e => e.createdBy?._id === user._id || e.createdBy === user._id);

            // Filter only active or closed elections for results viewing
            setElections(officerElections.filter(e => e.status !== 'draft'));
        } catch (err) {
            setError('Failed to load elections');
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

    return (
        <div className="container">
            <header className="header">
                <div className="headerContent">
                    <div>
                        <button onClick={() => router.push('/officer/dashboard')} className="mb-4 text-primary hover:underline flex items-center gap-2">
                            ← Back to Dashboard
                        </button>
                        <h1>Election Results & Live Monitoring</h1>
                        <p>Track voter turnout and candidate scores in real-time</p>
                    </div>
                </div>
            </header>

            <main className="main">
                {error && <div className="alert alert-error">{error}</div>}

                {elections.length === 0 ? (
                    <div className="card text-center py-16">
                        <div className="text-8xl mb-4 opacity-50">📊</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Results Available</h3>
                        <p className="text-gray-600">Once your elections move past the "Draft" stage, you'll be able to monitor scores here.</p>
                        <button onClick={() => router.push('/officer/elections')} className="btn btn-primary mt-6">
                            Go to My Elections
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {elections.map((election) => (
                            <div key={election._id} className="card hover:shadow-xl transition-all border-2 border-transparent hover:border-primary/20">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{election.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className={`badge ${election.status === 'active' ? 'badge-success animate-pulse' : 'badge-gray'}`}>
                                        {election.status === 'active' ? 'LIVE' : 'CLOSED'}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center justify-between">
                                    <div>
                                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Turnout</span>
                                        <span className="text-2xl font-black text-primary">{election.totalVotes || 0}</span>
                                        <span className="text-gray-400 text-sm ml-1 font-bold">Votes</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Candidates</span>
                                        <span className="text-2xl font-black text-gray-700">{election.candidates?.length || 0}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => router.push(`/officer/results/${election._id}`)}
                                        className="btn btn-primary flex-1"
                                    >
                                        {election.status === 'active' ? '📊 View Live Scores' : '📈 View Final Results'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
