export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  assignedTo: string; // Staff ID
  priority: TaskPriority;
  dueDate: string; // ISO String
  status: TaskStatus;
  notes?: string;
  category?: string; // e.g. Room check, Medication round
  createdAt: string;
}

export interface Responsibility {
  id: string;
  title: string;
  assignedTo: string; // Staff ID
  department: string;
  description: string;
  createdAt: string;
}
