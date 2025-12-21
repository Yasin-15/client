'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactPage() {
    const router = useRouter();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white shadow-sm py-4">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <h1
                        className="text-2xl font-bold text-primary cursor-pointer"
                        onClick={() => router.push('/')}
                    >
                        Online Voting System
                    </h1>
                </div>
            </nav>

            <main className="flex-1 max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-16 items-start">
                <div>
                    <h2 className="text-5xl font-extrabold text-gray-900 mb-6">Get in Touch</h2>
                    <p className="text-xl text-gray-600 mb-12">
                        Have questions or encountering issues? Our team is available 24/7 to assist you.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-4 rounded-2xl text-primary text-2xl">📍</div>
                            <div>
                                <h4 className="font-bold text-gray-900">Our Office</h4>
                                <p className="text-gray-600">123 Democracy Way, Tech City, TC 10101</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-4 rounded-2xl text-primary text-2xl">📧</div>
                            <div>
                                <h4 className="font-bold text-gray-900">Email Us</h4>
                                <p className="text-gray-600">support@votingplatform.com</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-4 rounded-2xl text-primary text-2xl">📞</div>
                            <div>
                                <h4 className="font-bold text-gray-900">Call Us</h4>
                                <p className="text-gray-600">+1 (800) VOTE-NOW</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card shadow-2xl p-10">
                    {submitted ? (
                        <div className="text-center py-12 animate-fade-in">
                            <div className="text-7xl mb-6">📩</div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Message Sent!</h3>
                            <p className="text-gray-600 mb-8">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                            <button onClick={() => setSubmitted(false)} className="btn btn-outline px-8">Send Another Message</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input type="text" className="form-input" placeholder="John Doe" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input type="email" className="form-input" placeholder="john@example.com" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subject</label>
                                <select className="form-select">
                                    <option>General Inquiry</option>
                                    <option>Technical Issue</option>
                                    <option>Account Verification</option>
                                    <option>Results Dispute</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Message</label>
                                <textarea className="form-textarea" rows="4" placeholder="How can we help?" required></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary w-full py-4 text-lg">
                                Send Message
                            </button>
                        </form>
                    )}
                </div>
            </main>

            <footer className="bg-gray-900 text-white py-12 px-4 mt-20">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="mb-4 text-gray-400 font-bold">Online Voting System &copy; 2025</p>
                    <div className="flex justify-center gap-8 text-gray-500">
                        <a href="/about" className="hover:text-white">About</a>
                        <a href="/faq" className="hover:text-white">FAQ</a>
                        <a href="/contact" className="hover:text-white">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
