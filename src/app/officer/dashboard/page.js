'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { electionAPI } from '@/lib/api';


export default function OfficerDashboard() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();
    const [elections, setElections] = useState([]);
    const [loadingElections, setLoadingElections] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && user.role !== 'election_officer') {
            if (user.role === 'admin') {
                router.push('/admin/dashboard');
            } else if (user.role === 'voter') {
                router.push('/voter/dashboard');
            }
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
            setElections(officerElections);
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

    const activeElections = elections.filter(e => e.status === 'active');
    const draftElections = elections.filter(e => e.status === 'draft');
    const closedElections = elections.filter(e => e.status === 'closed');

    return (
        <div className="container">
            <header className="header">
                <div className="headerContent">
                    <div>
                        <h1>Officer Dashboard</h1>
                        <p>Welcome, {user.name}!</p>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline">
                        Logout
                    </button>
                </div>
            </header>

            <main className="main">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card statCard">
                        <div className="statIcon">📝</div>
                        <div className="statNumber">{draftElections.length}</div>
                        <div className="statLabel">Draft Elections</div>
                    </div>
                    <div className="card statCard">
                        <div className="statIcon">🗳️</div>
                        <div className="statNumber">{activeElections.length}</div>
                        <div className="statLabel">Active Elections</div>
                    </div>
                    <div className="card statCard">
                        <div className="statIcon">✅</div>
                        <div className="statNumber">{closedElections.length}</div>
                        <div className="statLabel">Closed Elections</div>
                    </div>
                    <div className="card statCard border-primary/20 bg-primary/5">
                        <div className="statIcon">🗳️</div>
                        <div className="statNumber">
                            {elections.reduce((sum, e) => sum + (e.totalVotes || 0), 0)}
                        </div>
                        <div className="statLabel">Total Votes Managed</div>
                    </div>
                </div>

                <div className="section">
                    <h2 className="sectionTitle">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card actionCard">
                            <div className="actionIcon">➕</div>
                            <h3>Create Election</h3>
                            <p>Set up a new election with candidates and dates</p>
                            <button className="btn btn-primary w-full" onClick={() => router.push('/officer/elections/new')}>
                                Create Election
                            </button>
                        </div>

                        <div className="card actionCard">
                            <div className="actionIcon">⚙️</div>
                            <h3>Manage Elections</h3>
                            <p>Edit, start, or close your created elections</p>
                            <button className="btn btn-primary w-full" onClick={() => router.push('/officer/elections')}>
                                Manage My Elections
                            </button>
                        </div>

                        <div className="card actionCard">
                            <div className="actionIcon">👥</div>
                            <h3>Candidates</h3>
                            <p>Manage candidate profiles and approvals</p>
                            <button className="btn btn-primary w-full" onClick={() => router.push('/officer/candidates')}>
                                Manage Candidates
                            </button>
                        </div>

                        <div className="card actionCard">
                            <div className="actionIcon">�</div>
                            <h3>Election Results</h3>
                            <p>Monitor live vote counts and final results</p>
                            <button className="btn btn-primary w-full" onClick={() => router.push('/officer/results')}>
                                View Results
                            </button>
                        </div>

                        <div className="card actionCard">
                            <div className="actionIcon">�👤</div>
                            <h3>My Profile</h3>
                            <p>Update your personal info and password</p>
                            <button className="btn btn-primary w-full" onClick={() => router.push('/profile')}>
                                View Profile
                            </button>
                        </div>

                        <div className="card actionCard">
                            <div className="actionIcon">✅</div>
                            <h3>Verify Voters</h3>
                            <p>Manually verify voter accounts for voting</p>
                            <button className="btn btn-primary w-full" onClick={() => router.push('/officer/voters')}>
                                Verify Voters
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
