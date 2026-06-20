export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  nurseId?: string; // Staff ID who acknowledged
  priority: AlertPriority;
  title: string;
  body: string;
  status: AlertStatus;
  createdAt: string; // ISO String
  acknowledgedAt?: string; // ISO String
  aiRationale?: string; // Gemini-generated alert re-ranking reason
}
