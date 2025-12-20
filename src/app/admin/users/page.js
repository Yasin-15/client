'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';


export default function AdminUsers() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && user.role !== 'admin') {
            router.push('/');
        } else if (user) {
            fetchUsers();
        }
    }, [user, loading, router]);

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getUsers();
            setUsers(response.data.data);
        } catch (err) {
            setError('Failed to load users');
            console.error(err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleVerifyUser = async (userId) => {
        try {
            await adminAPI.verifyUser(userId);
            setSuccessMessage('User verified successfully!');
            fetchUsers();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify user');
        }
    };

    const handleSuspendUser = async (userId) => {
        if (!confirm('Are you sure you want to suspend this user?')) {
            return;
        }

        try {
            await adminAPI.suspendUser(userId);
            setSuccessMessage('User suspended successfully!');
            fetchUsers();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to suspend user');
        }
    };

    const handleActivateUser = async (userId) => {
        try {
            await adminAPI.activateUser(userId);
            setSuccessMessage('User activated successfully!');
            fetchUsers();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to activate user');
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        if (!confirm(`Change user role to ${newRole}?`)) {
            return;
        }

        try {
            await adminAPI.updateUserRole(userId, newRole);
            setSuccessMessage('User role updated successfully!');
            fetchUsers();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update role');
        }
    };

    if (loading || loadingUsers) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const verifiedUsers = users.filter(u => u.isVerified);
    const pendingUsers = users.filter(u => !u.isVerified);
    const activeUsers = users.filter(u => u.isActive);

    return (
        <div className="container">
            <header className="header">
                <div className="headerContent">
                    <div>
                        <button onClick={() => router.push('/admin/dashboard')} className="backButton">
                            ← Back to Dashboard
                        </button>
                        <h1>User Management</h1>
                        <p>Manage all users and permissions</p>
                    </div>
                </div>
            </header>

            <main className="main">
                {error && (
                    <div className="alert alert-error">
                        {error}
                        <button onClick={() => setError('')} className="closeAlert">×</button>
                    </div>
                )}

                {successMessage && (
                    <div className="alert alert-success">{successMessage}</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card statCard">
                        <div className="statIcon">👥</div>
                        <div className="statNumber">{users.length}</div>
                        <div className="statLabel">Total Users</div>
                    </div>
                    <div className="card statCard">
                        <div className="statIcon">✅</div>
                        <div className="statNumber">{verifiedUsers.length}</div>
                        <div className="statLabel">Verified Users</div>
                    </div>
                    <div className="card statCard">
                        <div className="statIcon">⏳</div>
                        <div className="statNumber">{pendingUsers.length}</div>
                        <div className="statLabel">Pending Verification</div>
                    </div>
                </div>

                <div className="section">
                    <h2 className="sectionTitle">All Users</h2>

                    {users.length === 0 ? (
                        <div className="card">
                            <div className="emptyState">
                                <div className="emptyIcon">👥</div>
                                <h3>No Users Found</h3>
                                <p>Users will appear here once they register.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="tableWrapper">
                                <table className="usersTable">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Voter ID</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Verified</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u._id}>
                                                <td className="userName">{u.name}</td>
                                                <td>{u.email}</td>
                                                <td><code>{u.voterId}</code></td>
                                                <td>
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                                                        className="roleSelect"
                                                        disabled={u._id === user.id}
                                                    >
                                                        <option value="voter">Voter</option>
                                                        <option value="election_officer">Election Officer</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    {u.isActive ? (
                                                        <span className="badge badge-success">Active</span>
                                                    ) : (
                                                        <span className="badge badge-danger">Suspended</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {u.isVerified ? (
                                                        <span className="badge badge-success">✓ Verified</span>
                                                    ) : (
                                                        <span className="badge badge-warning">Pending</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="actionButtons">
                                                        {!u.isVerified && (
                                                            <button
                                                                onClick={() => handleVerifyUser(u._id)}
                                                                className="actionBtn"
                                                                title="Verify User"
                                                            >
                                                                ✓
                                                            </button>
                                                        )}
                                                        {u.isActive ? (
                                                            <button
                                                                onClick={() => handleSuspendUser(u._id)}
                                                                className="actionBtn dangerBtn"
                                                                title="Suspend User"
                                                                disabled={u._id === user.id}
                                                            >
                                                                🚫
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleActivateUser(u._id)}
                                                                className="actionBtn"
                                                                title="Activate User"
                                                            >
                                                                ✓
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>

    );
}
