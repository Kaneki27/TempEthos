'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import RoleGuard from '@/components/shared/RoleGuard';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { 
  ShieldCheck, 
  Download, 
  Search, 
  ArrowRight, 
  Trash2, 
  User,
  History
} from 'lucide-react';
import { AuditLog } from '@/types';

export default function ComplianceAuditPage() {
  const auditLogs = useStore((state) => state.auditLogs);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter(log => {
    return log.userName.toLowerCase().includes(search.toLowerCase()) ||
           log.entityType.toLowerCase().includes(search.toLowerCase()) ||
           log.action.toLowerCase().includes(search.toLowerCase());
  });

  const getActionColor = (action: AuditLog['action']) => {
    switch (action) {
      case 'create': return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      case 'update': return 'bg-cyan-50 text-cyan-700 border-cyan-150';
      case 'delete': return 'bg-red-50 text-red-700 border-red-150';
      case 'login': return 'bg-blue-50 text-blue-700 border-blue-150';
      case 'logout': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // CSV Exporter (FR-AUD-04)
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,User,Role,Action,Entity,EntityID\n";
    
    filteredLogs.forEach(log => {
      const line = `${log.timestamp},${log.userName},${log.role},${log.action},${log.entityType},${log.entityId}`;
      csvContent += line + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SehatSetu_ComplianceAudit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in-up">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Compliance & Security Audits</h2>
              <p className="text-xs text-slate-500 mt-1">
                Monitor clinical CRUD transactions, track field diff records, and download logs.
              </p>
            </div>
            
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition"
            >
              <Download className="h-4 w-4" />
              Export Audit Trail (CSV)
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Panel: Audit Logs Timeline List */}
            <div className="xl:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
              
              <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0" />
                  <h3 className="font-extrabold text-slate-800 text-base">Immutable Security Ledger</h3>
                </div>
                
                {/* Search bar */}
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter logs by user name..."
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredLogs.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-medium">
                    No audits logged yet.
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition ${
                        selectedLog?.id === log.id ? 'border-cyan-500 ring-2 ring-cyan-50 bg-cyan-50/10' : 'border-slate-150 bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-cyan-600" />
                            {log.userName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold capitalize">({log.role})</span>
                          
                          <span className={`text-[8px] font-black uppercase px-2 py-0.25 rounded border ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 font-semibold">
                          Target entity: <span className="capitalize">{log.entityType}</span> &bull; ID: <span className="font-mono">{log.entityId}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div className="hidden sm:block text-[10px] text-slate-400 font-semibold">
                          <span className="block">{new Date(log.timestamp).toLocaleDateString()}</span>
                          <span className="block mt-0.5">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Panel: Selected Log Details & Field Diff */}
            <div className="xl:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
              <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                <History className="h-5 w-5 text-cyan-600 shrink-0" />
                <h3 className="font-extrabold text-slate-800 text-base">Field Delta Diff Analyzer</h3>
              </div>

              {selectedLog ? (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Transaction ID</span>
                      <span className="font-mono font-bold text-slate-700">{selectedLog.id}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Timestamp</span>
                      <span className="font-semibold text-slate-700">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Clinical Actor</span>
                      <span className="font-bold text-slate-700">{selectedLog.userName}</span>
                    </div>
                  </div>

                  {/* Diff Analysis */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Field Modifications</span>
                    
                    {selectedLog.diff ? (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        
                        {/* If update, show before / after comparisons */}
                        {selectedLog.diff.before && selectedLog.diff.after && (
                          Object.keys(selectedLog.diff.after).map((key) => {
                            const valBefore = selectedLog.diff?.before?.[key];
                            const valAfter = selectedLog.diff?.after?.[key];
                            if (valBefore === undefined || valBefore === valAfter) return null;

                            return (
                              <div key={key} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                                <span className="font-bold text-slate-700 uppercase text-[9px] tracking-wider block border-b border-slate-200 pb-1">{key}</span>
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                  <div className="text-red-700 font-bold bg-red-50 p-1 rounded border border-red-100 text-center">
                                    <span className="block text-[8px] text-red-400 uppercase font-black">Before</span>
                                    <span className="truncate block mt-0.5">{JSON.stringify(valBefore)}</span>
                                  </div>
                                  <div className="text-emerald-700 font-bold bg-emerald-50 p-1 rounded border border-emerald-100 text-center">
                                    <span className="block text-[8px] text-emerald-400 uppercase font-black">After</span>
                                    <span className="truncate block mt-0.5">{JSON.stringify(valAfter)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}

                        {/* If create, show added values */}
                        {selectedLog.action === 'create' && selectedLog.diff.after && (
                          <div className="p-3 bg-emerald-50/20 border border-emerald-100 rounded-xl text-[10px]">
                            <span className="font-extrabold text-emerald-800 uppercase block mb-1">New Entity Registered</span>
                            <pre className="font-mono text-[9px] bg-white p-2 rounded border border-slate-100 overflow-x-auto">
                              {JSON.stringify(selectedLog.diff.after, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* If delete, show removed values */}
                        {selectedLog.action === 'delete' && selectedLog.diff.before && (
                          <div className="p-3 bg-red-50/20 border border-red-100 rounded-xl text-[10px]">
                            <span className="font-extrabold text-red-800 uppercase block mb-1">Entity Deleted</span>
                            <pre className="font-mono text-[9px] bg-white p-2 rounded border border-slate-100 overflow-x-auto">
                              {JSON.stringify(selectedLog.diff.before, null, 2)}
                            </pre>
                          </div>
                        )}

                      </div>
                    ) : (
                      <div className="p-4 text-center border border-slate-200 rounded-xl text-slate-400 text-xs italic font-medium">
                        No field changes recorded for this transaction scope (e.g. login/logout event).
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-medium">
                  Select a transaction log from the security ledger to analyze the field differences.
                </div>
              )}
            </div>

          </div>

        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
