'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { electionAPI } from '@/lib/api';

export default function EditElection() {
    const router = useRouter();
    const { id } = useParams();
    const { user, loading } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        votingType: 'single-choice',
    });
    const [fetching, setFetching] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && user.role !== 'election_officer' && user.role !== 'admin') {
            router.push('/');
        } else if (user && id) {
            fetchElectionDetails();
        }
    }, [user, loading, router, id]);

    const fetchElectionDetails = async () => {
        try {
            const response = await electionAPI.getById(id);
            const election = response.data.data;

            // Format dates for datetime-local input
            const start = new Date(election.startDate).toISOString().slice(0, 16);
            const end = new Date(election.endDate).toISOString().slice(0, 16);

            setFormData({
                title: election.title,
                description: election.description,
                startDate: start,
                endDate: end,
                votingType: election.votingType,
            });

            if (election.status !== 'draft') {
                setError('Only draft elections can be edited.');
            }
        } catch (err) {
            setError('Failed to load election details');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await electionAPI.update(id, formData);
            router.push('/officer/elections');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update election');
            setSubmitting(false);
        }
    };

    if (loading || fetching) {
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
                        <button onClick={() => router.push('/officer/elections')} className="mb-4 text-primary hover:underline flex items-center gap-2">
                            ← Back to Elections
                        </button>
                        <h1>Edit Election</h1>
                        <p>Modify the details for "{formData.title}"</p>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto">
                <div className="card">
                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-group">
                            <label className="form-label" htmlFor="title">Election Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="form-input"
                                required
                                disabled={error.includes('Only draft')}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-textarea"
                                rows="4"
                                required
                                disabled={error.includes('Only draft')}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label" htmlFor="startDate">Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                    disabled={error.includes('Only draft')}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="endDate">End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    id="endDate"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                    disabled={error.includes('Only draft')}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                className="btn btn-primary flex-1"
                                disabled={submitting || error.includes('Only draft')}
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/officer/elections')}
                                className="btn btn-outline flex-1"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
