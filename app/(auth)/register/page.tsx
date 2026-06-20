'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/store';
import { StaffRole } from '@/types';
import { Activity, ShieldCheck, Stethoscope, HeartPulse, User, Mail, Phone, Lock, Calendar, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const registerStaff = useStore((state) => state.registerStaff);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [dob, setDob] = useState('');
  const [contact, setContact] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<StaffRole>('doctor');
  const [password, setPassword] = useState('');
  
  // Specific role attributes
  const [specialization, setSpecialization] = useState('');
  const [yearsExp, setYearsExp] = useState(1);
  const [certification, setCertification] = useState('');
  const [shift, setShift] = useState<'morning' | 'evening' | 'night'>('morning');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!name || !email || !password || !nationalId || !dob || !contact || !jobTitle || !department) {
      setErrorMsg('All base profile fields are required (including password).');
      setLoading(false);
      return;
    }

    try {
      const birthDate = new Date(dob);
      const age = new Date().getFullYear() - birthDate.getFullYear();

      const basePayload: any = {
        name,
        email,
        password,
        nationalId,
        dateOfBirth: dob,
        age,
        contactNumber: contact,
        jobTitle,
        department,
        role,
        status: 'active' as const,
      };

      if (role === 'doctor') {
        basePayload.specialization = specialization || 'General Medicine';
        basePayload.yearsOfExperience = Number(yearsExp);
        basePayload.appointmentIds = [];
      } else if (role === 'nurse') {
        basePayload.certification = certification || 'RN';
        basePayload.yearsOfExperience = Number(yearsExp);
        basePayload.specialization = specialization || 'General Ward';
        basePayload.shift = shift;
      } else if (role === 'admin') {
        basePayload.taskIds = [];
        basePayload.responsibilityIds = [];
      }

      await registerStaff(basePayload);
      setSuccess(true);
      setLoading(false);
      
      // Auto-redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Self-registration failed. Please check parameters.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-25%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-200/20 blur-3xl" />
      <div className="absolute bottom-[-25%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-200/20 blur-3xl" />

      <div className="w-full max-w-4xl glass-panel rounded-2xl p-8 shadow-xl relative z-10 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-6 w-6 text-cyan-600 animate-pulse-slow" />
              <span className="font-bold text-lg tracking-tight text-slate-800">SehatSetu Clinical Portal</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800">Staff Self-Registration</h1>
            <p className="text-xs text-slate-500 mt-0.5">Admin approval is enabled by default for IGNITE 2026 clearances.</p>
          </div>
          <Link href="/login" className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 bg-cyan-50 px-3 py-1.5 rounded-lg">
            Back to Sign In
          </Link>
        </div>

        {success ? (
          <div className="mt-8 text-center py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <ClipboardCheck className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-slate-900 font-sans">Registration Successful!</h2>
            <p className="mt-2 text-sm text-slate-500">
              Your clinical profile has been logged. Redirecting to the authentication gateway...
            </p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="mt-6 space-y-6">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
                {errorMsg}
              </div>
            )}

            {/* Base Profile Section */}
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">1. Base Identity Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Patel"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Official Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@hospital.com"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Credential Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">National ID No (AADHAAR/SSN)</label>
                  <input
                    type="text"
                    required
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Contact Number</label>
                  <input
                    type="tel"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+91 99999 XXXXX"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Hospital Assignment Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffRole)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="doctor">Medical Practitioner (Doctor)</option>
                    <option value="nurse">Nursing Staff</option>
                    <option value="admin">Administrator / Coordinator</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Official Job Title</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Registrar ICU, Lead Nurse"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Assigned Department</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. ICU, General Medicine, Pediatrics"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

              </div>
            </div>

            {/* Specialization Section (Conditional) */}
            {role !== 'admin' && (
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">2. Clinical Specialization Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Specialization Area</label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder={role === 'doctor' ? 'e.g. Cardiology' : 'e.g. Critical Care'}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Years of Experience</label>
                    <input
                      type="number"
                      min={0}
                      value={yearsExp}
                      onChange={(e) => setYearsExp(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {role === 'nurse' && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1.5">Professional Certification</label>
                        <input
                          type="text"
                          value={certification}
                          onChange={(e) => setCertification(e.target.value)}
                          placeholder="e.g. RN, BSN, CCRN"
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1.5">Shift Duty Assignment</label>
                        <select
                          value={shift}
                          onChange={(e) => setShift(e.target.value as any)}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
                        >
                          <option value="morning">Morning Shift (06:00 - 14:00)</option>
                          <option value="evening">Evening Shift (14:00 - 22:00)</option>
                          <option value="night">Night Shift (22:00 - 06:00)</option>
                        </select>
                      </div>
                    </>
                  )}

                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Submitting Credentials...' : 'Submit Profile for Verification'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
