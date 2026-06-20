export type DiagnosisSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Diagnosis {
  id: string;
  patientId: string;
  staffId: string; // Diagnosing physician
  date: string; // ISO String
  icdCode: string; // e.g. E11.9
  description: string;
  severity: DiagnosisSeverity;
}
