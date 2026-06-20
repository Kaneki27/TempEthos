'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import DashboardLayout from '@/components/shared/DashboardLayout';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  User, 
  Stethoscope, 
  HeartPulse, 
  ClipboardList, 
  FileText,
  Loader2
} from 'lucide-react';

export default function SearchHubPage() {
  const patients = useStore((state) => state.patients);
  const staff = useStore((state) => state.staff);
  const medicines = useStore((state) => state.medicines);
  const diagnoses = useStore((state) => state.diagnoses);

  // States
  const [query, setQuery] = useState('');
  const [aiAssistEnabled, setAiAssistEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Search Results
  const getSearchResults = () => {
    if (!query) return { patients: [], staff: [], medicines: [], diagnoses: [] };

    const searchLower = query.toLowerCase();

    // Natural Language Search Simulation (FR-SRCH-04)
    if (aiAssistEnabled && (searchLower.includes('diabetic') || searchLower.includes('over 60') || searchLower.includes('low') || searchLower.includes('stock'))) {
      let filteredPatients = [...patients];
      let filteredMedicines = [...medicines];

      if (searchLower.includes('over 60') || searchLower.includes('60')) {
        filteredPatients = filteredPatients.filter(p => p.age > 60);
      }
      if (searchLower.includes('diabetic') || searchLower.includes('diabetes')) {
        // Find diagnoses for diabetes and match patients
        const diabeticIds = diagnoses
          .filter(d => d.description.toLowerCase().includes('diabet') || d.icdCode.startsWith('E11'))
          .map(d => d.patientId);
        filteredPatients = filteredPatients.filter(p => diabeticIds.includes(p.id));
      }
      if (searchLower.includes('low') || searchLower.includes('stock')) {
        filteredMedicines = filteredMedicines.filter(m => m.stockQty <= m.reorderLevel);
      }

      return {
        patients: filteredPatients,
        staff: [],
        medicines: filteredMedicines,
        diagnoses: []
      };
    }

    // Standard search matching fields
    const matchingPatients = patients.filter(p => 
      p.name.toLowerCase().includes(searchLower) || 
      p.nationalId.includes(searchLower) ||
      p.bloodType.toLowerCase() === searchLower
    );

    const matchingStaff = staff.filter(s => 
      s.name.toLowerCase().includes(searchLower) || 
      s.department.toLowerCase().includes(searchLower) ||
      s.jobTitle.toLowerCase().includes(searchLower)
    );

    const matchingMedicines = medicines.filter(m => 
      m.name.toLowerCase().includes(searchLower) || 
      m.genericName.toLowerCase().includes(searchLower) ||
      m.category.toLowerCase().includes(searchLower)
    );

    const matchingDiagnoses = diagnoses.filter(d => 
      d.icdCode.toLowerCase().includes(searchLower) || 
      d.description.toLowerCase().includes(searchLower)
    );

    return {
      patients: matchingPatients,
      staff: matchingStaff,
      medicines: matchingMedicines,
      diagnoses: matchingDiagnoses
    };
  };

  const results = getSearchResults();
  const hasResults = results.patients.length > 0 || results.staff.length > 0 || results.medicines.length > 0 || results.diagnoses.length > 0;

  const handleAiSearchTrigger = () => {
    setAiLoading(true);
    // Simulate AI parsing lag
    setTimeout(() => {
      setAiAssistEnabled(true);
      setAiLoading(false);
    }, 800);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Global Search Hub</h2>
            <p className="text-xs text-slate-500 mt-1">Cross-entity text queries and natural language diagnostic filters.</p>
          </div>
        </div>

        {/* Unified Search Input panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-5 w-5" />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setAiAssistEnabled(false); // Reset AI modifier on edit
                }}
                placeholder={aiAssistEnabled ? "AI Active: e.g. diabetic patients over 60" : "Search Patients, Staff, Diagnoses, or Medicines..."}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition font-medium"
              />
            </div>
            
            <button
              onClick={handleAiSearchTrigger}
              disabled={aiLoading || !query}
              className={`flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-bold shadow-md transition shrink-0 ${
                aiAssistEnabled 
                  ? 'bg-cyan-600 text-white shadow-cyan-600/10' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50'
              }`}
            >
              {aiLoading ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <Sparkles className="h-4.5 w-4.5" />
              )}
              {aiAssistEnabled ? 'AI Assist Active' : 'AI Query Assist'}
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-semibold leading-relaxed">
            <span className="text-cyan-600 font-bold block mb-1">Try Natural Language Queries with AI Assist:</span>
            <span>&bull; "show me diabetic patients over 60" &nbsp;&bull;&nbsp; "medicines with low stock levels"</span>
          </div>

        </div>

        {/* Search Results Display */}
        {query && (
          <div className="space-y-6 text-left">
            
            {/* NO RESULTS BANNER */}
            {!hasResults && (
              <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-400">
                No matching clinical documents found.
              </div>
            )}

            {/* PATIENTS RESULTS */}
            {results.patients.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="h-4 w-4 text-cyan-600" />
                  Patients found ({results.patients.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.patients.map((p) => (
                    <Link
                      key={p.id}
                      href={`/patients/${p.id}`}
                      className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl flex justify-between items-center transition text-xs font-semibold"
                    >
                      <div>
                        <span className="font-bold text-slate-700 block">{p.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Age {p.age} &bull; Blood {p.bloodType} &bull; ID: {p.nationalId}</span>
                      </div>
                      <span className="text-[10px] font-bold text-cyan-600">View File</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* STAFF RESULTS */}
            {results.staff.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Stethoscope className="h-4 w-4 text-cyan-600" />
                  Staff personnel found ({results.staff.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.staff.map((s) => (
                    <div key={s.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block">{s.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{s.jobTitle} &bull; {s.department}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 capitalize bg-white px-2 py-0.5 rounded border">{s.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DIAGNOSES RESULTS */}
            {results.diagnoses.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="h-4 w-4 text-cyan-600" />
                  Diagnoses found ({results.diagnoses.length})
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {results.diagnoses.map((d) => (
                    <div key={d.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block">{d.description}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Diagnosed code: {d.icdCode} &bull; Severity: {d.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MEDICINES RESULTS */}
            {results.medicines.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ClipboardList className="h-4 w-4 text-cyan-600" />
                  Medicines Catalog found ({results.medicines.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.medicines.map((m) => (
                    <Link
                      key={m.id}
                      href="/medicines"
                      className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl flex justify-between items-center transition text-xs font-semibold"
                    >
                      <div>
                        <span className="font-bold text-slate-700 block">{m.name} ({m.strength})</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Qty: {m.stockQty} &bull; Category: {m.category}</span>
                      </div>
                      <span className="text-[10px] font-bold text-cyan-600">Restock</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
