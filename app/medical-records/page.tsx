'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { 
  FileText, 
  Plus, 
  Search, 
  HeartPulse, 
  ClipboardCheck, 
  FileSpreadsheet, 
  History, 
  UserRound,
  ShieldCheck,
  Activity,
  Trash2
} from 'lucide-react';
import { Treatment, Diagnosis, Analysis, MedicalHistory, Procedure } from '@/types';

export default function MedicalRecordsPage() {
  const user = useStore((state) => state.user);
  const userRole = useStore((state) => state.userRole);
  
  const patients = useStore((state) => state.patients);
  const staff = useStore((state) => state.staff);
  const treatments = useStore((state) => state.treatments);
  const diagnoses = useStore((state) => state.diagnoses);
  const analyses = useStore((state) => state.analyses);
  const history = useStore((state) => state.history);
  
  const createItem = useStore((state) => state.createItemAction);
  const deleteItem = useStore((state) => state.deleteItemAction);

  // Tabs
  const [activeTab, setActiveTab] = useState<'treatments' | 'diagnoses' | 'analyses' | 'procedures' | 'history'>('treatments');
  const [search, setSearch] = useState('');

  // Form states
  const [showAddProcedure, setShowAddProcedure] = useState(false);
  const [procPatientId, setProcPatientId] = useState('');
  const [procTitle, setProcTitle] = useState('');
  const [procDesc, setProcDesc] = useState('');
  const [procResult, setProcResult] = useState('');
  const [procNotes, setProcNotes] = useState('');

  // Helpers to resolve names
  const getPatientName = (patientId: string) => {
    return patients.find(p => p.id === patientId)?.name || 'Unknown Patient';
  };
  const getStaffName = (staffId: string) => {
    return staff.find(s => s.id === staffId)?.name || 'Clinical Staff';
  };

  // Filter records based on search and tab
  const getFilteredTreatments = () => {
    return treatments.filter(t => {
      const pName = getPatientName(t.patientId).toLowerCase();
      const medMatch = t.type === 'medication' ? t.medName.toLowerCase().includes(search.toLowerCase()) : false;
      return pName.includes(search.toLowerCase()) || medMatch;
    });
  };

  const getFilteredDiagnoses = () => {
    return diagnoses.filter(d => {
      const pName = getPatientName(d.patientId).toLowerCase();
      return pName.includes(search.toLowerCase()) || d.icdCode.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase());
    });
  };

  const getFilteredAnalyses = () => {
    return analyses.filter(a => {
      const pName = getPatientName(a.patientId).toLowerCase();
      return pName.includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase());
    });
  };

  const getFilteredHistory = () => {
    return history.filter(h => {
      const pName = getPatientName(h.patientId).toLowerCase();
      return pName.includes(search.toLowerCase()) || h.observation.toLowerCase().includes(search.toLowerCase());
    });
  };

  const handleAddProcedureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procPatientId || !procTitle || !procDesc) return;

    try {
      const payload = {
        patientId: procPatientId,
        staffId: user?.id || 'system',
        title: procTitle,
        description: procDesc,
        date: new Date().toISOString(),
        result: procResult,
        notes: procNotes
      };
      // For procedural logs we write to 'procedures' or mock it
      await createItem('procedures' as any, payload);
      setShowAddProcedure(false);
      
      // Reset form
      setProcPatientId('');
      setProcTitle('');
      setProcDesc('');
      setProcResult('');
      setProcNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordDelete = async (collection: string, id: string) => {
    if (confirm("Are you sure you want to delete this clinical record?")) {
      await deleteItem(collection as any, id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Clinical Records Center</h2>
            <p className="text-xs text-slate-500 mt-1">
              Search, filter, and audit active diagnoses, therapy courses, and lab panel logs.
            </p>
          </div>

          {userRole !== 'patient' && activeTab === 'procedures' && (
            <button
              onClick={() => setShowAddProcedure(true)}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition"
            >
              <Plus className="h-4 w-4" />
              Log Clinical Procedure
            </button>
          )}
        </div>

        {/* Search Filter Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left">
          <div className="sm:col-span-8 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records by patient name, ICD codes, or keywords..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
          <div className="sm:col-span-4 flex items-center justify-end text-xs font-semibold text-slate-400">
            Secure clinical repository access
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex space-x-1.5 border-b border-slate-200 pb-px">
          {([
            { id: 'treatments', name: 'Treatments Prescriptions', icon: <HeartPulse className="h-4 w-4" /> },
            { id: 'diagnoses', name: 'Active Diagnoses', icon: <ClipboardCheck className="h-4 w-4" /> },
            { id: 'analyses', name: 'Lab Analyses', icon: <FileSpreadsheet className="h-4 w-4" /> },
            { id: 'history', name: 'Medical Histories', icon: <History className="h-4 w-4" /> }
          ] as const).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  active 
                    ? 'border-cyan-600 text-cyan-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Add Procedure Modal Drawer */}
        {showAddProcedure && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <form 
              onSubmit={handleAddProcedureSubmit}
              className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 relative animate-fade-in-up space-y-4"
            >
              <button
                type="button"
                onClick={() => setShowAddProcedure(false)}
                className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg"
              >
                Close
              </button>

              <h3 className="font-extrabold text-slate-800 text-base">Record Clinical Procedure</h3>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Patient *</label>
                <select
                  required
                  value={procPatientId}
                  onChange={(e) => setProcPatientId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Age {p.age})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Procedure Title *</label>
                <input
                  type="text" required value={procTitle} onChange={(e) => setProcTitle(e.target.value)}
                  placeholder="e.g. Insertion of IV Line"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Procedure Description *</label>
                <textarea
                  rows={2} required value={procDesc} onChange={(e) => setProcDesc(e.target.value)}
                  placeholder="Details of procedure execution..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Results Outcomes</label>
                <input
                  type="text" value={procResult} onChange={(e) => setProcResult(e.target.value)}
                  placeholder="e.g. Success, patient comfortable"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                Log Procedure
              </button>
            </form>
          </div>
        )}

        {/* Tab Data Tables */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-left">
          
          {/* TREATMENTS TABLE */}
          {activeTab === 'treatments' && (
            <div className="overflow-x-auto">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Course Type</th>
                    <th>Clinical Details</th>
                    <th>Prescribing Staff</th>
                    <th>Date Recorded</th>
                    {userRole !== 'patient' && <th className="text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {getFilteredTreatments().length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                        No treatments prescriptions found matching keywords.
                      </td>
                    </tr>
                  ) : (
                    getFilteredTreatments().map((t: any) => (
                      <tr key={t.id}>
                        <td className="font-bold text-slate-700 text-xs sm:text-sm">{getPatientName(t.patientId)}</td>
                        <td className="capitalize font-semibold text-xs text-slate-500">{t.type}</td>
                        <td className="text-xs">
                          {t.type === 'medication' ? (
                            <span>{t.medName} ({t.dosage}) &bull; {t.frequency}</span>
                          ) : t.type === 'surgical' ? (
                            <span>Procedure site: {t.site}</span>
                          ) : (
                            <span>Goals: {t.goals}</span>
                          )}
                        </td>
                        <td className="text-xs font-semibold text-slate-600">{t.prescribingDoctor || getStaffName(t.staffId)}</td>
                        <td className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString()}</td>
                        {userRole !== 'patient' && (
                          <td className="text-right">
                            <button
                              onClick={() => handleRecordDelete('treatments', t.id)}
                              className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-700 rounded-lg transition"
                              title="Delete Record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* DIAGNOSES TABLE */}
          {activeTab === 'diagnoses' && (
            <div className="overflow-x-auto">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>ICD Code</th>
                    <th>Condition Description</th>
                    <th>Severity</th>
                    <th>Date Recorded</th>
                    {userRole !== 'patient' && <th className="text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {getFilteredDiagnoses().length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                        No diagnoses matching filters.
                      </td>
                    </tr>
                  ) : (
                    getFilteredDiagnoses().map((d) => (
                      <tr key={d.id}>
                        <td className="font-bold text-slate-700 text-xs sm:text-sm">{getPatientName(d.patientId)}</td>
                        <td>
                          <span className="font-mono font-bold text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                            {d.icdCode}
                          </span>
                        </td>
                        <td className="text-xs font-semibold text-slate-600">{d.description}</td>
                        <td className="capitalize font-black text-xs">
                          <span className={d.severity === 'critical' ? 'text-red-600' : d.severity === 'high' ? 'text-orange-600' : 'text-slate-600'}>
                            {d.severity}
                          </span>
                        </td>
                        <td className="text-xs text-slate-400">{new Date(d.date).toLocaleDateString()}</td>
                        {userRole !== 'patient' && (
                          <td className="text-right">
                            <button
                              onClick={() => handleRecordDelete('diagnoses', d.id)}
                              className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-700 rounded-lg transition"
                              title="Delete Record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ANALYSES TABLE */}
          {activeTab === 'analyses' && (
            <div className="overflow-x-auto">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Analysis Type</th>
                    <th>Summary Results</th>
                    <th>attending Staff</th>
                    <th>Date Recorded</th>
                    {userRole !== 'patient' && <th className="text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {getFilteredAnalyses().length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                        No chemical analyses logs found.
                      </td>
                    </tr>
                  ) : (
                    getFilteredAnalyses().map((a: any) => (
                      <tr key={a.id}>
                        <td className="font-bold text-slate-700 text-xs sm:text-sm">{getPatientName(a.patientId)}</td>
                        <td>
                          <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 uppercase">
                            {a.type}
                          </span>
                        </td>
                        <td className="text-xs">
                          {a.type === 'bioblood' ? (
                            <span>Hb: {a.bloodCount?.hemoglobin} g/dL &bull; Glucose: {a.bloodChemistry?.glucose} mg/dL</span>
                          ) : (
                            <span>Appearance: {a.appearance} &bull; pH: {a.ph}</span>
                          )}
                        </td>
                        <td className="text-xs font-semibold text-slate-600">{getStaffName(a.staffId)}</td>
                        <td className="text-xs text-slate-400">{new Date(a.date).toLocaleDateString()}</td>
                        {userRole !== 'patient' && (
                          <td className="text-right">
                            <button
                              onClick={() => handleRecordDelete('analyses', a.id)}
                              className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-700 rounded-lg transition"
                              title="Delete Record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* HISTORY TABLE */}
          {activeTab === 'history' && (
            <div className="overflow-x-auto">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Observations Log</th>
                    <th>Complications</th>
                    <th>attending Doctor</th>
                    <th>Timestamp</th>
                    {userRole !== 'patient' && <th className="text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {getFilteredHistory().length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                        No chronic logs registered.
                      </td>
                    </tr>
                  ) : (
                    getFilteredHistory().map((h) => (
                      <tr key={h.id}>
                        <td className="font-bold text-slate-700 text-xs sm:text-sm">{getPatientName(h.patientId)}</td>
                        <td className="text-xs font-semibold text-slate-600 leading-relaxed">{h.observation}</td>
                        <td className="text-xs font-bold text-red-600">{h.complication || 'None'}</td>
                        <td className="text-xs font-semibold text-slate-600">{h.recordedBy || getStaffName(h.staffId)}</td>
                        <td className="text-xs text-slate-400">{new Date(h.timestamp).toLocaleString()}</td>
                        {userRole !== 'patient' && (
                          <td className="text-right">
                            <button
                              onClick={() => handleRecordDelete('history', h.id)}
                              className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-700 rounded-lg transition"
                              title="Delete Record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}
