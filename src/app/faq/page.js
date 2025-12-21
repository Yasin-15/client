'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FAQPage() {
    const router = useRouter();
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            q: "How secure is my vote?",
            a: "Extremely secure. We use 256-bit AES encryption to protect your ballot. Once cast, your vote is anonymized and stored in a secure database with multiple backups. Only you can verify your specific vote token, but no one can link it back to your identity."
        },
        {
            q: "Who can participate in elections?",
            a: "Participation is restricted to registered and verified voters. Depending on the election type, certain groups (students, employees, residents) may have access to specific ballots based on their profile data."
        },
        {
            q: "Can I change my vote after casting it?",
            a: "No. To ensure election integrity and prevent coercion, once a vote is cast and confirmed, it is final and cannot be modified."
        },
        {
            q: "How do I know the results are accurate?",
            a: "Our system generates a unique verification token for every vote. Election officers publish results after the election closes, and an immutable audit log tracks every change to the system's state."
        },
        {
            q: "What if I lose my login credentials?",
            a: "You can recover your password via your registered email address. For security reasons, Voter IDs cannot be changed and must be kept confidential."
        }
    ];

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
                    <button onClick={() => router.push('/login')} className="btn btn-primary btn-sm">Sign In</button>
                </div>
            </nav>

            <main className="flex-1 max-w-3xl mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-extrabold text-gray-900 mb-6">Frequently Asked Questions</h2>
                    <p className="text-xl text-gray-600">
                        Everything you need to know about how our voting platform works.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="card p-0 overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-lg font-bold text-gray-900">{faq.q}</span>
                                <span className={`text-2xl text-primary transition-transform ${openIndex === index ? 'rotate-45' : ''}`}>
                                    +
                                </span>
                            </button>
                            {openIndex === index && (
                                <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100 animate-slide-down">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-primary text-white p-12 rounded-3xl text-center shadow-2xl">
                    <h3 className="text-3xl font-bold mb-4">Still have questions?</h3>
                    <p className="mb-8 opacity-90">We're here to help you navigate the voting process.</p>
                    <button onClick={() => router.push('/contact')} className="btn bg-white text-primary hover:bg-indigo-50 border-none">
                        Contact Support
                    </button>
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

            <style jsx>{`
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-down {
                    animation: slide-down 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
