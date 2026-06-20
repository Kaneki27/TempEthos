'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import DashboardLayout from '@/components/shared/DashboardLayout';
import BedMap from '@/components/shared/BedMap';
import { 
  Warehouse, 
  Plus, 
  Trash2, 
  Edit,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Room, RoomType, RoomStatus } from '@/types';

export default function RoomsPage() {
  const rooms = useStore((state) => state.rooms);
  const patients = useStore((state) => state.patients);
  const userRole = useStore((state) => state.userRole);

  const createRoom = useStore((state) => state.createItemAction);
  const updateRoom = useStore((state) => state.updateItemAction);
  const deleteRoom = useStore((state) => state.deleteItemAction);

  // States
  const [showAddForm, setShowAddForm] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [ward, setWard] = useState('');
  const [type, setType] = useState<RoomType>('general');
  const [capacity, setCapacity] = useState('4');
  const [status, setStatus] = useState<RoomStatus>('active');

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber || !ward) return;

    try {
      const payload: Partial<Room> = {
        roomNumber,
        ward,
        type,
        capacity: Number(capacity),
        currentOccupancy: 0,
        status,
        patientIds: []
      };

      await createRoom('rooms', payload);
      setShowAddForm(false);

      // Reset
      setRoomNumber('');
      setWard('');
      setCapacity('4');
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: RoomStatus) => {
    await updateRoom('rooms', id, { status: newStatus });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to retire this room configuration?")) {
      await deleteRoom('rooms', id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Wards & Capacity Management</h2>
            <p className="text-xs text-slate-500 mt-1">Configure hospital wards, track bed occupancy heatmaps, and toggle isolations.</p>
          </div>

          {userRole === 'admin' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition"
            >
              <Plus className="h-4 w-4" />
              Configure Ward Room
            </button>
          )}
        </div>

        {/* Heatmap Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
          <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">Real-Time Bed Allocations Heatmap</h3>
          <BedMap rooms={rooms} />
        </div>

        {/* Add Room Modal Overlay */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <form 
              onSubmit={handleAddRoom}
              className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 relative animate-fade-in-up space-y-4"
            >
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg"
              >
                Close
              </button>

              <h3 className="font-extrabold text-slate-800 text-base">Configure Hospital Room</h3>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Room Number *</label>
                  <input
                    type="text" required value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. 104"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ward Name *</label>
                  <input
                    type="text" required value={ward} onChange={(e) => setWard(e.target.value)}
                    placeholder="e.g. ICU Ward A"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Room Type</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {['general', 'icu', 'ccu', 'pediatric', 'surgical', 'maternity'].map(t => (
                      <option key={t} value={t}>{t.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bed Capacity *</label>
                  <input
                    type="number" required min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="active">Active (Open)</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="isolated">Isolation Duty</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                Register Room Configuration
              </button>
            </form>
          </div>
        )}

        {/* Detailed Room Inventory Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Room No.</th>
                  <th>Ward Assignment</th>
                  <th>Ward Type</th>
                  <th>Beds occupancy</th>
                  <th>Current Status</th>
                  {userRole === 'admin' && <th className="text-right">Configure</th>}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td className="font-bold text-slate-800 text-xs sm:text-sm">Room {room.roomNumber}</td>
                    <td className="text-xs font-semibold text-slate-600">{room.ward}</td>
                    <td>
                      <span className="text-[10px] font-black text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full uppercase border border-cyan-100">
                        {room.type}
                      </span>
                    </td>
                    <td className="text-xs font-bold text-slate-600">
                      {room.currentOccupancy} / {room.capacity} Beds
                    </td>
                    <td>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase border ${
                        room.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        room.status === 'maintenance' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                        'bg-purple-50 text-purple-700 border-purple-100'
                      }`}>
                        {room.status}
                      </span>
                    </td>
                    {userRole === 'admin' && (
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <select
                            value={room.status}
                            onChange={(e) => handleStatusChange(room.id, e.target.value as RoomStatus)}
                            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600 focus:outline-none"
                          >
                            <option value="active">Open</option>
                            <option value="maintenance">Maint.</option>
                            <option value="isolated">Isol.</option>
                          </select>
                          
                          <button
                            onClick={() => handleDelete(room.id)}
                            className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-700 rounded-lg transition"
                            title="Delete Configuration"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
