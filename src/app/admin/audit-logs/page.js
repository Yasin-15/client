'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';


export default function AdminAuditLogs() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        action: '',
        severity: '',
        page: 1,
        limit: 20
    });
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && user.role !== 'admin') {
            router.push('/');
        } else if (user) {
            fetchLogs();
        }
    }, [user, loading, router, filters]);

    const fetchLogs = async () => {
        try {
            const response = await adminAPI.getAuditLogs(filters);
            setLogs(response.data.data);
            setTotalPages(response.data.pages || 1);
        } catch (err) {
            setError('Failed to load audit logs');
            console.error(err);
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getActionIcon = (action) => {
        if (action.includes('vote')) return '🗳️';
        if (action.includes('login') || action.includes('logout')) return '🔐';
        if (action.includes('election')) return '📋';
        if (action.includes('candidate')) return '👤';
        if (action.includes('user')) return '👥';
        if (action.includes('security')) return '⚠️';
        return '📝';
    };

    const getSeverityClass = (severity) => {
        switch (severity) {
            case 'critical':
                return 'badge-danger';
            case 'warning':
                return 'badge-warning';
            default:
                return 'badge-primary';
        }
    };

    if (loading || loadingLogs) {
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
            <header className="header">
                <div className="headerContent">
                    <div>
                        <button onClick={() => router.push('/admin/dashboard')} className="backButton">
                            ← Back to Dashboard
                        </button>
                        <h1>Audit Logs</h1>
                        <p>System activity and security monitoring</p>
                    </div>
                </div>
            </header>

            <main className="main">
                {error && (
                    <div className="alert alert-error">{error}</div>
                )}

                {/* Filters */}
                <div className="card">
                    <div className="filters">
                        <div className="form-group">
                            <label className="form-label">Severity</label>
                            <select
                                className="form-select"
                                value={filters.severity}
                                onChange={(e) => handleFilterChange('severity', e.target.value)}
                            >
                                <option value="">All Severities</option>
                                <option value="info">Info</option>
                                <option value="warning">Warning</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Action Type</label>
                            <select
                                className="form-select"
                                value={filters.action}
                                onChange={(e) => handleFilterChange('action', e.target.value)}
                            >
                                <option value="">All Actions</option>
                                <option value="user_login">User Login</option>
                                <option value="user_logout">User Logout</option>
                                <option value="vote_cast">Vote Cast</option>
                                <option value="election_created">Election Created</option>
                                <option value="security_alert">Security Alert</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Per Page</label>
                            <select
                                className="form-select"
                                value={filters.limit}
                                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Logs List */}
                <div className="section">
                    {logs.length === 0 ? (
                        <div className="card">
                            <div className="emptyState">
                                <div className="emptyIcon">📋</div>
                                <h3>No Logs Found</h3>
                                <p>Adjust your filters or check back later.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="logsList">
                            {logs.map((log) => (
                                <div key={log._id} className="card logCard">
                                    <div className="logHeader">
                                        <div className="logIcon">
                                            {getActionIcon(log.action)}
                                        </div>
                                        <div className="logInfo">
                                            <div className="logAction">
                                                {log.action.replace(/_/g, ' ').toUpperCase()}
                                            </div>
                                            <div className="logTime">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <span className={`badge ${getSeverityClass(log.severity)}`}>
                                            {log.severity}
                                        </span>
                                    </div>

                                    <div className="logDetails">
                                        <div className="logDetail">
                                            <span className="logLabel">Details:</span>
                                            <span className="logValue">{log.details}</span>
                                        </div>

                                        {log.userId && (
                                            <div className="logDetail">
                                                <span className="logLabel">User:</span>
                                                <span className="logValue">
                                                    {log.userId.name} ({log.userId.email})
                                                </span>
                                            </div>
                                        )}

                                        {log.ipAddress && (
                                            <div className="logDetail">
                                                <span className="logLabel">IP Address:</span>
                                                <span className="logValue">
                                                    <code>{log.ipAddress}</code>
                                                </span>
                                            </div>
                                        )}

                                        {log.userAgent && (
                                            <div className="logDetail">
                                                <span className="logLabel">User Agent:</span>
                                                <span className="logValue">
                                                    <code className="userAgent">{log.userAgent}</code>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => handlePageChange(filters.page - 1)}
                            disabled={filters.page === 1}
                            className="btn btn-outline"
                        >
                            ← Previous
                        </button>
                        <span className="pageInfo">
                            Page {filters.page} of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(filters.page + 1)}
                            disabled={filters.page >= totalPages}
                            className="btn btn-outline"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </main>
        </div>

    );
}
