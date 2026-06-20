'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { 
  Calendar, 
  Plus, 
  Search, 
  Trash2, 
  Sparkles, 
  AlertTriangle,
  Loader2,
  CalendarDays,
  Clock,
  User,
  CheckCircle2
} from 'lucide-react';
import { Appointment } from '@/types';

export default function AppointmentsPage() {
  const appointments = useStore((state) => state.appointments);
  const patients = useStore((state) => state.patients);
  const staff = useStore((state) => state.staff);
  const rooms = useStore((state) => state.rooms);
  
  const createAppointment = useStore((state) => state.createItemAction);
  const deleteAppointment = useStore((state) => state.deleteItemAction);
  const userRole = useStore((state) => state.userRole);

  // States
  const [showAddForm, setShowAddForm] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [type, setType] = useState('Consultation');
  const [notes, setNotes] = useState('');

  // Conflict state
  const [conflictMsg, setConflictMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Search
  const [search, setSearch] = useState('');

  // Sorter / Filter
  const doctors = staff.filter(s => s.role === 'doctor');
  const filteredAppointments = appointments.filter(apt => {
    const patientName = patients.find(p => p.id === apt.patientId)?.name || '';
    const doctorName = staff.find(s => s.id === apt.doctorId)?.name || '';
    return patientName.toLowerCase().includes(search.toLowerCase()) || 
           doctorName.toLowerCase().includes(search.toLowerCase()) ||
           apt.type.toLowerCase().includes(search.toLowerCase());
  });

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'Unknown Patient';
  const getDoctorName = (id: string) => staff.find(s => s.id === id)?.name || 'Consultant';
  const getRoomNumber = (id: string) => rooms.find(r => r.id === id)?.roomNumber || 'TBD';

  // Conflict Detection Algorithm (FR-APT-03)
  const checkConflicts = (docId: string, romId: string, slotTime: string, durMin: number): boolean => {
    setConflictMsg('');
    const newStart = new Date(slotTime).getTime();
    const newEnd = newStart + durMin * 60 * 1000;

    for (const apt of appointments) {
      if (apt.status === 'cancelled') continue;
      
      const aptStart = new Date(apt.dateTime).getTime();
      const aptEnd = aptStart + (apt.durationMin || 30) * 60 * 1000;

      // Overlap calculation: StartA < EndB AND StartB < EndA
      const overlaps = newStart < aptEnd && aptStart < newEnd;

      if (overlaps) {
        if (apt.doctorId === docId) {
          setConflictMsg(`Double-Booking Warning: Doctor ${getDoctorName(docId)} is already scheduled for a "${apt.type}" consultation during this slot (${new Date(apt.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}).`);
          return true;
        }
        if (apt.roomId === romId) {
          setConflictMsg(`Overload Warning: Room ${getRoomNumber(romId)} is occupied by another clinical procedure at this time.`);
          return true;
        }
      }
    }
    return false;
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictMsg('');
    setSuccessMsg('');

    if (!patientId || !doctorId || !roomId || !dateTime) {
      alert("Please fill in all slots.");
      return;
    }

    // Run conflict guard
    const hasConflict = checkConflicts(doctorId, roomId, dateTime, duration);
    if (hasConflict) return;

    try {
      const payload = {
        patientId,
        doctorId,
        roomId,
        dateTime,
        durationMin: Number(duration),
        type,
        status: 'scheduled' as const,
        notes
      };

      await createAppointment('appointments', payload);
      setSuccessMsg('Appointment scheduled successfully and synced in real-time!');
      
      setTimeout(() => {
        setSuccessMsg('');
        setShowAddForm(false);
        // Reset form
        setPatientId('');
        setDoctorId('');
        setRoomId('');
        setDateTime('');
        setNotes('');
      }, 1500);

    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to cancel this appointment slot?")) {
      await deleteAppointment('appointments', id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Appointments Booking Center</h2>
            <p className="text-xs text-slate-500 mt-1">Manage consultation slots, check clinician capacity, and detect scheduling blocks.</p>
          </div>

          {userRole !== 'patient' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition"
            >
              <Plus className="h-4 w-4" />
              Book Consultation Slot
            </button>
          )}
        </div>

        {/* Gemini scheduling hint */}
        <div className="p-4 rounded-2xl border border-cyan-100 bg-cyan-50/20 text-xs font-semibold text-cyan-800 flex gap-2.5 items-start text-left">
          <Sparkles className="h-4.5 w-4.5 text-cyan-600 shrink-0 mt-0.5" />
          <div>
            <span className="block font-bold">Gemini Smart Scheduling Assistant:</span>
            <span className="block mt-0.5 text-slate-500 font-medium">
              Consider booking non-urgent reviews during afternoons (14:00 - 16:00) when Cardiology ward headcounts are historic-low.
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left">
          <div className="sm:col-span-8 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, doctor, or consultation type..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
          <div className="sm:col-span-4 flex items-center justify-end text-xs font-semibold text-slate-400">
            {filteredAppointments.length} Active Slots Scheduled
          </div>
        </div>

        {/* Appointment Scheduler Dialog Form Overlay */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <form 
              onSubmit={handleAddAppointment}
              className="w-full max-w-lg bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 relative animate-fade-in-up space-y-4"
            >
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setConflictMsg('');
                }}
                className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg"
              >
                Close
              </button>

              <h3 className="font-extrabold text-slate-800 text-base">Book Appointment Slot</h3>

              {conflictMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex gap-2 text-left">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <span>{conflictMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex gap-2 text-left">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Patient *</label>
                  <select
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Age {p.age})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Consultant (Doctor) *</label>
                  <select
                    required
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assign Consult Room *</label>
                  <select
                    required
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Choose Room --</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.ward})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Consultation Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Duration (Minutes)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Consultation Category</label>
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="e.g. Follow-up, Diagnosis panel"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Appointment Brief Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Clinical notes or description..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                Schedule Appointment Slot
              </button>
            </form>
          </div>
        )}

        {/* Appointments List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredAppointments.length === 0 ? (
            <div className="col-span-3 p-12 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-medium bg-white">
              No scheduled appointments found matching search words.
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const patientName = getPatientName(apt.patientId);
              const doctorName = getDoctorName(apt.doctorId);
              const roomNumber = getRoomNumber(apt.roomId);
              const dateObj = new Date(apt.dateTime);
              const dateStr = dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
              const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={apt.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase bg-cyan-50 border border-cyan-100 text-cyan-700 px-2 py-0.5 rounded">
                        {apt.type}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm mt-1">{patientName}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold block">Attending: {doctorName}</span>
                    </div>

                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl">
                      Room {roomNumber}
                    </span>
                  </div>

                  <div className="flex gap-4 border-t border-b border-slate-50 py-3 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-cyan-600" />
                      <span>{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-cyan-600" />
                      <span>{timeStr}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1.5">
                    <span className="text-[10px] text-slate-400 italic">
                      Slot duration: {apt.durationMin || 30} mins
                    </span>

                    {userRole !== 'patient' && (
                      <button
                        onClick={() => handleDelete(apt.id)}
                        className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-700 rounded-lg transition"
                        title="Cancel Slot"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
