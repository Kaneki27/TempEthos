'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/store';
import RoleGuard from '@/components/shared/RoleGuard';
import DashboardLayout from '@/components/shared/DashboardLayout';
import AISummaryCard from '@/components/shared/AISummaryCard';
import { 
  HeartPulse, 
  Calendar, 
  FileText, 
  Sparkles, 
  Download, 
  Clock, 
  AlertCircle,
  Loader2,
  BookmarkCheck
} from 'lucide-react';
import { Appointment, Treatment, Analysis } from '@/types';

export default function PatientDashboardPage() {
  const user = useStore((state) => state.user);
  const appointments = useStore((state) => state.appointments);
  const treatments = useStore((state) => state.treatments);
  const analyses = useStore((state) => state.analyses);
  const staff = useStore((state) => state.staff);

  // AI Patient Summary state
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [aiGuide, setAiGuide] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  // Filter patient details
  const myAppointments = appointments.filter(a => a.patientId === user?.id);
  const myTreatments = treatments.filter(t => t.patientId === user?.id);
  const myAnalyses = analyses.filter(a => a.patientId === user?.id);
  
  // Medication list (active medications)
  const activeMedications = myTreatments.filter(t => t.type === 'medication') as any[];

  // Fetch AI Plain-language report summary and visit guide
  useEffect(() => {
    const fetchPatientAi = async () => {
      setAiLoading(true);
      try {
        // 1. Report summary (FR-PP-02)
        // If there's an analysis, summarize the latest one
        const latestAnalysis = myAnalyses[0];
        const analysisText = latestAnalysis 
          ? `Analysis Type: ${latestAnalysis.type}, Date: ${latestAnalysis.date}, blood chemistry: ${JSON.stringify((latestAnalysis as any).bloodChemistry || {})}`
          : 'Normal baseline review';

        const summaryRes = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'report-analysis',
            payload: { text: analysisText, patientId: user?.id, patientContext: `Age: ${user?.age}, Gender: ${user?.gender}` }
          })
        });
        const summaryJson = await summaryRes.json();
        if (summaryJson.data) {
          setAiSummary(summaryJson.data);
        }

        // 2. Visit guide (FR-PP-03)
        const guideRes = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'visit-guide',
            payload: { type: myAppointments[0]?.type || 'Standard Checkup', diagnosisCodes: 'Cardiovascular check' }
          })
        });
        const guideJson = await guideRes.json();
        if (guideJson.data) {
          setAiGuide(guideJson.data);
        }
      } catch (err) {
        console.error("Failed to load patient AI insights:", err);
      } finally {
        setAiLoading(false);
      }
    };

    if (user?.id) {
      fetchPatientAi();
    }
  }, [user]);

  // Export records as CSV/Simulated PDF (FR-PP-06)
  const handleDownloadRecords = () => {
    alert("Compiling patient health records... \nYour encrypted file (SehatSetu_MyRecords.pdf) is downloading.");
  };

  return (
    <RoleGuard allowedRoles={['patient']}>
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in-up">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">My SehatSetu Patient Portal</h2>
              <p className="text-xs text-slate-500 mt-1">Hello, {user?.name}. Review your active prescriptions, medical history, and pre-visit guides.</p>
            </div>
            
            <button
              onClick={handleDownloadRecords}
              className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition"
            >
              <Download className="h-4 w-4" />
              Download My Medical Records (PDF)
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Panel: Medications & Schedules */}
            <div className="xl:col-span-5 space-y-6 text-left">
              
              {/* Active Medications List */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                  <HeartPulse className="h-5 w-5 text-red-500 shrink-0" />
                  <h3 className="font-extrabold text-slate-800 text-base">Active Medications List</h3>
                </div>

                <div className="space-y-3">
                  {activeMedications.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
                      No active prescriptions on file.
                    </div>
                  ) : (
                    activeMedications.map((med) => (
                      <div key={med.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                        <div className="bg-white p-2 rounded-lg border border-slate-100 h-fit text-cyan-600 shrink-0">
                          <HeartPulse className="h-4.5 w-4.5" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-700 block">{med.medName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold block">
                            Dosage: {med.dosage} &bull; Route: {med.route}
                          </span>
                          <div className="inline-flex items-center gap-1 text-[9px] font-black text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                            <Clock className="h-3 w-3" />
                            <span>{med.frequency}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Consultation Schedules */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                  <Calendar className="h-5 w-5 text-cyan-600 shrink-0" />
                  <h3 className="font-extrabold text-slate-800 text-base">Appointments Calendar</h3>
                </div>

                <div className="space-y-3">
                  {myAppointments.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
                      No consultations scheduled yet.
                    </div>
                  ) : (
                    myAppointments.map((apt) => {
                      const doc = staff.find(s => s.id === apt.doctorId);
                      const timeStr = new Date(apt.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={apt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-bold text-slate-700 block">{apt.type}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Consultant: {doc?.name || 'Assigned Physician'}</span>
                            </div>
                            <span className="text-[9px] font-black bg-cyan-600 text-white px-2 py-0.5 rounded">
                              {timeStr}
                            </span>
                          </div>
                          {apt.notes && (
                            <p className="text-[10px] text-slate-500 bg-white p-2 rounded border border-slate-100 italic">
                              Note: {apt.notes}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Right Panel: Plain-Language Diagnostics & Visit Guide */}
            <div className="xl:col-span-7 space-y-6 text-left">
              
              {/* Plain-Language Lab Report Analysis */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cyan-600 shrink-0" />
                    <h3 className="font-extrabold text-slate-800 text-base">Plain-Language Lab Digest</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-cyan-700 bg-cyan-50 border border-cyan-100 px-2.5 py-0.5 rounded-full">
                    <Sparkles className="h-3 w-3" />
                    <span>Grade 8 Reading Level</span>
                  </div>
                </div>

                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
                    <span className="text-xs font-semibold">Gemini translating complex medical metrics into friendly summaries...</span>
                  </div>
                ) : aiSummary ? (
                  <AISummaryCard
                    title="Patient Diagnostic Report Analysis"
                    summary={aiSummary.summary}
                    confidence={aiSummary.confidenceScore}
                    criticalFlags={aiSummary.criticalFlags}
                    suggestedFollowUp={aiSummary.suggestedFollowUp}
                  />
                ) : (
                  <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
                    No active lab report files found on record.
                  </div>
                )}
              </div>

              {/* Pre/Post-Visit Guide Checklists */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                  <BookmarkCheck className="h-5 w-5 text-cyan-600 shrink-0" />
                  <h3 className="font-extrabold text-slate-800 text-base">My Visit Preparation Checklist</h3>
                </div>

                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center py-6 text-slate-500 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
                    <span className="text-xs font-semibold">Generating pre/post visit guides...</span>
                  </div>
                ) : aiGuide ? (
                  <div className="prose prose-sm max-w-none text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {aiGuide}
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
                    Visit instructions will appear once appointments are scheduled.
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
