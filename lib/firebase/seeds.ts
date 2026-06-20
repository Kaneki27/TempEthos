import { Patient, Doctor, Nurse, Administrative, Staff, Treatment, Diagnosis, MedicalHistory, Analysis, Medicine, Room, Task, Responsibility, Alert, AiReport, Appointment } from '../../types';

export const seedPatients: Patient[] = [
  {
    id: 'patient-1',
    name: 'Aarav Mehta',
    nationalId: '1234-5678-9012',
    gender: 'male',
    dateOfBirth: '1980-05-15',
    age: 46,
    height: 175,
    weight: 78,
    bloodType: 'A+',
    address: 'Flat 402, Shanti Heights, Mumbai, Maharashtra 400001',
    contactNumber: '+91 98765 43210',
    emergencyContact: { name: 'Priya Mehta', relation: 'Spouse', phone: '+91 98765 43211' },
    isArchived: false,
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'patient-2',
    name: 'Kalyani Sharma',
    nationalId: '9876-5432-1098',
    gender: 'female',
    dateOfBirth: '1958-11-23',
    age: 67,
    height: 158,
    weight: 62,
    bloodType: 'O-',
    address: 'House 12, Sector 15, Noida, Uttar Pradesh 201301',
    contactNumber: '+91 91234 56789',
    emergencyContact: { name: 'Rahul Sharma', relation: 'Son', phone: '+91 91234 56780' },
    isArchived: false,
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'patient-3',
    name: 'Vikram Singh',
    nationalId: '5566-7788-9900',
    gender: 'male',
    dateOfBirth: '1992-08-09',
    age: 33,
    height: 182,
    weight: 85,
    bloodType: 'AB+',
    address: '45, Civil Lines, Jaipur, Rajasthan 302001',
    contactNumber: '+91 93456 78901',
    emergencyContact: { name: 'Rajesh Singh', relation: 'Father', phone: '+91 93456 78902' },
    isArchived: false,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  }
];

export const seedStaff: Staff[] = [
  {
    id: 'staff-admin-1',
    name: 'Aditya Sen',
    nationalId: '1111-2222-3333',
    email: 'admin@sehatsetu.com',
    dateOfBirth: '1975-04-12',
    age: 51,
    contactNumber: '+91 90000 11111',
    jobTitle: 'Chief Hospital Administrator',
    department: 'Administration',
    role: 'admin',
    createdAt: new Date(Date.now() - 100 * 24 * 3600 * 1000).toISOString(),
    status: 'active',
    taskIds: [],
    responsibilityIds: ['resp-1', 'resp-2']
  } as Administrative,
  {
    id: 'staff-doctor-1',
    name: 'Dr. Sarah Jenkins',
    nationalId: '4444-5555-6666',
    email: 'doctor@sehatsetu.com',
    dateOfBirth: '1982-10-30',
    age: 43,
    contactNumber: '+91 90000 22222',
    jobTitle: 'Senior Consultant Cardiologist',
    department: 'Cardiology',
    role: 'doctor',
    createdAt: new Date(Date.now() - 80 * 24 * 3600 * 1000).toISOString(),
    status: 'active',
    specialization: 'Cardiology',
    yearsOfExperience: 16,
    appointmentIds: ['apt-1', 'apt-2']
  } as Doctor,
  {
    id: 'staff-nurse-1',
    name: 'David Chen',
    nationalId: '7777-8888-9999',
    email: 'nurse@sehatsetu.com',
    dateOfBirth: '1989-06-18',
    age: 37,
    contactNumber: '+91 90000 33333',
    jobTitle: 'Critical Care Registered Nurse',
    department: 'ICU',
    role: 'nurse',
    createdAt: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString(),
    status: 'active',
    certification: 'RN, BSN, CCRN',
    yearsOfExperience: 11,
    specialization: 'ICU & Critical Care',
    shift: 'morning'
  } as Nurse,
  {
    id: 'staff-nurse-2',
    name: 'Anjali Desai',
    nationalId: '8888-9999-0000',
    email: 'nurse2@sehatsetu.com',
    dateOfBirth: '1993-01-22',
    age: 33,
    contactNumber: '+91 90000 44444',
    jobTitle: 'Ward Nurse',
    department: 'General Medicine',
    role: 'nurse',
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    status: 'active',
    certification: 'RN, GNM',
    yearsOfExperience: 6,
    specialization: 'General Medicine',
    shift: 'evening'
  } as Nurse
];

export const seedRooms: Room[] = [
  { id: 'room-101', roomNumber: '101', ward: 'ICU Ward A', type: 'icu', capacity: 2, currentOccupancy: 1, status: 'active', patientIds: ['patient-1'] },
  { id: 'room-102', roomNumber: '102', ward: 'ICU Ward A', type: 'icu', capacity: 2, currentOccupancy: 0, status: 'active', patientIds: [] },
  { id: 'room-201', roomNumber: '201', ward: 'General Ward B', type: 'general', capacity: 4, currentOccupancy: 2, status: 'active', patientIds: ['patient-2', 'patient-3'] },
  { id: 'room-202', roomNumber: '202', ward: 'General Ward B', type: 'general', capacity: 4, currentOccupancy: 0, status: 'active', patientIds: [] },
  { id: 'room-301', roomNumber: '301', ward: 'Maternity Ward C', type: 'maternity', capacity: 2, currentOccupancy: 0, status: 'maintenance', patientIds: [] }
];

export const seedMedicines: Medicine[] = [
  { id: 'med-1', name: 'Paracetamol', genericName: 'Acetaminophen', category: 'Analgesics', dosageForm: 'Tablet', strength: '650mg', manufacturer: 'GSK', stockQty: 500, reorderLevel: 100, expiryDate: '2027-12-31', unitPrice: 15, createdAt: new Date().toISOString() },
  { id: 'med-2', name: 'Amoxicillin', genericName: 'Amoxicillin Trihydrate', category: 'Antibiotics', dosageForm: 'Capsule', strength: '500mg', manufacturer: 'Abbott', stockQty: 80, reorderLevel: 100, expiryDate: '2026-09-15', unitPrice: 45, createdAt: new Date().toISOString() },
  { id: 'med-3', name: 'Humulin R', genericName: 'Insulin Regular', category: 'Antidiabetics', dosageForm: 'Injection', strength: '100 IU/mL', manufacturer: 'Eli Lilly', stockQty: 120, reorderLevel: 30, expiryDate: '2026-07-05', unitPrice: 320, createdAt: new Date().toISOString() },
  { id: 'med-4', name: 'Telmisartan', genericName: 'Telmisartan', category: 'Antihypertensives', dosageForm: 'Tablet', strength: '40mg', manufacturer: 'Cipla', stockQty: 400, reorderLevel: 50, expiryDate: '2028-03-20', unitPrice: 28, createdAt: new Date().toISOString() }
];

export const seedAlerts: Alert[] = [
  { id: 'alert-1', patientId: 'patient-1', patientName: 'Aarav Mehta', priority: 'critical', title: 'High Heart Rate Warning', body: 'Telemetry monitors spike in pulse rate: 128 bpm. Review vitals immediately.', status: 'active', createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
  { id: 'alert-2', patientId: 'patient-2', patientName: 'Kalyani Sharma', priority: 'medium', title: 'Assistance Call', body: 'Patient requested assistance for bathroom mobility support in Room 201.', status: 'active', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() }
];

export const seedAppointments: Appointment[] = [
  { id: 'apt-1', patientId: 'patient-1', doctorId: 'staff-doctor-1', roomId: 'room-101', dateTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), durationMin: 30, type: 'Cardiology Consultation', status: 'scheduled', notes: 'Routine checkup post myocardial infarction recovery.', createdAt: new Date().toISOString() },
  { id: 'apt-2', patientId: 'patient-2', doctorId: 'staff-doctor-1', roomId: 'room-201', dateTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), durationMin: 45, type: 'Hypertension Review', status: 'scheduled', notes: 'Adjusting telmisartan dosage.', createdAt: new Date().toISOString() }
];

export const seedDiagnoses: Diagnosis[] = [
  { id: 'diag-1', patientId: 'patient-1', staffId: 'staff-doctor-1', date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(), icdCode: 'I21.9', description: 'Acute myocardial infarction, unspecified', severity: 'critical' },
  { id: 'diag-2', patientId: 'patient-2', staffId: 'staff-doctor-1', date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), icdCode: 'I10', description: 'Essential (primary) hypertension', severity: 'high' }
];

export const seedTreatments: Treatment[] = [
  { id: 'treat-1', patientId: 'patient-1', staffId: 'staff-doctor-1', type: 'medication', date: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(), medName: 'Aspirin', route: 'Oral', frequency: 'Once daily', dosage: '75mg', startDate: '2026-06-11', endDate: '2027-06-11', prescribingDoctor: 'Dr. Sarah Jenkins' } as Treatment,
  { id: 'treat-2', patientId: 'patient-2', staffId: 'staff-doctor-1', type: 'rehabilitation', date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), goals: 'Reduce blood pressure through cardiovascular training', initialAssessment: 'BP 150/95, low cardiovascular endurance', plan: 'Brisk walking 20 mins, breathing exercises', schedule: 'Mon, Wed, Fri mornings', progressNotes: 'Patient showing adherence. BP down to 142/88.', dischargeStatus: 'Ongoing' } as Treatment
];

export const seedAnalyses: Analysis[] = [
  {
    id: 'ana-1',
    patientId: 'patient-1',
    staffId: 'staff-nurse-1',
    type: 'bioblood',
    date: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    bloodCount: { wbc: 8500, rbc: 4.8, hemoglobin: 14.2, platelets: 250000 },
    bloodChemistry: { sodium: 138, potassium: 4.1, glucose: 185, creatinine: 1.1 },
    bloodType: 'A+',
    coagulationProfile: { pt: 11.5, inr: 1.0 },
    referenceRanges: 'WBC: 4500-11000, Hemoglobin: 13.5-17.5, Glucose: 70-100 (Fasting)'
  } as Analysis,
  {
    id: 'ana-2',
    patientId: 'patient-2',
    staffId: 'staff-nurse-2',
    type: 'urine',
    date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    volume: 120,
    appearance: 'clear',
    ph: 6.2,
    glucose: 'negative',
    protein: 'trace',
    bloodCells: 2,
    bacteria: 'none',
    crystals: 'none'
  } as Analysis
];

export const seedTasks: Task[] = [
  { id: 'task-1', title: 'Administer insulin to Patient Aarav Mehta', assignedTo: 'staff-nurse-1', priority: 'high', dueDate: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), status: 'pending', category: 'Medication round', createdAt: new Date().toISOString() },
  { id: 'task-2', title: 'Check vitals for Kalyani Sharma (Room 201)', assignedTo: 'staff-nurse-1', priority: 'medium', dueDate: new Date(Date.now() + 3 * 3600 * 1000).toISOString(), status: 'pending', category: 'Room check', createdAt: new Date().toISOString() },
  { id: 'task-3', title: 'Wound dressing change: Vikram Singh', assignedTo: 'staff-nurse-2', priority: 'medium', dueDate: new Date(Date.now() + 1 * 3600 * 1000).toISOString(), status: 'pending', category: 'Clinical task', createdAt: new Date().toISOString() }
];

export const seedResponsibilities: Responsibility[] = [
  { id: 'resp-1', title: 'ICU Shift Leader', assignedTo: 'staff-nurse-1', department: 'ICU', description: 'Oversee nursing staff assignments and patient admissions inside ICU Ward A.', createdAt: new Date().toISOString() },
  { id: 'resp-2', title: 'Discharge Planning coordinator', assignedTo: 'staff-admin-1', department: 'Administration', description: 'Coordinate with doctors and families for efficient room turnovers.', createdAt: new Date().toISOString() }
];

export const seedHistory: MedicalHistory[] = [
  { id: 'hist-1', patientId: 'patient-1', staffId: 'staff-doctor-1', timestamp: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(), result: 'Admitted with substernal chest pressure radiating to left arm.', observation: 'ECG showing ST-segment elevation. Transferred to ICU.', complication: 'None', recordedBy: 'Dr. Sarah Jenkins' }
];

export const seedAiReports: AiReport[] = [
  {
    id: 'ai-rep-1',
    patientId: 'patient-1',
    promptHash: 'ana-1-hash',
    geminiResponse: {
      summary: 'Your blood test results show normal cell counts and clotting times. However, your blood glucose levels (sugar) are currently high at 185 mg/dL compared to the normal range. This requires attention, particularly when tracking recovery from a cardiac event.',
      criticalFlags: [
        { field: 'Glucose', value: '185 mg/dL', range: '70-100 mg/dL', severity: 'high', explanation: 'Significantly elevated sugar levels could point to hyperglycemia, pre-diabetes, or a stress response. Consult physician.' }
      ],
      suggestedFollowUp: [
        'Fasting blood glucose test tomorrow morning',
        'HbA1c test to evaluate average sugar control over 3 months',
        'Dietary evaluation'
      ],
      confidenceScore: 92
    },
    createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  }
];
