'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { candidateAPI, electionAPI } from '@/lib/api';

export default function CandidateManagement() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [candidates, setCandidates] = useState([]);
    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState('');
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [candidateData, setCandidateData] = useState({
        name: '',
        position: '',
        bio: '',
        party: ''
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && user.role !== 'election_officer' && user.role !== 'admin') {
            router.push('/');
        } else if (user) {
            fetchInitialData();
        }
    }, [user, loading, router]);

    const fetchInitialData = async () => {
        try {
            const electionsRes = await electionAPI.getAll();
            const officerElections = user.role === 'admin'
                ? electionsRes.data.data
                : electionsRes.data.data.filter(e => e.createdBy?._id === user._id || e.createdBy === user._id);

            setElections(officerElections);

            if (officerElections.length > 0) {
                setSelectedElection(officerElections[0]._id);
                fetchCandidates(officerElections[0]._id);
            } else {
                setLoadingData(false);
            }
        } catch (err) {
            setError('Failed to load initial data');
            setLoadingData(false);
        }
    };

    const fetchCandidates = async (electionId) => {
        try {
            setLoadingData(true);
            const response = await candidateAPI.getAll(electionId);
            setCandidates(response.data.data);
        } catch (err) {
            setError('Failed to load candidates');
        } finally {
            setLoadingData(false);
        }
    };

    const handleElectionChange = (e) => {
        const electionId = e.target.value;
        setSelectedElection(electionId);
        fetchCandidates(electionId);
    };

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        try {
            await candidateAPI.create({
                ...candidateData,
                election: selectedElection
            });
            setSuccessMessage('Candidate added successfully!');
            setCandidateData({ name: '', position: '', bio: '', party: '' });
            setShowAddForm(false);
            fetchCandidates(selectedElection);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add candidate');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to remove this candidate?')) return;
        try {
            await candidateAPI.delete(id);
            setSuccessMessage('Candidate removed successfully!');
            fetchCandidates(selectedElection);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove candidate');
        }
    };

    const handleApprove = async (id) => {
        try {
            await candidateAPI.approve(id);
            setSuccessMessage('Candidate approved successfully!');
            fetchCandidates(selectedElection);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve candidate');
        }
    };

    if (loading) {
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
                        <h1>Candidate Management</h1>
                        <p>Register and manage candidates for your elections</p>
                    </div>
                    {selectedElection && (
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="btn btn-primary"
                        >
                            {showAddForm ? 'Cancel' : '+ Add Candidate'}
                        </button>
                    )}
                </div>
            </header>

            <main className="main">
                {error && <div className="alert alert-error">{error}</div>}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}

                {showAddForm && (
                    <div className="card mb-8 border-2 border-primary/20">
                        <h2 className="text-xl font-bold mb-4">Add New Candidate</h2>
                        <form onSubmit={handleAddCandidate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    className="form-input"
                                    value={candidateData.name}
                                    onChange={(e) => setCandidateData({ ...candidateData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Position</label>
                                <input
                                    className="form-input"
                                    value={candidateData.position}
                                    onChange={(e) => setCandidateData({ ...candidateData, position: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group md:col-span-2">
                                <label className="form-label">Biography</label>
                                <textarea
                                    className="form-textarea"
                                    value={candidateData.bio}
                                    onChange={(e) => setCandidateData({ ...candidateData, bio: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <button type="submit" className="btn btn-primary w-full">Save Candidate</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="card mb-8">
                    <div className="form-group max-w-md">
                        <label className="form-label" htmlFor="electionSelect">Select Election</label>
                        <select
                            id="electionSelect"
                            className="form-select"
                            value={selectedElection}
                            onChange={handleElectionChange}
                        >
                            <option value="">-- Choose an election --</option>
                            {elections.map(e => (
                                <option key={e._id} value={e._id}>{e.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loadingData ? (
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                ) : !selectedElection ? (
                    <div className="card emptyState">
                        <div className="emptyIcon">🔍</div>
                        <h3>Select an Election</h3>
                        <p>Choose an election from the dropdown above to manage its candidates.</p>
                    </div>
                ) : candidates.length === 0 ? (
                    <div className="card emptyState">
                        <div className="emptyIcon">👥</div>
                        <h3>No Candidates Yet</h3>
                        <p>There are no candidates registered for this election yet.</p>
                    </div>
                ) : (
                    <div className="tableWrapper card p-0">
                        <table className="usersTable">
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Position</th>
                                    <th>Votes</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {candidates.map((candidate) => (
                                    <tr key={candidate._id}>
                                        <td>
                                            <div className="font-bold text-gray-900">{candidate.name}</div>
                                            <div className="text-xs text-gray-500 max-w-xs truncate">{candidate.bio}</div>
                                        </td>
                                        <td>{candidate.position}</td>
                                        <td className="font-bold text-primary">{candidate.voteCount || 0}</td>
                                        <td>
                                            <span className={`badge ${candidate.isApproved ? 'badge-success' : 'badge-warning'}`}>
                                                {candidate.isApproved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="actionButtons">
                                            {(user.role === 'admin' || user.role === 'election_officer') && !candidate.isApproved && (
                                                <button
                                                    onClick={() => handleApprove(candidate._id)}
                                                    className="actionBtn bg-green-50 text-green-600 hover:bg-green-600"
                                                    title="Approve"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(candidate._id)}
                                                className="actionBtn dangerBtn"
                                                title="Remove"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
