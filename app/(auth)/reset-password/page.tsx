'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate Firebase sendPasswordResetEmail flow
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-200/20 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-200/20 blur-3xl" />

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-xl relative z-10 animate-fade-in-up">
        
        {submitted ? (
          <div className="text-center py-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-slate-800">Reset Email Sent</h1>
            <p className="mt-2 text-sm text-slate-500">
              If an account is associated with <span className="font-semibold text-slate-700">{email}</span>, 
              we have sent instructions to reset your password.
            </p>

            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 mt-8 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-cyan-700 transition"
            >
              Return to Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div>
            <h1 className="text-xl font-bold text-slate-800">Reset Password</h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your clinical email address and we'll dispatch a link to securely reset your credentials.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@hospital.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-cyan-700 transition disabled:opacity-50"
              >
                {loading ? 'Sending Request...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs">
              <Link href="/login" className="font-semibold text-slate-500 hover:text-cyan-600">
                Cancel and Go Back
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
