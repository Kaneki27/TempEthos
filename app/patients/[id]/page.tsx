'use client';

import { useState, useEffect, use } from 'react';
import { useStore } from '@/store/store';
import DashboardLayout from '@/components/shared/DashboardLayout';
import AISummaryCard from '@/components/shared/AISummaryCard';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User, 
  HeartPulse, 
  ClipboardCheck, 
  FileSpreadsheet, 
  History, 
  Upload, 
  Sparkles, 
  Plus, 
  AlertCircle, 
  Loader2,
  FileCheck2,
  Check
} from 'lucide-react';
import { Patient, Treatment, Diagnosis, Analysis, MedicalHistory, AiReport } from '@/types';

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patients = useStore((state) => state.patients);
  const treatments = useStore((state) => state.treatments);
  const diagnoses = useStore((state) => state.diagnoses);
  const analyses = useStore((state) => state.analyses);
  const history = useStore((state) => state.history);
  const addRecord = useStore((state) => state.createItemAction);
  const userRole = useStore((state) => state.userRole);

  // States
  const [activeTab, setActiveTab] = useState<'overview' | 'treatments' | 'diagnoses' | 'analyses' | 'history' | 'documents' | 'ai'>('overview');
  const [patient, setPatient] = useState<Patient | null>(null);

  // Add Treatment Form states
  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [treatType, setTreatType] = useState<'medication' | 'surgical' | 'rehabilitation'>('medication');
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [route, setRoute] = useState('');
  const [surgeonCred, setSurgeonCred] = useState('');
  const [anesthesia, setAnesthesia] = useState('');
  const [site, setSite] = useState('');
  const [goals, setGoals] = useState('');
  const [rehabPlan, setRehabPlan] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');

  // Add Diagnosis Form states
  const [showAddDiagnosis, setShowAddDiagnosis] = useState(false);
  const [icdCode, setIcdCode] = useState('');
  const [diagDescription, setDiagDescription] = useState('');
  const [diagSeverity, setDiagSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  // Simulated Document Upload States
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; date: string }[]>([]);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Load Patient Profile
  useEffect(() => {
    const match = patients.find(p => p.id === id);
    if (match) setPatient(match);
  }, [id, patients]);

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        </div>
      </DashboardLayout>
    );
  }

  // Filter records linked to this patient
  const patientTreatments = treatments.filter(t => t.patientId === id);
  const patientDiagnoses = diagnoses.filter(d => d.patientId === id);
  const patientAnalyses = analyses.filter(a => a.patientId === id);
  const patientHistory = history.filter(h => h.patientId === id);

  // Handle Add Treatment
  const handleAddTreatmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const basePayload: any = {
        patientId: id,
        staffId: useStore.getState().user?.id || 'system',
        type: treatType,
        date: new Date().toISOString(),
        notes: treatmentNotes
      };

      if (treatType === 'medication') {
        basePayload.medName = medName;
        basePayload.dosage = dosage;
        basePayload.frequency = frequency;
        basePayload.route = route;
        basePayload.prescribingDoctor = useStore.getState().user?.name || 'Staff Practitioner';
      } else if (treatType === 'surgical') {
        basePayload.surgeonCredentials = surgeonCred;
        basePayload.anesthesiaType = anesthesia;
        basePayload.site = site;
        basePayload.complications = 'None';
        basePayload.approach = 'Standard surgical incision';
        basePayload.outcomeNotes = 'Procedure completed successfully. Vitals stable.';
      } else if (treatType === 'rehabilitation') {
        basePayload.goals = goals;
        basePayload.plan = rehabPlan;
        basePayload.initialAssessment = 'Stable baseline';
        basePayload.schedule = 'Twice weekly';
        basePayload.progressNotes = 'Patient showing adherence to rehabilitation goals.';
        basePayload.dischargeStatus = 'Ongoing';
      }

      await addRecord('treatments', basePayload);
      setShowAddTreatment(false);
      
      // Reset form
      setMedName('');
      setDosage('');
      setFrequency('');
      setRoute('');
      setTreatmentNotes('');
    } catch (err) {
      console.error(err);
      alert("Failed to save treatment record.");
    }
  };

  // Handle Add Diagnosis
  const handleAddDiagnosisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!icdCode || !diagDescription) return;

    try {
      const payload: Diagnosis = {
        id: '',
        patientId: id,
        staffId: useStore.getState().user?.id || 'system',
        date: new Date().toISOString(),
        icdCode,
        description: diagDescription,
        severity: diagSeverity
      };
      await addRecord('diagnoses', payload);
      setShowAddDiagnosis(false);
      setIcdCode('');
      setDiagDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated Lab Report Text options for mock upload
  const simulateReportUpload = (fileName: string) => {
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 10;
        if (prev >= 100) {
          clearInterval(interval);
          setUploadProgress(null);
          // Append to uploaded list
          setUploadedFiles(prevFiles => [
            { name: fileName, size: '2.4 MB', date: new Date().toLocaleDateString() },
            ...prevFiles
          ]);
          // Trigger AI report analysis
          triggerAiReportAnalysis(fileName);
          return null;
        }
        return prev + 30;
      });
    }, 400);
  };

  const triggerAiReportAnalysis = async (fileName: string) => {
    setAiLoading(true);
    setAiAnalysisResult(null);
    setActiveTab('ai'); // Switch to AI tab to view output

    try {
      // Simulate extracted PDF text based on the file name
      let reportText = `Patient: ${patient.name}. Blood test findings details. Hemoglobin 10.2 g/dL (low), fasting glucose 185 mg/dL (high). WBC 8500 cells/mcL.`;
      if (fileName.toLowerCase().includes('urine')) {
        reportText = `Patient: ${patient.name}. Urinalysis details. pH 6.2, protein trace. WBC 2 per high power field, bacteria none. Volume 120ml.`;
      }

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'report-analysis',
          payload: { text: reportText, patientId: id, patientContext: `Age: ${patient.age}, Gender: ${patient.gender}` }
        })
      });
      const json = await res.json();
      if (json.data) {
        setAiAnalysisResult(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div className="flex items-center gap-3">
            <Link href="/patients" className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
              <ArrowLeft className="h-4.5 w-4.5 text-slate-500" />
            </Link>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Age {patient.age} &bull; Blood Type {patient.bloodType} &bull; ID: {patient.nationalId}
              </p>
            </div>
          </div>

          {userRole !== 'patient' && (
            <Link
              href={`/patients/${id}/edit`}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
            >
              Edit Demographics Profile
            </Link>
          )}
        </div>

        {/* Tab Headers */}
        <div className="flex overflow-x-auto space-x-1.5 border-b border-slate-200 pb-px">
          {([
            { id: 'overview', name: 'Overview', icon: <User className="h-4 w-4" /> },
            { id: 'treatments', name: 'Treatments', icon: <HeartPulse className="h-4 w-4" /> },
            { id: 'diagnoses', name: 'Diagnoses', icon: <ClipboardCheck className="h-4 w-4" /> },
            { id: 'analyses', name: 'Analyses Panels', icon: <FileSpreadsheet className="h-4 w-4" /> },
            { id: 'history', name: 'Medical History', icon: <History className="h-4 w-4" /> },
            { id: 'documents', name: 'Documents', icon: <Upload className="h-4 w-4" /> },
            { id: 'ai', name: 'AI Summary Insights', icon: <Sparkles className="h-4 w-4" /> }
          ] as const).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

        {/* Tab Contents */}
        <div className="mt-4 text-left">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                
                {/* Physical baseline */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Physiological Baselines</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Height</span>
                      <span className="text-sm font-extrabold text-slate-700 mt-1 block">{patient.height} cm</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weight</span>
                      <span className="text-sm font-extrabold text-slate-700 mt-1 block">{patient.weight} kg</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Blood Group</span>
                      <span className="text-sm font-extrabold text-slate-700 mt-1 block">{patient.bloodType}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DOB / Age</span>
                      <span className="text-sm font-extrabold text-slate-700 mt-1 block">{patient.age} Yrs</span>
                    </div>
                  </div>
                </div>

                {/* Permanent Contact details */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Contact Specifications</h3>
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-3 border-b border-slate-50 pb-2">
                      <span className="text-slate-400 font-semibold">Phone Number</span>
                      <span className="col-span-2 font-bold text-slate-700">{patient.contactNumber}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-400 font-semibold">Residential Address</span>
                      <span className="col-span-2 font-bold text-slate-700 leading-relaxed">{patient.address}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Sidebar: Emergency Contacts */}
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Emergency Response contact</h3>
                  <div className="p-4 bg-red-50/20 border border-red-100 rounded-2xl space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Representative</span>
                      <span className="font-bold text-slate-700">{patient.emergencyContact.name}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Relationship</span>
                      <span className="font-bold text-slate-700">{patient.emergencyContact.relation}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold pt-2 border-t border-red-100/50">
                      <span className="text-slate-400">Direct Phone</span>
                      <span className="font-extrabold text-red-700">{patient.emergencyContact.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TREATMENTS TAB */}
          {activeTab === 'treatments' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">Clinical Treatment Courses</h3>
                {userRole !== 'patient' && (
                  <button
                    onClick={() => setShowAddTreatment(!showAddTreatment)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Record Treatment Course
                  </button>
                )}
              </div>

              {/* Add Treatment Form Modal overlay */}
              {showAddTreatment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                  <form 
                    onSubmit={handleAddTreatmentSubmit}
                    className="w-full max-w-lg bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 relative animate-fade-in-up space-y-4"
                  >
                    <button
                      type="button"
                      onClick={() => setShowAddTreatment(false)}
                      className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg"
                    >
                      Close
                    </button>
                    
                    <h3 className="font-extrabold text-slate-800 text-base">Record Clinical Treatment</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Treatment Type</label>
                        <select
                          value={treatType}
                          onChange={(e: any) => setTreatType(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                        >
                          <option value="medication">Medication Prescriptions</option>
                          <option value="surgical">Surgical Procedures</option>
                          <option value="rehabilitation">Rehabilitation Therapy</option>
                        </select>
                      </div>
                    </div>

                    {/* Conditional sections */}
                    {treatType === 'medication' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Medicine Name</label>
                          <input
                            type="text" required value={medName} onChange={(e) => setMedName(e.target.value)}
                            placeholder="e.g. Paracetamol, Metformin"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Dosage strength</label>
                          <input
                            type="text" required value={dosage} onChange={(e) => setDosage(e.target.value)}
                            placeholder="e.g. 500mg, 1 tablet"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Frequency</label>
                          <input
                            type="text" required value={frequency} onChange={(e) => setFrequency(e.target.value)}
                            placeholder="e.g. Twice daily"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ingestion Route</label>
                          <input
                            type="text" required value={route} onChange={(e) => setRoute(e.target.value)}
                            placeholder="e.g. Oral, IV"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {treatType === 'surgical' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Surgeon Credentials</label>
                          <input
                            type="text" required value={surgeonCred} onChange={(e) => setSurgeonCred(e.target.value)}
                            placeholder="e.g. FACS, M.Ch Cardiology"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Anesthesia Type</label>
                          <input
                            type="text" required value={anesthesia} onChange={(e) => setAnesthesia(e.target.value)}
                            placeholder="e.g. General, Local"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Surgical Site</label>
                          <input
                            type="text" required value={site} onChange={(e) => setSite(e.target.value)}
                            placeholder="e.g. Left Ventricular Wall, Right Femur"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {treatType === 'rehabilitation' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Therapeutic Goals</label>
                          <input
                            type="text" required value={goals} onChange={(e) => setGoals(e.target.value)}
                            placeholder="e.g. Regain cardiovascular stamina"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Therapeutic Program Plan</label>
                          <textarea
                            rows={2} required value={rehabPlan} onChange={(e) => setRehabPlan(e.target.value)}
                            placeholder="Cardiorespiratory pacing, core routines..."
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Treatment Notes</label>
                      <textarea
                        rows={2}
                        value={treatmentNotes}
                        onChange={(e) => setTreatmentNotes(e.target.value)}
                        placeholder="Additional notes..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                      Save Treatment Record
                    </button>
                  </form>
                </div>
              )}

              {/* Render List */}
              <div className="space-y-4">
                {patientTreatments.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-medium bg-white">
                    No active treatments or prescriptions logged on file.
                  </div>
                ) : (
                  patientTreatments.map((t: any) => (
                    <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            t.type === 'medication' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' :
                            t.type === 'surgical' ? 'bg-red-50 text-red-700 border border-red-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {t.type}
                          </span>
                          <span className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {t.type === 'medication' && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block">Medicine</span>
                            <span className="font-bold text-slate-700">{t.medName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Dosage / Route</span>
                            <span className="font-bold text-slate-700">{t.dosage} &bull; {t.route}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Frequency</span>
                            <span className="font-bold text-slate-700">{t.frequency}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Prescriber</span>
                            <span className="font-bold text-slate-700">{t.prescribingDoctor}</span>
                          </div>
                        </div>
                      )}

                      {t.type === 'surgical' && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block">Procedure Site</span>
                            <span className="font-bold text-slate-700">{t.site}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Surgeon</span>
                            <span className="font-bold text-slate-700">{t.surgeonCredentials}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Anesthesia Type</span>
                            <span className="font-bold text-slate-700">{t.anesthesiaType}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Procedural Outcomes</span>
                            <span className="font-bold text-slate-700">{t.outcomeNotes}</span>
                          </div>
                        </div>
                      )}

                      {t.type === 'rehabilitation' && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block">Therapy Goals</span>
                            <span className="font-bold text-slate-700">{t.goals}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Rehabilitation Plan</span>
                            <span className="font-bold text-slate-700">{t.plan}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Schedule / Status</span>
                            <span className="font-bold text-slate-700">{t.schedule} &bull; {t.dischargeStatus}</span>
                          </div>
                        </div>
                      )}

                      {t.notes && (
                        <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                          Clinical Notes: {t.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* DIAGNOSES TAB */}
          {activeTab === 'diagnoses' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">Patient Clinical Diagnoses</h3>
                {userRole !== 'patient' && (
                  <button
                    onClick={() => setShowAddDiagnosis(!showAddDiagnosis)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Record Diagnosis
                  </button>
                )}
              </div>

              {/* Add Diagnosis modal */}
              {showAddDiagnosis && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                  <form 
                    onSubmit={handleAddDiagnosisSubmit}
                    className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 relative animate-fade-in-up space-y-4"
                  >
                    <button
                      type="button"
                      onClick={() => setShowAddDiagnosis(false)}
                      className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg"
                    >
                      Close
                    </button>

                    <h3 className="font-extrabold text-slate-800 text-base">Record Diagnosis Log</h3>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">ICD-10 Code</label>
                      <input
                        type="text" required value={icdCode} onChange={(e) => setIcdCode(e.target.value)}
                        placeholder="e.g. I10, E11.9"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Condition Description</label>
                      <textarea
                        rows={3} required value={diagDescription} onChange={(e) => setDiagDescription(e.target.value)}
                        placeholder="Clinical diagnostic descriptions..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Severity Severity</label>
                      <select
                        value={diagSeverity}
                        onChange={(e: any) => setDiagSeverity(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                      >
                        <option value="low">Low Severity</option>
                        <option value="medium">Medium Severity</option>
                        <option value="high">High Severity</option>
                        <option value="critical">Critical Severity</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                      Save Diagnosis Entry
                    </button>
                  </form>
                </div>
              )}

              {/* Render diagnoses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patientDiagnoses.length === 0 ? (
                  <div className="col-span-2 p-8 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-medium bg-white">
                    No diagnostics records currently registered.
                  </div>
                ) : (
                  patientDiagnoses.map((d) => (
                    <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500">
                          <span className="font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                            {d.icdCode}
                          </span>
                        </div>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          d.severity === 'critical' ? 'bg-red-50 text-red-700 border border-red-100' :
                          d.severity === 'high' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                          d.severity === 'medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                          'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {d.severity}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed">{d.description}</p>
                      <span className="text-[10px] text-slate-400 block pt-1">Diagnosed on: {new Date(d.date).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* ANALYSES TAB */}
          {activeTab === 'analyses' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">Lab Analyses panels</h3>
              </div>

              <div className="space-y-4">
                {patientAnalyses.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-medium bg-white">
                    No chemical or biological analyses panel records found.
                  </div>
                ) : (
                  patientAnalyses.map((ana) => (
                    <div key={ana.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 border border-cyan-100 rounded-full uppercase">
                          {ana.type} Analysis
                        </span>
                        <span className="text-xs text-slate-400">Date: {new Date(ana.date).toLocaleDateString()}</span>
                      </div>

                      {ana.type === 'bioblood' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block font-semibold mb-1">White Blood Count</span>
                            <span className="font-bold text-slate-700">{ana.bloodCount?.wbc} cells/mcL</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block font-semibold mb-1">Red Blood Count</span>
                            <span className="font-bold text-slate-700">{ana.bloodCount?.rbc} million/mcL</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block font-semibold mb-1">Hemoglobin (Hb)</span>
                            <span className="font-bold text-slate-700">{ana.bloodCount?.hemoglobin} g/dL</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block font-semibold mb-1">Platelets</span>
                            <span className="font-bold text-slate-700">{ana.bloodCount?.platelets} /mcL</span>
                          </div>
                          
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                            <span className="text-slate-400 block font-semibold mb-1">Blood Chemistry (Na/K/Glucose)</span>
                            <span className="font-bold text-slate-700">
                              Na: {ana.bloodChemistry?.sodium} &bull; K: {ana.bloodChemistry?.potassium} &bull; Glucose: {ana.bloodChemistry?.glucose} mg/dL
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                            <span className="text-slate-400 block font-semibold mb-1">Coagulation (PT/INR)</span>
                            <span className="font-bold text-slate-700">PT: {ana.coagulationProfile?.pt}s &bull; INR: {ana.coagulationProfile?.inr}</span>
                          </div>
                        </div>
                      )}

                      {ana.type === 'urine' && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block">pH level</span>
                            <span className="font-bold text-slate-700">{ana.ph}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block">Appearance</span>
                            <span className="font-bold text-slate-700 capitalize">{ana.appearance}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block">Glucose / Protein</span>
                            <span className="font-bold text-slate-700 capitalize">
                              G: {ana.glucose} &bull; P: {ana.protein}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block">Bacteria / Crystals</span>
                            <span className="font-bold text-slate-700 capitalize">
                              B: {ana.bacteria} &bull; C: {ana.crystals}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* MEDICAL HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">Chronic & Observational Logs</h3>
              </div>

              <div className="relative border-l-2 border-slate-200 pl-6 ml-2 space-y-6">
                {patientHistory.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-medium bg-white -ml-8">
                    No historic observational logs logged.
                  </div>
                ) : (
                  patientHistory.map((hist) => (
                    <div key={hist.id} className="relative bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-xs">
                      {/* Timeline dot */}
                      <span className="absolute left-[-32px] top-6 h-3 w-3 rounded-full bg-cyan-500 border-2 border-white ring-4 ring-cyan-50 shrink-0" />
                      
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1.5 uppercase">
                        <span>Admitted Log</span>
                        <span>{new Date(hist.timestamp).toLocaleString()}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-400 block font-semibold">Historic Observations</span>
                          <p className="font-bold text-slate-700 leading-relaxed mt-0.5">{hist.observation}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-1">
                          <div>
                            <span className="text-slate-400 block font-semibold">Outcomes & Complications</span>
                            <span className="font-semibold text-red-600">{hist.complication || 'None'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-semibold">Attending Scribe</span>
                            <span className="font-semibold text-slate-700">{hist.recordedBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* DOCUMENTS UPLOADER TAB */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">Lab Report Storage</h3>
              </div>

              {/* Upload Panel (FR-PAT-05, FR-AI-01) */}
              {userRole !== 'patient' && (
                <div className="border-2 border-dashed border-slate-200 hover:border-cyan-400 rounded-2xl p-8 bg-white transition duration-200 text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Upload Clinical PDF / Scan</h4>
                    <p className="text-[11px] text-slate-400 mt-1">Select laboratory reports to run automatic Gemini anomaly scans (max 20MB).</p>
                  </div>
                  
                  {uploadProgress !== null ? (
                    <div className="max-w-xs mx-auto space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                        <span>Uploading File</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-600 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => simulateReportUpload('Lab_BloodSugarPanel.pdf')}
                        className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Sparkles className="h-4 w-4 text-cyan-600" />
                        Simulate Glucose Blood Report
                      </button>
                      
                      <button
                        onClick={() => simulateReportUpload('UrinalysisReport.pdf')}
                        className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Sparkles className="h-4 w-4 text-cyan-600" />
                        Simulate Urinalysis
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Uploaded Documents List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Stored Documents</span>
                {uploadedFiles.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-medium bg-white">
                    No uploaded document files on record.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition text-xs">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                            <FileCheck2 className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block">{file.name}</span>
                            <span className="text-[10px] text-slate-400 block">{file.size} &bull; Uploaded {file.date}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => triggerAiReportAnalysis(file.name)}
                          className="px-3 py-1.5 rounded-lg border border-cyan-100 hover:border-cyan-200 bg-cyan-50 hover:bg-cyan-100/50 text-cyan-700 font-bold transition flex items-center gap-1"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Analyze AI
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* AI SUMMARY INSIGHTS TAB */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">Gemini Clinical Diagnostics Summaries</h3>
              </div>

              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
                  <span className="text-xs font-semibold">Gemini processing raw laboratory report values...</span>
                </div>
              ) : aiAnalysisResult ? (
                <div className="space-y-4">
                  <AISummaryCard
                    title="Gemini 1.5 Pro - Lab Report summary digest"
                    summary={aiAnalysisResult.summary}
                    confidence={aiAnalysisResult.confidenceScore}
                    criticalFlags={aiAnalysisResult.criticalFlags}
                    suggestedFollowUp={aiAnalysisResult.suggestedFollowUp}
                  />
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-medium bg-white">
                  To view clinical interpretations, upload a document in the Documents tab and run Gemini Scans.
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}
