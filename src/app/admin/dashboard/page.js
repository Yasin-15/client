'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';


export default function AdminDashboard() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && user.role !== 'admin') {
            // Redirect to appropriate dashboard
            if (user.role === 'voter') {
                router.push('/voter/dashboard');
            } else if (user.role === 'election_officer') {
                router.push('/officer/dashboard');
            }
        } else if (user) {
            fetchStats();
        }
    }, [user, loading, router]);

    const fetchStats = async () => {
        try {
            const response = await adminAPI.getStats();
            setStats(response.data.data);
        } catch (err) {
            setError('Failed to load statistics');
            console.error(err);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (loading || loadingStats) {
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
        <div className="container">
            {/* Header */}
            <header className="header">
                <div className="headerContent">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>Welcome, {user.name}!</p>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline">
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="main">
                {error && (
                    <div className="alert alert-error">{error}</div>
                )}

                {/* Stats Overview */}
                {stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="card statCard">
                                <div className="statIcon">👥</div>
                                <div className="statNumber">{stats.overview.totalUsers}</div>
                                <div className="statLabel">Total Users</div>
                                <div className="statSubtext">
                                    {stats.overview.verifiedUsers} verified
                                </div>
                            </div>

                            <div className="card statCard">
                                <div className="statIcon">🗳️</div>
                                <div className="statNumber">{stats.overview.totalElections}</div>
                                <div className="statLabel">Total Elections</div>
                                <div className="statSubtext">
                                    {stats.overview.activeElections} active
                                </div>
                            </div>

                            <div className="card statCard">
                                <div className="statIcon">✅</div>
                                <div className="statNumber">{stats.overview.totalVotes}</div>
                                <div className="statLabel">Total Votes</div>
                                <div className="statSubtext">
                                    All elections
                                </div>
                            </div>

                            <div className="card statCard">
                                <div className="statIcon">📊</div>
                                <div className="statNumber">{stats.overview.voterTurnout}%</div>
                                <div className="statLabel">Voter Turnout</div>
                                <div className="statSubtext">
                                    Average rate
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="section">
                            <h2 className="sectionTitle">Recent Activity</h2>
                            <div className="card">
                                {stats.recentActivity.length === 0 ? (
                                    <p className="emptyText">No recent activity</p>
                                ) : (
                                    <div className="activityList">
                                        {stats.recentActivity.map((activity, index) => (
                                            <div key={index} className="activityItem">
                                                <div className="activityIcon">
                                                    {activity.action.includes('vote') ? '🗳️' :
                                                        activity.action.includes('login') ? '🔐' :
                                                            activity.action.includes('election') ? '📋' : '📝'}
                                                </div>
                                                <div className="activityContent">
                                                    <div className="activityAction">{activity.action.replace(/_/g, ' ')}</div>
                                                    <div className="activityDetails">
                                                        {activity.userId?.name || 'System'} - {activity.details}
                                                    </div>
                                                </div>
                                                <div className="activityTime">
                                                    {new Date(activity.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Security Alerts */}
                        {stats.suspiciousActivities.length > 0 && (
                            <div className="section">
                                <h2 className="sectionTitle">Security Alerts</h2>
                                <div className="card">
                                    <div className="alertsList">
                                        {stats.suspiciousActivities.map((alert, index) => (
                                            <div key={index} className={`alertItem ${alert.severity}`}>
                                                <div className="alertIcon">⚠️</div>
                                                <div className="alertContent">
                                                    <div className="alertAction">{alert.action.replace(/_/g, ' ')}</div>
                                                    <div className="alertDetails">{alert.details}</div>
                                                </div>
                                                <span className={`badge badge-${alert.severity === 'critical' ? 'danger' : 'warning'}`}>
                                                    {alert.severity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Quick Actions */}
                <div className="section">
                    <h2 className="sectionTitle">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card actionCard">
                            <div className="actionIcon">👥</div>
                            <h3>Manage Users</h3>
                            <p>Verify, suspend, or activate user accounts</p>
                            <button className="btn btn-primary w-full" onClick={() => router.push('/admin/users')}>
                                Manage Users
                            </button>
                        </div>

                        <div className="card actionCard">
                            <div className="actionIcon">🗳️</div>
                            <h3>View Elections</h3>
                            <p>Monitor and manage all elections</p>
                            <button className="btn btn-primary w-full" onClick={() => router.push('/admin/elections')}>
                                View Elections
                            </button>
                        </div>

                        <div className="card actionCard">
                            <div className="actionIcon">📋</div>
                            <h3>Audit Logs</h3>
                            <p>View system activity and security logs</p>
                            <button className="btn btn-primary w-full" onClick={() => router.push('/admin/audit-logs')}>
                                View Logs
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>

    );
}
