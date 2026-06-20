export interface AiReport {
  id: string;
  patientId: string;
  documentRef?: string; // File Storage path or link
  promptHash: string; // MD5/SHA or custom hash of input to verify cache hit
  geminiResponse: {
    summary: string;
    criticalFlags: {
      field: string;
      value: string;
      range: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      explanation: string;
    }[];
    suggestedFollowUp: string[];
    confidenceScore?: number; // 0 to 100
  };
  createdAt: string; // ISO String
  expiresAt: string; // ISO String (createdAt + 24 hours)
}
