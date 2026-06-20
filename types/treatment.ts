export type TreatmentType = 'medication' | 'surgical' | 'rehabilitation';

export interface BaseTreatment {
  id: string;
  patientId: string;
  staffId: string; // Doctor or Nurse who recorded it
  type: TreatmentType;
  date: string; // ISO String
  notes?: string;
}

export interface MedicationTreatment extends BaseTreatment {
  type: 'medication';
  medName: string;
  route: string; // e.g. Oral, IV
  frequency: string; // e.g. Twice daily
  dosage: string; // e.g. 500mg
  startDate: string;
  endDate: string;
  prescribingDoctor: string; // Doctor Name
}

export interface SurgicalTreatment extends BaseTreatment {
  type: 'surgical';
  surgeonCredentials: string;
  anesthesiaType: string; // e.g. General, Local
  approach: string;
  site: string; // e.g. Left knee
  complications: string;
  outcomeNotes: string;
}

export interface RehabilitationTreatment extends BaseTreatment {
  type: 'rehabilitation';
  goals: string;
  initialAssessment: string;
  plan: string;
  schedule: string;
  progressNotes: string;
  dischargeStatus: string;
}

export type Treatment = MedicationTreatment | SurgicalTreatment | RehabilitationTreatment;
