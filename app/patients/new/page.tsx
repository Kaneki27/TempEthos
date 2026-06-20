'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/store';
import DashboardLayout from '@/components/shared/DashboardLayout';
import Link from 'next/link';
import { ArrowLeft, UserPlus, ClipboardCheck } from 'lucide-react';

export default function NewPatientPage() {
  const router = useRouter();
  const createPatient = useStore((state) => state.createItemAction);

  const [name, setName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dob, setDob] = useState('');
  const [bloodType, setBloodType] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-'>('A+');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nationalId || !dob || !contactNumber || !emergencyName || !emergencyRelation || !emergencyPhone) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const birthDate = new Date(dob);
      const age = new Date().getFullYear() - birthDate.getFullYear();

      const patientPayload = {
        name,
        nationalId,
        gender,
        dateOfBirth: dob,
        age,
        bloodType,
        height: Number(height) || 170,
        weight: Number(weight) || 70,
        address,
        contactNumber,
        emergencyContact: {
          name: emergencyName,
          relation: emergencyRelation,
          phone: emergencyPhone
        },
        isArchived: false
      };

      await createPatient('patients', patientPayload);
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push('/patients');
      }, 1500);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Failed to register patient.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-left">
          <div className="flex items-center gap-3">
            <Link href="/patients" className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
              <ArrowLeft className="h-4.5 w-4.5 text-slate-500" />
            </Link>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Register New Patient Admission</h2>
              <p className="text-xs text-slate-500 mt-0.5">Capture demographic profiles and medical benchmarks.</p>
            </div>
          </div>
        </div>

        {success ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center py-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <ClipboardCheck className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-800">Admission Registered!</h3>
            <p className="mt-2 text-xs text-slate-500">The patient records are now synchronized. Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 text-left">
            
            {/* Base Bio Data */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
                <UserPlus className="h-4 w-4 text-cyan-600" />
                1. Patient Bio Demographics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">National ID (SSN / Aadhaar) *</label>
                  <input
                    type="text"
                    required
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Biological Gender *</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Blood Group Type *</label>
                  <select
                    value={bloodType}
                    onChange={(e: any) => setBloodType(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91 99999 XXXXX"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Height (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="175"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="75"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Permanent Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, State, ZIP"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                2. Emergency Response Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Emergency Contact Name"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Relationship *</label>
                  <input
                    type="text"
                    required
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    placeholder="Spouse / Father / Child"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="Contact Phone"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Link
                href="/patients"
                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Registering Patient...' : 'Confirm Registration'}
              </button>
            </div>

          </form>
        )}

      </div>
    </DashboardLayout>
  );
}
