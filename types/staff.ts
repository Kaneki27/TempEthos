export type StaffRole = 'admin' | 'doctor' | 'nurse' | 'patient';

export interface BaseStaff {
  id: string;
  name: string;
  nationalId: string;
  email: string;
  dateOfBirth: string; // YYYY-MM-DD
  age: number;
  contactNumber: string;
  jobTitle: string;
  department: string;
  role: StaffRole;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface Doctor extends BaseStaff {
  role: 'doctor';
  specialization: string;
  yearsOfExperience: number;
  appointmentIds: string[];
}

export interface Nurse extends BaseStaff {
  role: 'nurse';
  certification: string;
  yearsOfExperience: number;
  specialization: string;
  shift: 'morning' | 'evening' | 'night';
}

export interface Administrative extends BaseStaff {
  role: 'admin';
  taskIds: string[];
  responsibilityIds: string[];
}

export type Staff = Doctor | Nurse | Administrative;
