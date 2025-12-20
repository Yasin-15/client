'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { electionAPI } from '@/lib/api';

export default function CreateElection() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        votingType: 'single-choice',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && user.role !== 'election_officer' && user.role !== 'admin') {
            router.push('/');
        }
    }, [user, loading, router]);

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
            await electionAPI.create(formData);
            router.push('/officer/elections');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create election');
            setSubmitting(false);
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
                        <h1>Create New Election</h1>
                        <p>Configure the details for a new voting event</p>
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
                                placeholder="e.g. Presidential Election 2024"
                                required
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
                                placeholder="Provide details about the election..."
                                rows="4"
                                required
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
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="votingType">Voting Type</label>
                            <select
                                id="votingType"
                                name="votingType"
                                value={formData.votingType}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="single-choice">Single Choice (Voter picks one)</option>
                                <option value="multiple-choice" disabled>Multiple Choice (Coming Soon)</option>
                            </select>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                className="btn btn-primary flex-1"
                                disabled={submitting}
                            >
                                {submitting ? 'Creating...' : 'Create Election'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/officer/dashboard')}
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
