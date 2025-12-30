'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
    const router = useRouter();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        voterId: '',
        nationalId: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const userData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                voterId: formData.voterId,
                nationalId: formData.nationalId,
                phone: formData.phone
            };

            await register(userData);
            router.push('/voter/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto max-h-screen">
                <div className="w-full max-w-xl animate-fade-in py-8">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">🗳️</div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                        <p className="text-gray-600">Register to start voting</p>
                    </div>

                    {error && (
                        <div className="alert alert-error mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="form-label">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="form-input bg-white"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Your Name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input bg-white"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Your Email"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="voterId" className="form-label">Voter ID</label>
                                <input
                                    type="text"
                                    id="voterId"
                                    name="voterId"
                                    className="form-input bg-white"
                                    value={formData.voterId}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your Voter ID"
                                />
                            </div>

                            <div>
                                <label htmlFor="nationalId" className="form-label">National/Student ID</label>
                                <input
                                    type="text"
                                    id="nationalId"
                                    name="nationalId"
                                    className="form-input bg-white"
                                    value={formData.nationalId}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your National/Student ID"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="form-label">Phone (Optional)</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                className="form-input bg-white"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Your Phone Number"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-input bg-white"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Minimum 6 characters"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className="form-input bg-white"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="Re-enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="spinner !w-5 !h-5 !border-2"></div>
                                    Creating Account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <a href="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                                Sign in here
                            </a>
                        </p>
                        <div className="mt-4">
                            <a href="/" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                                ← Back to Home
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Image */}
            <div
                className="hidden lg:block w-1/2 bg-cover bg-center relative"
                style={{
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.4)), url('/auth-bg.png')`,
                    backgroundColor: '#0f172a'
                }}
            >
                <div className="absolute inset-0 flex items-center justify-center text-white p-12 text-center">
                    <div>
                        <h2 className="text-4xl font-bold mb-4">Join the Future of Voting</h2>
                        <p className="text-lg text-gray-200">
                            Create your account today and participate in secure, transparent, and accessible elections.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
            `}</style>
        </div>
    );
}
