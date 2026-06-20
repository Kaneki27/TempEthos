'use client';

import { useState } from 'react';
import { Room, Patient } from '@/types';
import { useStore } from '@/store/store';
import { Warehouse, User, DoorOpen, ShieldCheck, Settings } from 'lucide-react';

interface BedMapProps {
  rooms: Room[];
}

export default function BedMap({ rooms }: BedMapProps) {
  const patients = useStore((state) => state.patients);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Helper to determine occupancy color
  const getOccupancyColor = (room: Room) => {
    if (room.status === 'maintenance') return 'border-slate-200 bg-slate-100 text-slate-400';
    if (room.status === 'isolated') return 'border-purple-200 bg-purple-50 text-purple-700';

    const ratio = room.currentOccupancy / room.capacity;
    if (ratio === 0) return 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400';
    if (ratio < 1) return 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400';
    return 'border-red-200 bg-red-50 text-red-700 hover:border-red-400';
  };

  // Helper to get patients admitted in this room
  const getAdmittedPatients = (room: Room): Patient[] => {
    return patients.filter(p => room.patientIds?.includes(p.id));
  };

  return (
    <div className="space-y-6">
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 text-xs font-semibold text-slate-500 shadow-sm">
        <span className="text-slate-400 font-bold uppercase tracking-wider mr-2">Bed status:</span>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-emerald-500 border border-emerald-600" />
          <span>Vacant / Low Occupancy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-amber-500 border border-amber-600" />
          <span>Mid Occupancy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-red-500 border border-red-600" />
          <span>At Full Capacity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-slate-300 border border-slate-400" />
          <span>Maintenance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-purple-400 border border-purple-500" />
          <span>Isolation Ward</span>
        </div>
      </div>

      {/* Grid of Rooms */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {rooms.map((room) => {
          const occupancyColor = getOccupancyColor(room);
          const ratio = `${room.currentOccupancy}/${room.capacity}`;
          return (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-32 transition duration-200 cursor-pointer ${occupancyColor}`}
            >
              <div className="flex items-start justify-between w-full">
                <div className="bg-white/80 p-1.5 rounded-lg border border-current/10 shrink-0">
                  <Warehouse className="h-4.5 w-4.5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/60 border border-current/10">
                  {room.type}
                </span>
              </div>

              <div>
                <span className="text-base font-extrabold block">Room {room.roomNumber}</span>
                <span className="text-[11px] font-medium opacity-80 block truncate">{room.ward}</span>
              </div>

              <div className="flex items-center justify-between w-full pt-1.5 border-t border-current/5 mt-1 text-xs font-bold">
                <span className="opacity-80">Occupancy</span>
                <span>{ratio} Beds</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Room Detail Modal Drawer */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 relative animate-fade-in-up">
            
            <button
              onClick={() => setSelectedRoom(null)}
              className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-lg"
            >
              Close
            </button>

            <div className="flex items-center gap-3">
              <div className="bg-cyan-100 p-2.5 rounded-xl text-cyan-700">
                <Warehouse className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800">Room {selectedRoom.roomNumber}</h3>
                <span className="text-xs text-slate-400">{selectedRoom.ward} &bull; {selectedRoom.type.toUpperCase()}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Beds Capacity</span>
                  <span className="text-lg font-extrabold text-slate-700 mt-1 block">{selectedRoom.capacity} Total</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admitted Patients</span>
                  <span className="text-lg font-extrabold text-slate-700 mt-1 block">
                    {selectedRoom.currentOccupancy} / {selectedRoom.capacity}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-semibold text-slate-600">
                <span>Room Status</span>
                <span className="capitalize font-bold text-cyan-600 flex items-center gap-1.5">
                  <DoorOpen className="h-4 w-4" />
                  {selectedRoom.status}
                </span>
              </div>

              {/* Patient List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Currently Admitted</span>
                {selectedRoom.currentOccupancy === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
                    This room is currently empty.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getAdmittedPatients(selectedRoom).map((patient) => (
                      <div 
                        key={patient.id} 
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition"
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-cyan-600" />
                          <div>
                            <span className="text-xs font-bold text-slate-700 block">{patient.name}</span>
                            <span className="text-[10px] text-slate-400 block">Age {patient.age} &bull; Blood {patient.bloodType}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedRoom(null);
                            // Push route to patient detail
                            window.location.href = `/patients/${patient.id}`;
                          }}
                          className="text-[10px] font-bold text-cyan-600 hover:text-cyan-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg"
                        >
                          View File
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
