'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/store';
import { StaffRole } from '@/types';
import { Activity, ShieldCheck, Stethoscope, HeartPulse, User, Lock, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const login = useStore((state) => state.login);
  const authLoading = useStore((state) => state.authLoading);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<StaffRole>('doctor');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please enter your email or name identifier.');
      return;
    }

    const success = await login(email, role);
    if (success) {
      // Redirect based on role
      if (role === 'admin') router.push('/dashboard');
      else if (role === 'doctor') router.push('/dashboard/doctor');
      else if (role === 'nurse') router.push('/dashboard/nurse');
      else if (role === 'patient') router.push('/dashboard/patient');
    } else {
      setErrorMsg('Access failed. Please check credentials or selected role.');
    }
  };

  // Helper for quick login demo bypass
  const handleQuickLogin = async (demoEmail: string, demoRole: StaffRole) => {
    setErrorMsg('');
    setEmail(demoEmail);
    setRole(demoRole);
    const success = await login(demoEmail, demoRole);
    if (success) {
      if (demoRole === 'admin') router.push('/dashboard');
      else if (demoRole === 'doctor') router.push('/dashboard/doctor');
      else if (demoRole === 'nurse') router.push('/dashboard/nurse');
      else if (demoRole === 'patient') router.push('/dashboard/patient');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-200/20 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-200/20 blur-3xl" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Pitch Branding Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between p-8 rounded-2xl bg-gradient-to-br from-cyan-700 to-teal-800 text-white shadow-xl">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
              <Activity className="h-6 w-6 text-cyan-200" />
            </div>
            <span className="font-bold text-xl tracking-tight">SehatSetu</span>
          </div>

          <div className="my-12">
            <h1 className="text-3xl font-extrabold leading-tight">AI-Powered Hospital Command</h1>
            <p className="mt-4 text-cyan-100 text-sm leading-relaxed">
              Bridging clinical care with predictive operations. Our integrated LLM pipelines assist doctors with documentation, triage alerts for nurses, and optimize capacity maps for administration.
            </p>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="flex gap-4 items-center">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-cyan-200 font-medium">IGNITE 2026 Hackathon Core Platform</span>
            </div>
          </div>
        </div>

        {/* Auth Interface */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="glass-panel rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-sm text-slate-500 mt-1">Authenticate into your SehatSetu dashboard</p>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              
              {/* Role Picker */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Access Scope</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {(['admin', 'doctor', 'nurse', 'patient'] as StaffRole[]).map((r) => {
                    const icons = {
                      admin: <ShieldCheck className="h-4 w-4" />,
                      doctor: <Stethoscope className="h-4 w-4" />,
                      nurse: <HeartPulse className="h-4 w-4" />,
                      patient: <User className="h-4 w-4" />
                    };
                    const selected = role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold capitalize transition ${
                          selected 
                            ? 'bg-cyan-600 border-cyan-600 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {icons[r]}
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Identifier / Email</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'patient' ? 'Patient Name or Phone' : 'yourname@sehatsetu.com'}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Credential Password</label>
                  <Link href="/reset-password" className="text-xs font-semibold text-cyan-600 hover:text-cyan-700">
                    Forgot?
                  </Link>
                </div>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-2 mt-2 py-3 bg-cyan-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 disabled:opacity-50 transition"
              >
                {authLoading ? 'Verifying Credentials...' : 'Authenticate'}
                <ArrowRight className="h-4 w-4" />
              </button>

            </form>

            <div className="mt-4 text-center">
              <span className="text-xs text-slate-400">
                New clinical user?{' '}
                <Link href="/register" className="font-semibold text-cyan-600 hover:text-cyan-700">
                  Register Account
                </Link>
              </span>
            </div>

            {/* Quick Login Evaluation Panel */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Quick Clinical Access (Demo Mode)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@sehatsetu.com', 'admin')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition text-left"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Aditya Sen</span>
                    <span className="text-[10px] text-slate-400 block">Administrator</span>
                  </div>
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('doctor@sehatsetu.com', 'doctor')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition text-left"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Dr. Sarah Jenkins</span>
                    <span className="text-[10px] text-slate-400 block">Cardiology Lead</span>
                  </div>
                  <Stethoscope className="h-4 w-4 text-cyan-600" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('nurse@sehatsetu.com', 'nurse')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition text-left"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">David Chen</span>
                    <span className="text-[10px] text-slate-400 block">ICU Shift Leader</span>
                  </div>
                  <HeartPulse className="h-4 w-4 text-emerald-600" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('Aarav Mehta', 'patient')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition text-left"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Aarav Mehta</span>
                    <span className="text-[10px] text-slate-400 block">Cardiac Patient</span>
                  </div>
                  <User className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
