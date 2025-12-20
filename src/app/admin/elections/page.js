'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { electionAPI, candidateAPI } from '@/lib/api';


export default function AdminElections() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [elections, setElections] = useState([]);
    const [loadingElections, setLoadingElections] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && user.role !== 'admin') {
            router.push('/');
        } else if (user) {
            fetchElections();
        }
    }, [user, loading, router]);

    const fetchElections = async () => {
        try {
            const response = await electionAPI.getAll();
            setElections(response.data.data);
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

    const handleDeleteElection = async (electionId, totalVotes) => {
        if (totalVotes > 0) {
            setError('Cannot delete an election with votes');
            return;
        }

        if (!confirm('Are you sure you want to delete this election?')) {
            return;
        }

        try {
            await electionAPI.delete(electionId);
            setSuccessMessage('Election deleted successfully!');
            fetchElections();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete election');
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'active':
                return 'badge-success';
            case 'draft':
                return 'badge-warning';
            case 'closed':
                return 'badge-gray';
            default:
                return 'badge-primary';
        }
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
        <div className={"container"}>
            {/* Header */}
            <header className={"header"}>
                <div className={"headerContent"}>
                    <div>
                        <button onClick={() => router.push('/admin/dashboard')} className={"backButton"}>
                            ← Back to Dashboard
                        </button>
                        <h1>Election Management</h1>
                        <p>Manage all elections and results</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={"main"}>
                {error && (
                    <div className="alert alert-error">
                        {error}
                        <button onClick={() => setError('')} className={"closeAlert"}>×</button>
                    </div>
                )}

                {successMessage && (
                    <div className="alert alert-success">
                        {successMessage}
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-3">
                    <div className={`card ${"statCard"}`}>
                        <div className={"statIcon"}>📝</div>
                        <div className={"statNumber"}>{draftElections.length}</div>
                        <div className={"statLabel"}>Draft Elections</div>
                    </div>
                    <div className={`card ${"statCard"}`}>
                        <div className={"statIcon"}>🗳️</div>
                        <div className={"statNumber"}>{activeElections.length}</div>
                        <div className={"statLabel"}>Active Elections</div>
                    </div>
                    <div className={`card ${"statCard"}`}>
                        <div className={"statIcon"}>✅</div>
                        <div className={"statNumber"}>{closedElections.length}</div>
                        <div className={"statLabel"}>Closed Elections</div>
                    </div>
                </div>

                {/* Elections List */}
                <div className={"section"}>
                    <div className={"sectionHeader"}>
                        <h2 className={"sectionTitle"}>All Elections</h2>
                    </div>

                    {elections.length === 0 ? (
                        <div className="card">
                            <div className={"emptyState"}>
                                <div className={"emptyIcon"}>🗳️</div>
                                <h3>No Elections Yet</h3>
                                <p>Elections will appear here once created.</p>
                            </div>
                        </div>
                    ) : (
                        <div className={"electionsList"}>
                            {elections.map((election) => (
                                <div key={election._id} className={`card ${"electionCard"}`}>
                                    <div className={"electionHeader"}>
                                        <div className={"electionTitle"}>
                                            <h3>{election.title}</h3>
                                            <span className={`badge ${getStatusBadgeClass(election.status)}`}>
                                                {election.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className={"electionDesc"}>{election.description}</p>
                                    </div>

                                    <div className={"electionDetails"}>
                                        <div className={"detailRow"}>
                                            <div className={"detailItem"}>
                                                <span className={"detailLabel"}>Start Date:</span>
                                                <span className={"detailValue"}>
                                                    {new Date(election.startDate).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className={"detailItem"}>
                                                <span className={"detailLabel"}>End Date:</span>
                                                <span className={"detailValue"}>
                                                    {new Date(election.endDate).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={"detailRow"}>
                                            <div className={"detailItem"}>
                                                <span className={"detailLabel"}>Voting Type:</span>
                                                <span className={"detailValue"}>
                                                    {election.votingType === 'single-choice' ? 'Single Choice' : 'Multiple Choice'}
                                                </span>
                                            </div>
                                            <div className={"detailItem"}>
                                                <span className={"detailLabel"}>Candidates:</span>
                                                <span className={"detailValue"}>
                                                    {election.candidates?.length || 0}
                                                </span>
                                            </div>
                                            <div className={"detailItem"}>
                                                <span className={"detailLabel"}>Total Votes:</span>
                                                <span className={"detailValue"}>
                                                    {election.totalVotes || 0}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={"detailRow"}>
                                            <div className={"detailItem"}>
                                                <span className={"detailLabel"}>Results Published:</span>
                                                <span className={"detailValue"}>
                                                    {election.resultsPublished ? (
                                                        <span className="badge badge-success">Yes</span>
                                                    ) : (
                                                        <span className="badge badge-warning">No</span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className={"detailItem"}>
                                                <span className={"detailLabel"}>Created By:</span>
                                                <span className={"detailValue"}>
                                                    {election.createdBy?.name || 'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={"electionActions"}>
                                        {election.status === 'closed' && !election.resultsPublished && (
                                            <button
                                                onClick={() => handlePublishResults(election._id, election.status)}
                                                className="btn btn-primary"
                                            >
                                                Publish Results
                                            </button>
                                        )}

                                        {(election.status === 'active' || election.status === 'closed') && (
                                            <button
                                                onClick={() => router.push(`/officer/results/${election._id}`)}
                                                className="btn btn-outline"
                                            >
                                                {election.resultsPublished ? 'View Results' : 'View Live Scores'}
                                            </button>
                                        )}

                                        {election.totalVotes === 0 && (
                                            <button
                                                onClick={() => handleDeleteElection(election._id, election.totalVotes)}
                                                className="btn btn-danger"
                                            >
                                                Delete
                                            </button>
                                        )}

                                        {election.status === 'active' && (
                                            <span className={"liveIndicator"}>
                                                🔴 Live Now
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
