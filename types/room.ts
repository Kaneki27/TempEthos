export type RoomType = 'general' | 'icu' | 'ccu' | 'pediatric' | 'surgical' | 'maternity';
export type RoomStatus = 'active' | 'maintenance' | 'isolated';

export interface Room {
  id: string;
  roomNumber: string;
  ward: string; // e.g. Ward A, Ward B
  type: RoomType;
  capacity: number; // Max beds
  currentOccupancy: number; // Admitted patient count
  status: RoomStatus;
  patientIds: string[]; // List of patient IDs currently admitted to this room
}
