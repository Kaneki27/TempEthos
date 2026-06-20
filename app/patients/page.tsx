'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import DashboardLayout from '@/components/shared/DashboardLayout';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  User, 
  Archive, 
  FileText, 
  Edit,
  Trash2,
  Undo
} from 'lucide-react';

export default function PatientsListPage() {
  const patients = useStore((state) => state.patients);
  const deletePatient = useStore((state) => state.deleteItemAction);
  const updatePatient = useStore((state) => state.updateItemAction);
  const userRole = useStore((state) => state.userRole);

  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'age'>('name');

  // Filter and Sort patients
  const filteredPatients = patients
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.nationalId.includes(search);
      const matchGender = filterGender ? p.gender === filterGender : true;
      return matchSearch && matchGender;
    })
    .sort((a, b) => {
      if (sortBy === 'age') return a.age - b.age;
      return a.name.localeCompare(b.name);
    });

  const handleArchiveToggle = async (id: string, currentArchived: boolean) => {
    // Soft delete / archive (FR-PAT-09)
    await updatePatient('patients', id, { isArchived: !currentArchived });
  };

  const handleHardDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this patient permanently?")) {
      await deletePatient('patients', id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Patient Registry Directory</h2>
            <p className="text-xs text-slate-500 mt-1">Manage baseline patient admissions, health charts, and uploads.</p>
          </div>
          
          {userRole !== 'patient' && (
            <Link
              href="/patients/new"
              className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition"
            >
              <Plus className="h-4 w-4" />
              Register New Patient
            </Link>
          )}
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left">
          
          <div className="sm:col-span-6 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or national ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="name">Sort by Name</option>
              <option value="age">Sort by Age</option>
            </select>
          </div>

        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>National ID</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Blood Type</th>
                  <th>Archived</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                      No patients found matching filter parameters.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className={patient.isArchived ? 'opacity-50' : ''}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                            <User className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block text-xs sm:text-sm">{patient.name}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{patient.contactNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-slate-600">{patient.nationalId}</span>
                      </td>
                      <td className="capitalize text-xs font-semibold text-slate-600">{patient.gender}</td>
                      <td className="text-xs font-semibold text-slate-600">{patient.age} yrs</td>
                      <td>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-black text-cyan-700 bg-cyan-50 border border-cyan-100">
                          {patient.bloodType}
                        </span>
                      </td>
                      <td>
                        {patient.isArchived ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold text-amber-700 bg-amber-50">
                            Archived
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">No</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/patients/${patient.id}`}
                            className="p-2 bg-slate-50 border border-slate-200 hover:bg-cyan-50 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-lg transition"
                            title="View Records"
                          >
                            <FileText className="h-4 w-4" />
                          </Link>
                          
                          {userRole !== 'patient' && (
                            <>
                              <Link
                                href={`/patients/${patient.id}/edit`}
                                className="p-2 bg-slate-50 border border-slate-200 hover:bg-cyan-50 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-lg transition"
                                title="Edit Patient"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              
                              <button
                                onClick={() => handleArchiveToggle(patient.id, patient.isArchived)}
                                className="p-2 bg-slate-50 border border-slate-200 hover:bg-amber-50 hover:border-amber-200 text-slate-600 hover:text-amber-700 rounded-lg transition"
                                title={patient.isArchived ? "Restore Patient" : "Archive Patient"}
                              >
                                {patient.isArchived ? <Undo className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                              </button>
                              
                              {userRole === 'admin' && (
                                <button
                                  onClick={() => handleHardDelete(patient.id)}
                                  className="p-2 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-700 rounded-lg transition"
                                  title="Permanently Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
