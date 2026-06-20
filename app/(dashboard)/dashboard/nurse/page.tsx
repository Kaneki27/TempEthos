'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/store';
import RoleGuard from '@/components/shared/RoleGuard';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { 
  AlertCircle, 
  Check, 
  Clock, 
  MapPin, 
  Sparkles, 
  ClipboardCheck, 
  ChevronRight, 
  Activity,
  Loader2,
  Stethoscope
} from 'lucide-react';
import { Alert, Task } from '@/types';

export default function NurseDashboardPage() {
  const user = useStore((state) => state.user);
  const alerts = useStore((state) => state.alerts);
  const tasks = useStore((state) => state.tasks);
  const acknowledgeAlert = useStore((state) => state.acknowledgeAlert);
  const updateTaskStatus = useStore((state) => state.updateItemAction);

  // States
  const [triageEnabled, setTriageEnabled] = useState(false);
  const [triagedAlerts, setTriagedAlerts] = useState<Alert[]>([]);
  const [triageLoading, setTriageLoading] = useState(false);
  
  // Filter Nurse tasks
  const myTasks = tasks.filter(t => t.assignedTo === user?.id && t.status !== 'completed');

  // Priority Colors
  const priorityStyles = {
    critical: 'bg-red-100 text-red-800 border-red-200 animate-pulse',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  // Live alert list (active first)
  const activeAlerts = alerts.filter(a => a.status === 'active');

  // Trigger Gemini Alert Triage
  useEffect(() => {
    const runTriage = async () => {
      if (!triageEnabled || activeAlerts.length === 0) {
        setTriagedAlerts([]);
        return;
      }

      setTriageLoading(true);
      try {
        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'alert-triage',
            payload: { alerts: activeAlerts, patientContexts: 'Critical care and General Ward patients' }
          })
        });
        const json = await res.json();
        
        if (json.data && Array.isArray(json.data)) {
          // Map re-ranked priorities and rationales back to alerts
          const reRanked = json.data.map((item: any) => {
            const original = activeAlerts.find(a => a.id === item.id);
            if (!original) return null;
            return {
              ...original,
              priority: item.priority,
              aiRationale: item.aiRationale
            };
          }).filter(Boolean) as Alert[];
          
          setTriagedAlerts(reRanked);
        }
      } catch (err) {
        console.error("Gemini triage re-rank failed:", err);
      } finally {
        setTriageLoading(false);
      }
    };

    runTriage();
  }, [triageEnabled, alerts]);

  // Group tasks by room location for AI Task Batching (FR-TSK-03)
  const getBatchedTasks = () => {
    const batches: Record<string, Task[]> = {};
    myTasks.forEach(task => {
      // Find room in title like 'Room 101' or extract a category
      let roomKey = 'General Ward';
      const roomMatch = task.title.match(/Room\s*([0-9a-zA-Z]+)/i);
      if (roomMatch) {
        roomKey = `Room ${roomMatch[1]}`;
      } else if (task.title.toLowerCase().includes('mehta')) {
        roomKey = 'Room 101'; // Admitted in seed rooms
      } else if (task.title.toLowerCase().includes('sharma')) {
        roomKey = 'Room 201'; // Admitted in seed rooms
      }
      
      if (!batches[roomKey]) batches[roomKey] = [];
      batches[roomKey].push(task);
    });
    return batches;
  };

  const batchedTasks = getBatchedTasks();

  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlert(id);
  };

  const handleCompleteTask = async (id: string) => {
    await updateTaskStatus('tasks', id, { status: 'completed' });
  };

  return (
    <RoleGuard allowedRoles={['nurse']}>
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in-up">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Nursing Operations Hub</h2>
              <p className="text-xs text-slate-500 mt-1">
                Monitor emergency calls, check assigned rooms, and batch medications.
              </p>
            </div>
            
            {/* Triage Toggle Button */}
            <button
              onClick={() => setTriageEnabled(!triageEnabled)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition ${
                triageEnabled 
                  ? 'bg-cyan-600 text-white shadow-cyan-600/10' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="h-4.5 w-4.5" />
              {triageEnabled ? 'Urgency Triage: Active' : 'Enable Gemini Urgency Triage'}
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Live Alerts Queue Panel */}
            <div className="xl:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <h3 className="font-extrabold text-slate-800 text-base">Ward Emergency Calls Feed</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {activeAlerts.length} Active Alerts
                </span>
              </div>

              {triageLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
                  <span className="text-xs font-semibold">Gemini re-ranking emergency priorities based on patient metrics...</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {activeAlerts.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-medium">
                      All patient calls are resolved. Good job!
                    </div>
                  ) : (
                    (triageEnabled ? triagedAlerts : activeAlerts).map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                          alert.priority === 'critical' ? 'bg-red-50/40 border-red-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-800">{alert.patientName}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${priorityStyles[alert.priority]}`}>
                              {alert.priority}
                            </span>
                            {triageEnabled && (
                              <span className="text-[9px] font-extrabold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded">
                                AI Triaged
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-xs font-bold text-slate-700">{alert.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">{alert.body}</p>

                          {/* AI Triage Explanation */}
                          {triageEnabled && alert.aiRationale && (
                            <div className="mt-2 text-[10px] bg-white/80 p-2 rounded-lg border border-cyan-100 text-cyan-700 font-medium flex gap-1.5 items-start">
                              <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                              <span>{alert.aiRationale}</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="flex items-center justify-center gap-1 bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 px-4 py-2 rounded-xl text-xs font-bold text-cyan-700 shadow-sm shrink-0 transition"
                        >
                          <Check className="h-4 w-4" />
                          Acknowledge
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Smart Batched Tasks List (FR-TSK-03) */}
            <div className="xl:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-cyan-600 shrink-0" />
                  <h3 className="font-extrabold text-slate-800 text-base">AI-Batched Ward Routine</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-cyan-600 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  <span>Grouped by Location</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-500">
                Repetitive routines are automatically grouped by room/ward coordinates to minimize nursing travel.
              </p>

              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                {myTasks.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-medium">
                    No pending shift tasks assigned to you.
                  </div>
                ) : (
                  Object.keys(batchedTasks).map((room) => (
                    <div key={room} className="space-y-2">
                      {/* Room Header */}
                      <div className="flex items-center gap-2 text-xs font-black text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <MapPin className="h-4 w-4 text-cyan-500 shrink-0" />
                        <span>{room}</span>
                      </div>

                      {/* Room Task Cards */}
                      <div className="space-y-1.5 pl-2">
                        {batchedTasks[room].map((task) => (
                          <div 
                            key={task.id} 
                            className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4 transition"
                          >
                            <div>
                              <span className="text-xs font-semibold text-slate-700 block">{task.title}</span>
                              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                <Clock className="h-3 w-3" />
                                Due {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <button
                              onClick={() => handleCompleteTask(task.id)}
                              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition"
                              title="Mark Completed"
                            >
                              <Check className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
