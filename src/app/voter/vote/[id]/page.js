'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { electionAPI, candidateAPI, voteAPI } from '@/lib/api';

export default function VotePage() {
    const router = useRouter();
    const params = useParams();
    const { user, loading, checkAuth } = useAuth();
    const [election, setElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && user.role !== 'voter') {
            router.push('/');
        } else if (user && params.id) {
            fetchElectionData();
            checkVoteStatus();
        }
    }, [user, loading, params.id, router]);

    const fetchElectionData = async () => {
        try {
            const electionRes = await electionAPI.getById(params.id);
            setElection(electionRes.data.data);

            const candidatesRes = await candidateAPI.getAll(params.id);
            const approvedCandidates = candidatesRes.data.data.filter(
                c => c.isVisible
            );
            setCandidates(approvedCandidates);
        } catch (err) {
            setError('Failed to load election data');
            console.error(err);
        } finally {
            setLoadingData(false);
        }
    };

    const checkVoteStatus = async () => {
        // First check local history for faster response
        const alreadyVoted = (user.votingHistory || []).some(v =>
            (typeof v.election === 'object' ? v.election._id : v.election) === params.id
        );

        if (alreadyVoted) {
            setHasVoted(true);
            return;
        }

        try {
            const response = await voteAPI.checkVoted(params.id);
            setHasVoted(response.data.hasVoted);
        } catch (err) {
            console.error('Error checking vote status:', err);
        }
    };

    const handleVoteSubmit = async () => {
        if (!selectedCandidate) {
            setError('Please select a candidate');
            return;
        }

        if (!confirm('Are you sure you want to submit your vote? This action cannot be undone.')) {
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await voteAPI.castVote({
                electionId: params.id,
                candidateId: selectedCandidate
            });

            alert('Vote submitted successfully!');
            await checkAuth();
            router.push('/voter/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit vote');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || loadingData) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user || hasVoted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
                <div className="card max-w-md text-center">
                    <div className="text-6xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold mb-2">Already Voted</h2>
                    <p className="text-gray-600 mb-6">You have already cast your vote in this election.</p>
                    <button onClick={() => router.push('/voter/dashboard')} className="btn btn-primary w-full">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!election) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-8 shadow-lg">
                <div className="max-w-4xl mx-auto px-4">
                    <button
                        onClick={() => router.push('/voter/dashboard')}
                        className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm font-semibold"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{election.title}</h1>
                    <p className="text-indigo-100 text-lg">{election.description}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        <span className="bg-white/20 px-3 py-1 rounded-full">
                            Ends: {new Date(election.endDate).toLocaleString()}
                        </span>
                        <span className="bg-white/20 px-3 py-1 rounded-full">
                            {election.votingType === 'single-choice' ? 'Single Choice' : 'Multiple Choice'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                {error && (
                    <div className="alert alert-error mb-6">
                        {error}
                    </div>
                )}

                {!user.isVerified && (
                    <div className="alert alert-warning mb-6">
                        <strong>Account Not Verified:</strong> Your account must be verified to vote.
                    </div>
                )}

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Candidate</h2>
                    <p className="text-gray-600">Click on a candidate card to select them, then confirm your vote.</p>
                </div>

                {/* Candidates Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {candidates.map((candidate) => (
                        <div
                            key={candidate._id}
                            onClick={() => user.isVerified && setSelectedCandidate(candidate._id)}
                            className={`card cursor-pointer transition-all duration-300 ${selectedCandidate === candidate._id
                                ? 'ring-4 ring-primary shadow-xl scale-105'
                                : 'hover:shadow-xl hover:scale-102'
                                } ${!user.isVerified && 'opacity-50 cursor-not-allowed'}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                    {candidate.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{candidate.name}</h3>
                                    <p className="text-sm font-semibold text-indigo-600 mb-2">{candidate.position}</p>
                                    <p className="text-gray-600 text-sm line-clamp-3">{candidate.manifesto}</p>
                                </div>
                                {selectedCandidate === candidate._id && (
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                            <span className="text-white font-bold">✓</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {candidates.length === 0 && (
                    <div className="card text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Candidates Available</h3>
                        <p className="text-gray-600">There are no candidates available for this election yet.</p>
                    </div>
                )}

                {/* Submit Button */}
                {candidates.length > 0 && user.isVerified && (
                    <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Ready to submit your vote?</h3>
                                <p className="text-sm text-gray-600">
                                    {selectedCandidate
                                        ? `You have selected: ${candidates.find(c => c._id === selectedCandidate)?.name}`
                                        : 'Please select a candidate above'}
                                </p>
                            </div>
                            <button
                                onClick={handleVoteSubmit}
                                disabled={!selectedCandidate || submitting}
                                className="btn btn-primary min-w-[200px]"
                            >
                                {submitting ? 'Submitting...' : 'Submit My Vote'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
