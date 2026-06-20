export interface Procedure {
  id: string;
  patientId: string;
  staffId: string; // Doctor or Nurse performing
  title: string;
  description: string;
  date: string; // ISO String
  result: string;
  notes?: string;
  createdAt: string;
}
