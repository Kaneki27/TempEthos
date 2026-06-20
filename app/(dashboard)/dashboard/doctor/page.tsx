'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import RoleGuard from '@/components/shared/RoleGuard';
import DashboardLayout from '@/components/shared/DashboardLayout';
import AISummaryCard from '@/components/shared/AISummaryCard';
import { 
  Calendar, 
  Users, 
  Stethoscope, 
  Sparkles, 
  FileText, 
  AlertTriangle, 
  HeartPulse, 
  BrainCircuit, 
  Loader2,
  Mic,
  Smile
} from 'lucide-react';

export default function DoctorDashboardPage() {
  const user = useStore((state) => state.user);
  const appointments = useStore((state) => state.appointments);
  const patients = useStore((state) => state.patients);
  const diagnoses = useStore((state) => state.diagnoses);
  const addDiagnosis = useStore((state) => state.createItemAction);

  // SOAP Scribe state
  const [dictation, setDictation] = useState('');
  const [soapOutput, setSoapOutput] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [soapLoading, setSoapLoading] = useState(false);
  const [soapApproved, setSoapApproved] = useState(false);

  // Diagnosis Assist state
  const [symptomsInput, setSymptomsInput] = useState('');
  const [historyInput, setHistoryInput] = useState('');
  const [diagnosticsOutput, setDiagnosticsOutput] = useState<any[] | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  // Filter Doctor appointments
  const myAppointments = appointments.filter(a => a.doctorId === user?.id);
  const myPatients = patients.filter(p => myAppointments.some(a => a.patientId === p.id));
  
  // Workload indicator: flagging if appointment count is greater than 5
  const isWorkloadHigh = myAppointments.length >= 5;

  // Handle SOAP note generation
  const handleGenerateSOAP = async () => {
    if (!dictation) return;
    setSoapLoading(true);
    setSoapApproved(false);
    setSoapOutput('');

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'soap-note',
          payload: { text: dictation }
        })
      });
      const json = await res.json();
      if (json.data) {
        setSoapOutput(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSoapLoading(false);
    }
  };

  // Approve SOAP note and save to patient diagnosis history
  const handleApproveSOAP = async () => {
    if (!selectedPatientId || !soapOutput) return;
    try {
      // Parse description from SOAP note (for mock, we just send description)
      const newDiagnosis = {
        patientId: selectedPatientId,
        staffId: user?.id || 'system',
        date: new Date().toISOString(),
        icdCode: 'ICD-10-SOAP',
        description: `SOAP Clinical Summary:\n${soapOutput.substring(0, 300)}...`,
        severity: 'medium' as const
      };
      await addDiagnosis('diagnoses', newDiagnosis);
      setSoapApproved(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Diagnosis Assist
  const handleDiagnosisAssist = async () => {
    if (!symptomsInput) return;
    setDiagLoading(true);
    setDiagnosticsOutput(null);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'diagnosis-assist',
          payload: { symptoms: symptomsInput, history: historyInput }
        })
      });
      const json = await res.json();
      if (json.data && json.data.differentials) {
        setDiagnosticsOutput(json.data.differentials);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDiagLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['doctor']}>
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in-up">
          
          {/* Header row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Clinician Workstation</h2>
              <p className="text-xs text-slate-500 mt-1">Hello Dr. {user?.name ? user.name.split(' ').slice(-1)[0] : 'Clinician'}. Manage consultations and generate documentation.</p>
            </div>
            
            {/* Workload Indicator Flag (FR-STF-10) */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold ${
              isWorkloadHigh 
                ? 'bg-red-50 border-red-200 text-red-700 animate-pulse'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <AlertTriangle className="h-4 w-4" />
              <span>
                Workload: {myAppointments.length} Active Slots
                {isWorkloadHigh ? ' (Over Recommended Threshold of 5)' : ' (Under Threshold)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Panel: Today's Appointments & Diagnosis Assist */}
            <div className="xl:col-span-4 space-y-6 text-left">
              
              {/* Appointments */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-cyan-600" />
                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">Consultations Schedule</h3>
                </div>

                <div className="space-y-2.5">
                  {myAppointments.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
                      No active slots booked for you today.
                    </div>
                  ) : (
                    myAppointments.map((apt) => {
                      const patient = patients.find(p => p.id === apt.patientId);
                      const timeStr = new Date(apt.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={apt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-slate-700 block">{patient?.name || 'Unknown Patient'}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{apt.type} &bull; Room {apt.roomId.replace('room-', '')}</span>
                          </div>
                          <span className="text-[10px] font-extrabold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md">
                            {timeStr}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Diagnosis Assist (Differential) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-cyan-600" />
                  <h3 className="font-extrabold text-slate-800 text-sm">Differential Diagnosis Assist</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Enter Symptoms</label>
                    <textarea
                      rows={2}
                      value={symptomsInput}
                      onChange={(e) => setSymptomsInput(e.target.value)}
                      placeholder="e.g. Chest pain radiating to left shoulder, diaphoresis, shortness of breath..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Baseline History (Optional)</label>
                    <input
                      type="text"
                      value={historyInput}
                      onChange={(e) => setHistoryInput(e.target.value)}
                      placeholder="e.g. Hypertension 10 yrs, smoker"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    onClick={handleDiagnosisAssist}
                    disabled={diagLoading || !symptomsInput}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold rounded-xl text-xs hover:from-cyan-700 hover:to-teal-700 disabled:opacity-50 transition"
                  >
                    {diagLoading ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        Generating Differentials...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4.5 w-4.5" />
                        Query Diagnosis differentials
                      </>
                    )}
                  </button>
                </div>

                {diagnosticsOutput && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">differential suggestions (advisory)</span>
                    <div className="space-y-2">
                      {diagnosticsOutput.map((diff, index) => (
                        <div key={index} className="p-2.5 rounded-xl bg-cyan-50/20 border border-cyan-100/50 text-xs">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>{diff.condition}</span>
                            <span className="text-cyan-600">{diff.confidence}% Match</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] font-medium text-slate-500 leading-relaxed max-w-[80%]">{diff.rationale}</span>
                            <span className="text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-600">{diff.icdCode}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Right Panel: SOAP Voice Scribe */}
            <div className="xl:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-cyan-600" />
                  <h3 className="font-extrabold text-slate-800 text-base">Clinical SOAP Note Scribe</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Mic className="h-4 w-4 text-cyan-500" />
                  <span>Scribe Engine Online</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-500">
                Dictate or type patient observations below. SehatSetu AI will format these into clean Subjective, Objective, Assessment, and Plan subsections.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Select Patient Reference</label>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Choose Patient for Record Injection --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Age {p.age})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Scribe Format Style</label>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-500">
                      Standard SOAP Structure
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Voice Dictation / Free Text input</label>
                  <textarea
                    rows={4}
                    value={dictation}
                    onChange={(e) => setDictation(e.target.value)}
                    placeholder="e.g. Patient presents with headaches for 3 days. Occasional dizziness. BP on testing was 152/95. Heart sounds normal. Adjusting Telmisartan dosage to 40mg. Follow up in 10 days."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleGenerateSOAP}
                    disabled={soapLoading || !dictation}
                    className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {soapLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating SOAP Note...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Compile Dictation Summary
                      </>
                    )}
                  </button>
                </div>

                {soapOutput && (
                  <div className="mt-6">
                    <AISummaryCard
                      title="AI Structured SOAP Note Draft"
                      summary={soapOutput}
                      confidence={95}
                      onApprove={selectedPatientId ? handleApproveSOAP : undefined}
                      approveLabel="Approve and write to Patient's Diagnoses"
                      isApproved={soapApproved}
                    />
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
