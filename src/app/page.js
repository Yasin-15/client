'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'election_officer') {
        router.push('/officer/dashboard');
      } else {
        router.push('/voter/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                Secure Online
                <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 text-transparent bg-clip-text">
                  Voting System
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 leading-relaxed">
                Cast your vote securely, transparently, and anonymously. Empowering democracy through technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/register')}
                  className="btn btn-primary bg-white text-indigo-600 hover:bg-indigo-50 text-lg px-8 py-4"
                >
                  Get Started
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="btn btn-outline border-white text-white hover:bg-white/10 text-lg px-8 py-4"
                >
                  Sign In
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-[12rem] md:text-[20rem] animate-float">
                🗳️
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
            Why Choose Our Platform?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center hover:-translate-y-2 transition-transform">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Secure & Anonymous</h3>
              <p className="text-gray-600 leading-relaxed">
                Your vote is encrypted and completely anonymous. No one can trace your vote back to you.
              </p>
            </div>
            <div className="card text-center hover:-translate-y-2 transition-transform">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Fast & Reliable</h3>
              <p className="text-gray-600 leading-relaxed">
                Cast your vote in seconds with our optimized platform. Real-time results after election closes.
              </p>
            </div>
            <div className="card text-center hover:-translate-y-2 transition-transform">
              <div className="text-6xl mb-4">✓</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Transparent & Verified</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete audit trail and verification system ensures election integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="text-center max-w-xs">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Register & Verify</h3>
              <p className="text-gray-600">Create your account and verify your identity</p>
            </div>

            <div className="hidden md:block text-4xl text-indigo-500 font-bold">→</div>

            <div className="text-center max-w-xs">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Browse Elections</h3>
              <p className="text-gray-600">View active elections and candidate information</p>
            </div>

            <div className="hidden md:block text-4xl text-indigo-500 font-bold">→</div>

            <div className="text-center max-w-xs">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Cast Your Vote</h3>
              <p className="text-gray-600">Click to vote and receive confirmation</p>
            </div>

            <div className="hidden md:block text-4xl text-indigo-500 font-bold">→</div>

            <div className="text-center max-w-xs">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                4
              </div>
              <h3 className="text-xl font-bold mb-2">View Results</h3>
              <p className="text-gray-600">Check results when published</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-2">
                99.9%
              </div>
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-2">
                256-bit
              </div>
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-2">
                100%
              </div>
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Anonymous</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-2">
                24/7
              </div>
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-4">&copy; 2025 Online Voting System. All rights reserved.</p>
          <div className="flex justify-center gap-8 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
