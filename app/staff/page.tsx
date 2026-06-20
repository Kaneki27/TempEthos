'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import DashboardLayout from '@/components/shared/DashboardLayout';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Stethoscope, 
  HeartPulse, 
  ShieldCheck, 
  Mail, 
  Phone,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Staff } from '@/types';

export default function StaffDirectoryPage() {
  const staff = useStore((state) => state.staff);
  const appointments = useStore((state) => state.appointments);
  const userRole = useStore((state) => state.userRole);

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'doctor' | 'nurse' | 'admin'>('all');

  // Filter staff by search and tab role
  const filteredStaff = staff.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                        s.department.toLowerCase().includes(search.toLowerCase());
    const matchRole = activeTab === 'all' ? true : s.role === activeTab;
    return matchSearch && matchRole;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Clinical Staff Directory</h2>
            <p className="text-xs text-slate-500 mt-1">Manage hospital physicians, nurse rosters, and administrative clearance.</p>
          </div>
          
          {userRole === 'admin' && (
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition"
            >
              <Plus className="h-4 w-4" />
              Onboard Hospital Staff
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left">
          
          {/* Search bar */}
          <div className="sm:col-span-8 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by staff name or department..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="sm:col-span-4 flex items-center justify-end text-xs font-semibold text-slate-400">
            {filteredStaff.length} Active Records
          </div>

        </div>

        {/* Role Tab Navigation */}
        <div className="flex space-x-1.5 border-b border-slate-200 pb-px">
          {([
            { id: 'all', name: 'All Hospital Personnel' },
            { id: 'doctor', name: 'Doctors & Consultants' },
            { id: 'nurse', name: 'Nursing Staff' },
            { id: 'admin', name: 'Administrators' }
          ] as const).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  active 
                    ? 'border-cyan-600 text-cyan-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Staff Cards Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredStaff.length === 0 ? (
            <div className="col-span-3 p-12 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-medium bg-white">
              No staff members found matching parameters.
            </div>
          ) : (
            filteredStaff.map((member) => {
              // Calculate physician workload (appointments array count)
              const appCount = appointments.filter(a => a.doctorId === member.id && a.status === 'scheduled').length;
              const isHighWorkload = member.role === 'doctor' && appCount >= 5;

              return (
                <div key={member.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
                  
                  {/* Card Top / Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                        member.role === 'doctor' ? 'bg-cyan-600' : 
                        member.role === 'nurse' ? 'bg-emerald-600' : 'bg-teal-700'
                      }`}>
                        {member.role === 'doctor' ? <Stethoscope className="h-5 w-5" /> :
                         member.role === 'nurse' ? <HeartPulse className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">{member.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
                          {member.jobTitle} &bull; {member.department}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body - Profile specific fields */}
                  <div className="space-y-2 border-t border-b border-slate-50 py-3 text-xs">
                    
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{member.contactNumber}</span>
                    </div>

                    {/* Doctor specialization */}
                    {member.role === 'doctor' && (
                      <div className="flex justify-between text-[11px] pt-1.5 font-semibold">
                        <span className="text-slate-400">Specialization</span>
                        <span className="text-cyan-700">{(member as any).specialization || 'General'}</span>
                      </div>
                    )}

                    {/* Nurse shift and certs */}
                    {member.role === 'nurse' && (
                      <div className="flex flex-col gap-1.5 pt-1.5 text-[11px]">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-400">Certification</span>
                          <span className="text-emerald-700">{(member as any).certification || 'RN'}</span>
                        </div>
                        <div className="flex justify-between items-center font-semibold mt-0.5">
                          <span className="text-slate-400">Duty Shift</span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            <Clock className="h-3 w-3" />
                            {(member as any).shift || 'Morning'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer / Workloads (FR-STF-10) */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase"> clearance status: active </span>
                    
                    {member.role === 'doctor' && (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                        isHighWorkload 
                          ? 'bg-red-50 text-red-700 border-red-150 animate-pulse'
                          : 'bg-cyan-50 text-cyan-700 border-cyan-100'
                      }`}>
                        {isHighWorkload && <AlertTriangle className="h-3.5 w-3.5" />}
                        {appCount} Bookings {isHighWorkload ? '(High Workload)' : ''}
                      </span>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
