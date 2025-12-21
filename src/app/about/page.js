'use client';

import { useRouter } from 'next/navigation';

export default function AboutPage() {
    const router = useRouter();

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

            <main className="flex-1 max-w-4xl mx-auto px-4 py-16">
                <section className="text-center mb-16">
                    <h2 className="text-5xl font-extrabold text-gray-900 mb-6">Our Mission</h2>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        To empower every citizen with a secure, transparent, and accessible way to participate in the democratic process.
                    </p>
                </section>

                <div className="space-y-16">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Security First</h3>
                            <p className="text-gray-600 mb-4">
                                Our platform uses state-of-the-art encryption and blockchain-inspired integrity checks to ensure that every vote is counted exactly as cast.
                            </p>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-center gap-2">✅ End-to-end encryption</li>
                                <li className="flex items-center gap-2">✅ Anonymized ballots</li>
                                <li className="flex items-center gap-2">✅ Multi-factor authentication</li>
                            </ul>
                        </div>
                        <div className="bg-indigo-100 rounded-3xl h-64 flex items-center justify-center text-8xl">🛡️</div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="bg-purple-100 rounded-3xl h-64 flex items-center justify-center text-8xl order-2 md:order-1">⚖️</div>
                        <div className="order-1 md:order-2">
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Full Transparency</h3>
                            <p className="text-gray-600 mb-4">
                                Democracy depends on trust. We provide real-time auditing and public verification tools so anyone can verify the integrity of the election results.
                            </p>
                            <p className="text-gray-600">
                                Every action is logged in our immutable audit trail, visible to election officers and administrators.
                            </p>
                        </div>
                    </div>
                </div>

                <section className="mt-20 p-12 bg-white rounded-3xl shadow-xl text-center">
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">Ready to make a difference?</h3>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => router.push('/register')} className="btn btn-primary px-8">Register Now</button>
                        <button onClick={() => router.push('/')} className="btn btn-outline px-8">Back Home</button>
                    </div>
                </section>
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
