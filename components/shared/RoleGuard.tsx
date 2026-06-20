'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/store';
import { StaffRole } from '@/types';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: StaffRole[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const userRole = useStore((state) => state.userRole);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check auth
    if (!user || !userRole) {
      router.push('/login');
    } else if (!allowedRoles.includes(userRole)) {
      setAuthorized(false);
      setChecking(false);
    } else {
      setAuthorized(true);
      setChecking(false);
    }
  }, [user, userRole, allowedRoles, router]);

  if (checking) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-600" />
        <p className="mt-4 text-sm font-medium text-slate-500">Verifying security clearances...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md rounded-2xl glass-panel p-8 text-center animate-fade-in-up">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <ShieldAlert className="h-8 w-8" />
          </div>
          
          <h1 className="mt-6 text-xl font-bold text-slate-900">Access Denied</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your clinical account role (<span className="capitalize font-semibold text-slate-700">{userRole}</span>) 
            does not have clearance to view this directory.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => {
                if (userRole === 'admin') router.push('/dashboard');
                else if (userRole === 'doctor') router.push('/dashboard/doctor');
                else if (userRole === 'nurse') router.push('/dashboard/nurse');
                else if (userRole === 'patient') router.push('/dashboard/patient');
                else router.push('/login');
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-cyan-700 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to My Dashboard
            </button>
            
            <button
              onClick={() => {
                useStore.getState().logout();
                router.push('/login');
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
