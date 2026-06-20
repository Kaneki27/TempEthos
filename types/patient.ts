export interface Patient {
  id: string;
  name: string;
  nationalId: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string; // YYYY-MM-DD
  age: number;
  height: number; // cm
  weight: number; // kg
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  address: string;
  contactNumber: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  isArchived: boolean;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}
