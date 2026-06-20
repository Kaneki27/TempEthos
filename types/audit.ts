export interface AuditLog {
  id: string;
  userId: string; // Staff ID
  userName: string; // Staff Name
  role: string; // admin | doctor | nurse
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout';
  entityType: 'patient' | 'staff' | 'treatment' | 'diagnosis' | 'history' | 'analysis' | 'medicine' | 'appointment' | 'room' | 'task';
  entityId: string;
  diff?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  timestamp: string; // ISO String
}
