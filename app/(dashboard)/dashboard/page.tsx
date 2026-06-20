'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/store';
import RoleGuard from '@/components/shared/RoleGuard';
import DashboardLayout from '@/components/shared/DashboardLayout';
import BedMap from '@/components/shared/BedMap';
import { 
  Users, 
  Calendar, 
  Warehouse, 
  Stethoscope, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle,
  Loader2
} from 'lucide-react';

export default function AdminDashboardPage() {
  const patients = useStore((state) => state.patients);
  const appointments = useStore((state) => state.appointments);
  const staff = useStore((state) => state.staff);
  const rooms = useStore((state) => state.rooms);
  const medicines = useStore((state) => state.medicines);
  
  const [aiInsights, setAiInsights] = useState<{ insights: string[]; actions: string[] } | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Aggregated Stats
  const totalPatients = patients.length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.dateTime.startsWith(todayStr)).length;
  
  const activeStaff = staff.filter(s => s.status === 'active').length;
  
  const totalBeds = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const occupiedBeds = rooms.reduce((sum, r) => sum + r.currentOccupancy, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Medicine alerts count
  const lowStockCount = medicines.filter(m => m.stockQty <= m.reorderLevel).length;

  // Fetch Gemini Operational Insights
  useEffect(() => {
    const fetchInsights = async () => {
      setInsightsLoading(true);
      try {
        const statsPayload = {
          totalPatients,
          todayAppointments,
          activeStaff,
          bedOccupancy: occupancyRate,
          lowStockItems: lowStockCount,
          roomBreakdown: rooms.map(r => ({ room: r.roomNumber, type: r.type, occupied: r.currentOccupancy, capacity: r.capacity }))
        };

        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'operational-insight',
            payload: { stats: statsPayload }
          })
        });
        
        const json = await res.json();
        if (json.data) {
          setAiInsights(json.data);
        }
      } catch (err) {
        console.error("Failed to load Gemini operational insights:", err);
      } finally {
        setInsightsLoading(false);
      }
    };

    if (totalPatients > 0) {
      fetchInsights();
    }
  }, [totalPatients, todayAppointments, activeStaff, occupancyRate, lowStockCount, rooms]);

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in-up">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Hospital Administration Command</h2>
              <p className="text-xs text-slate-500 mt-1">Real-time occupancy maps, staffing charts, and predictive analysis.</p>
            </div>
          </div>

          {/* AI Operational Insights Banner */}
          <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50/40 to-teal-50/20 p-5 relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] h-20 w-20 rounded-full bg-cyan-200/20 blur-xl" />
            
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4.5 w-4.5 text-cyan-600 animate-pulse-slow" />
              <span className="font-bold text-slate-700 text-sm">Gemini Operations Optimization Suite</span>
            </div>

            {insightsLoading ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
                <span className="text-xs text-slate-500 font-medium">Aggregating database statistics and prompting Gemini...</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Metrics Summary</span>
                  <ul className="space-y-1.5">
                    {aiInsights.insights.map((ins, idx) => (
                      <li key={idx} className="text-xs text-slate-600 font-medium flex items-start gap-1.5">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500 shrink-0" />
                        <span>{ins}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t md:border-t-0 md:border-l border-cyan-100/50 pt-3 md:pt-0 md:pl-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Recommended Actions</span>
                  <ul className="space-y-1.5">
                    {aiInsights.actions.map((act, idx) => (
                      <li key={idx} className="text-xs text-emerald-700 font-semibold flex items-start gap-1.5">
                        <span className="mt-1 h-3.5 w-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Could not compile AI insights. Verify database records are loaded.</p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Patients</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">{totalPatients}</span>
              </div>
              <div className="bg-cyan-50 p-3 rounded-xl text-cyan-600">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bed Occupancy</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">{occupancyRate}%</span>
                <span className="text-[9px] font-bold text-slate-400 block mt-0.5">{occupiedBeds}/{totalBeds} Beds Filled</span>
              </div>
              <div className="bg-teal-50 p-3 rounded-xl text-teal-600">
                <Warehouse className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Slots</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">{todayAppointments}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Staff</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">{activeStaff}</span>
              </div>
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                <Stethoscope className="h-6 w-6" />
              </div>
            </div>

          </div>

          {/* Central Command Section (Bed Heatmap & Staffing) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Bed Occupancy Map */}
            <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Real-Time Ward Bed Map</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Visual capacity allocations and patient rooms.</p>
                </div>
              </div>
              <BedMap rooms={rooms} />
            </div>

            {/* Department Headcounts & Medicines warnings */}
            <div className="space-y-6">
              
              {/* Staffing Department Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Departmental Headcounts</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Staff distribution across active clinics.</p>
                </div>
                <div className="space-y-3.5">
                  {[
                    { dept: 'Cardiology', count: staff.filter(s => s.department === 'Cardiology').length, max: 5 },
                    { dept: 'ICU / Critical Care', count: staff.filter(s => s.department === 'ICU').length, max: 4 },
                    { dept: 'General Ward', count: staff.filter(s => s.department === 'General Medicine').length, max: 6 },
                    { dept: 'Administration', count: staff.filter(s => s.department === 'Administration').length, max: 3 }
                  ].map((d) => {
                    const pct = Math.min(100, Math.round((d.count / d.max) * 100));
                    return (
                      <div key={d.dept} className="space-y-1 text-xs">
                        <div className="flex justify-between text-slate-600 font-bold">
                          <span>{d.dept}</span>
                          <span>{d.count} / {d.max} Active</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-cyan-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Medicine Low Stock Warnings */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">Pharmacy Inventory</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Low stock warnings and critical alerts.</p>
                  </div>
                  {lowStockCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 animate-pulse">
                      <AlertTriangle className="h-3 w-3" />
                      {lowStockCount} Flags
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {medicines.filter(m => m.stockQty <= m.reorderLevel).length === 0 ? (
                    <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
                      All pharmaceutical stocks are currently stable.
                    </div>
                  ) : (
                    medicines.filter(m => m.stockQty <= m.reorderLevel).map((med) => (
                      <div key={med.id} className="flex justify-between items-center p-2.5 rounded-xl border border-red-100 bg-red-50/30 text-xs">
                        <div>
                          <span className="font-bold text-slate-700 block">{med.name}</span>
                          <span className="text-[10px] text-slate-400 block">{med.strength} &bull; {med.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-red-700 block">{med.stockQty} Units Left</span>
                          <span className="text-[9px] text-slate-400 block font-medium">Reorder level: {med.reorderLevel}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
