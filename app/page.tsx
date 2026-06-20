'use client';

import { useStore } from '@/store/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, Stethoscope, HeartPulse, Sparkles, Building2, Layers, Cpu, ArrowRight, User } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const userRole = useStore((state) => state.userRole);

  useEffect(() => {
    // If already logged in, fast redirect to dashboard
    if (user && userRole) {
      if (userRole === 'admin') router.push('/dashboard');
      else if (userRole === 'doctor') router.push('/dashboard/doctor');
      else if (userRole === 'nurse') router.push('/dashboard/nurse');
      else if (userRole === 'patient') router.push('/dashboard/patient');
    }
  }, [user, userRole, router]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden font-sans">
      
      {/* Background Graphic Accents */}
      <div className="absolute top-[-30%] left-[-20%] w-[800px] h-[800px] rounded-full bg-cyan-200/10 blur-3xl" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[800px] h-[800px] rounded-full bg-teal-200/10 blur-3xl" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-100 bg-white/70 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-cyan-600 p-2 rounded-xl text-white shadow-md">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-800">SehatSetu</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-cyan-600 transition">Clinical Capabilities</a>
            <a href="#architecture" className="hover:text-cyan-600 transition">BaaS Architecture</a>
            <a href="#system" className="hover:text-cyan-600 transition">System Spec</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition duration-200"
            >
              Launch Portal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-6 py-12 md:py-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/50 text-xs font-bold text-cyan-700">
              <Sparkles className="h-3.5 w-3.5" />
              Next-Gen Clinical AI Platform (Hospital 2050 Challenge)
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
              Bridging Clinical Intelligence <br className="hidden md:inline" />
              With <span className="gradient-text">Real-Time</span> Operations.
            </h1>
            
            <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-2xl">
              SehatSetu is a fully integrated digital health ecosystem engineered to eliminate clinical overhead. Featuring Gemini-powered medical scribes, automated nursing alert triages, plain-language patient report digests, and administrator bed heatmap command centers.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-cyan-600/20 transition duration-200"
              >
                Sign In to Platform
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-8 py-3.5 text-base font-bold text-slate-600 transition"
              >
                Register Staff Profile
              </Link>
            </div>
          </div>

          {/* Feature Grid Visual */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            
            <div className="p-6 rounded-2xl glass-card text-left">
              <div className="bg-cyan-50 h-10 w-10 rounded-xl flex items-center justify-center text-cyan-600 mb-4">
                <Stethoscope className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-800 text-sm block">Physicians</span>
              <p className="text-xs text-slate-400 mt-1">SOAP note voice draft summaries & differential clinical advice.</p>
            </div>

            <div className="p-6 rounded-2xl glass-card text-left mt-4">
              <div className="bg-teal-50 h-10 w-10 rounded-xl flex items-center justify-center text-teal-600 mb-4">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-800 text-sm block">Nursing Staff</span>
              <p className="text-xs text-slate-400 mt-1">Real-time alert prioritizations & patient task grouping maps.</p>
            </div>

            <div className="p-6 rounded-2xl glass-card text-left">
              <div className="bg-emerald-50 h-10 w-10 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-800 text-sm block">Administrators</span>
              <p className="text-xs text-slate-400 mt-1">Visual bed maps & live staffing occupancy metrics.</p>
            </div>

            <div className="p-6 rounded-2xl glass-card text-left mt-4">
              <div className="bg-indigo-50 h-10 w-10 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                <User className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-800 text-sm block">Patients</span>
              <p className="text-xs text-slate-400 mt-1">Friendly report summaries & simple visit preparation checklists.</p>
            </div>

          </div>

        </div>
      </main>

      {/* Foot Footer */}
      <footer className="w-full border-t border-slate-100 py-6 text-center text-xs text-slate-400 bg-white/50 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>&copy; 2026 SehatSetu AI Hospital Systems. All rights reserved.</span>
          <div className="flex gap-4 font-semibold text-slate-500">
            <span>Next.js 16 (App)</span>
            <span>&bull;</span>
            <span>Cloud Firestore BaaS</span>
            <span>&bull;</span>
            <span>Google Gemini 1.5</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
