'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import RoleGuard from '@/components/shared/RoleGuard';
import DashboardLayout from '@/components/shared/DashboardLayout';
import AISummaryCard from '@/components/shared/AISummaryCard';
import { 
  Sparkles, 
  FileText, 
  ClipboardCheck, 
  BrainCircuit, 
  Loader2,
  Printer,
  Check
} from 'lucide-react';

export default function AIAssistantHubPage() {
  const user = useStore((state) => state.user);
  const patients = useStore((state) => state.patients);
  const treatments = useStore((state) => state.treatments);
  const diagnoses = useStore((state) => state.diagnoses);

  // States
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [dischargeSummary, setDischargeSummary] = useState('');
  const [dischargeLoading, setDischargeLoading] = useState(false);
  const [dischargeApproved, setDischargeApproved] = useState(false);

  // SOAP notes states
  const [dictation, setDictation] = useState('');
  const [soapOutput, setSoapOutput] = useState('');
  const [soapLoading, setSoapLoading] = useState(false);

  const handleGenerateDischarge = async () => {
    if (!selectedPatientId) return;
    setDischargeLoading(true);
    setDischargeApproved(false);
    setDischargeSummary('');

    try {
      const patient = patients.find(p => p.id === selectedPatientId);
      const patientTreats = treatments.filter(t => t.patientId === selectedPatientId);
      const patientDiags = diagnoses.filter(d => d.patientId === selectedPatientId);

      const patientDataPayload = {
        ...patient,
        treatments: patientTreats,
        diagnoses: patientDiags
      };

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'discharge-summary',
          payload: { patientData: patientDataPayload }
        })
      });
      const json = await res.json();
      if (json.data) {
        setDischargeSummary(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDischargeLoading(false);
    }
  };

  const handleGenerateSOAP = async () => {
    if (!dictation) return;
    setSoapLoading(true);
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

  return (
    <RoleGuard allowedRoles={['doctor', 'nurse']}>
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in-up">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Clinical AI Scribe Terminal</h2>
              <p className="text-xs text-slate-500 mt-1">
                Draft Soap notes from dictations, compile discharge briefs, and request diagnostics Differential guidance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-left">
            
            {/* Left Panel: SOAP Dictations scribe */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <FileText className="h-5 w-5 text-cyan-600 shrink-0" />
                <h3 className="font-extrabold text-slate-800 text-base">SOAP Scribing Scribe</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Voice Dictation Summary</label>
                  <textarea
                    rows={4}
                    value={dictation}
                    onChange={(e) => setDictation(e.target.value)}
                    placeholder="Enter raw dictation notes..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleGenerateSOAP}
                    disabled={soapLoading || !dictation}
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {soapLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Generate SOAP Note
                  </button>
                </div>

                {soapOutput && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 max-h-[300px] overflow-y-auto font-medium text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {soapOutput}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Discharge summaries (FR-AI-07) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <ClipboardCheck className="h-5 w-5 text-cyan-600 shrink-0" />
                <h3 className="font-extrabold text-slate-800 text-base">Gemini Discharge Summary Drafter</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Select Discharged Patient</label>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Age {p.age})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={handleGenerateDischarge}
                      disabled={dischargeLoading || !selectedPatientId}
                      className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {dischargeLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Draft Discharge summary
                    </button>
                  </div>
                </div>

                {dischargeSummary && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 max-h-[350px] overflow-y-auto prose prose-sm max-w-none text-xs text-slate-600 whitespace-pre-wrap leading-relaxed font-semibold">
                      {dischargeSummary}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 italic">
                        Advisory only — requires clinician signature
                      </span>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.print()}
                          className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-xl"
                          title="Print Document"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => setDischargeApproved(true)}
                          disabled={dischargeApproved}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition ${
                            dischargeApproved 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-cyan-600 text-white hover:bg-cyan-700'
                          }`}
                        >
                          {dischargeApproved ? (
                            <>
                              <Check className="h-4 w-4" />
                              Approved & Signed
                            </>
                          ) : (
                            'Approve & Sign Summary'
                          )}
                        </button>
                      </div>
                    </div>
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
