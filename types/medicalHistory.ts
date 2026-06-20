export interface MedicalHistory {
  id: string;
  patientId: string;
  staffId: string; // Staff member recording
  timestamp: string; // ISO String
  result: string;
  observation: string;
  complication: string;
  recordedBy: string; // Staff Name
}
