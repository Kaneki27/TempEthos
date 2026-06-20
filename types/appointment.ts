export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string; // Staff ID (role must be doctor)
  roomId: string; // Room ID
  dateTime: string; // ISO String
  durationMin: number;
  type: string; // e.g. Checkup, Consultation, Follow-up
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}
