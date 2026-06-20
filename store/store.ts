import { create } from 'zustand';
import { 
  subscribeCollection, 
  addItem, 
  updateItem, 
  deleteItem, 
  getItems,
  seedFirestoreIfEmpty
} from '@/lib/firebase/db';
import { 
  Patient, 
  Staff, 
  Room, 
  Medicine, 
  Alert, 
  Appointment, 
  Diagnosis, 
  Treatment, 
  Analysis, 
  Task, 
  Responsibility, 
  MedicalHistory, 
  AuditLog, 
  StaffRole 
} from '@/types';

interface AppState {
  // Auth State
  user: any | null; // Can be Staff or Patient profile
  userRole: StaffRole | null;
  authLoading: boolean;

  // Data State
  patients: Patient[];
  staff: Staff[];
  rooms: Room[];
  medicines: Medicine[];
  alerts: Alert[];
  appointments: Appointment[];
  diagnoses: Diagnosis[];
  treatments: Treatment[];
  analyses: Analysis[];
  tasks: Task[];
  responsibilities: Responsibility[];
  history: MedicalHistory[];
  auditLogs: AuditLog[];
  
  // Load States
  loading: Record<string, boolean>;

  // Subscriptions unsubscribers
  unsubscribers: (() => void)[];

  // Auth Actions
  login: (email: string, role: StaffRole) => Promise<boolean>;
  logout: () => void;
  registerStaff: (staffData: Partial<Staff>) => Promise<any>;

  // Subscription Actions
  initSubscriptions: () => void;
  clearSubscriptions: () => void;

  // CRUD Actions
  createItemAction: (collection: any, item: any) => Promise<any>;
  updateItemAction: (collection: any, id: string, fields: any) => Promise<any>;
  deleteItemAction: (collection: any, id: string) => Promise<boolean>;
  
  // Custom Actions
  acknowledgeAlert: (alertId: string) => Promise<void>;
  admitPatient: (patientId: string, roomId: string) => Promise<boolean>;
  dischargePatient: (patientId: string, roomId: string) => Promise<boolean>;
  deductMedicineStock: (medicineId: string, qty: number) => Promise<void>;
  checkInventoryAlerts: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => {
  // Try loading user from local storage initially
  let initialUser = null;
  let initialRole: StaffRole | null = null;
  if (typeof window !== 'undefined') {
    const cachedUser = localStorage.getItem('sehatsetu_user');
    const cachedRole = localStorage.getItem('sehatsetu_role');
    if (cachedUser && cachedRole) {
      initialUser = JSON.parse(cachedUser);
      initialRole = cachedRole as StaffRole;
    }
  }

  return {
    user: initialUser,
    userRole: initialRole,
    authLoading: false,

    patients: [],
    staff: [],
    rooms: [],
    medicines: [],
    alerts: [],
    appointments: [],
    diagnoses: [],
    treatments: [],
    analyses: [],
    tasks: [],
    responsibilities: [],
    history: [],
    auditLogs: [],

    loading: {},
    unsubscribers: [],

    login: async (email: string, role: StaffRole) => {
      set({ authLoading: true });
      try {
        // Authenticating against mock staff/patients list
        const dbStaff = await getItems('staff');
        const dbPatients = await getItems('patients');

        let matchedUser = null;

        if (role === 'patient') {
          // In mock mode we can match patient email/nationalId
          matchedUser = dbPatients.find(p => p.contactNumber.replace(/\s/g, '').includes(email.replace(/\s/g, '')) || p.name.toLowerCase().includes(email.toLowerCase()));
          if (!matchedUser) {
            // Seed a matching patient for safety
            matchedUser = dbPatients[0];
          }
        } else {
          matchedUser = dbStaff.find(s => s.email.toLowerCase() === email.toLowerCase() && s.role === role);
          if (!matchedUser) {
            // Create a default user profile if email doesn't exist to allow easy login
            const defaultNames: Record<StaffRole, string> = {
              admin: 'Chief Administrator Aditya',
              doctor: 'Dr. Sarah Jenkins',
              nurse: 'David Chen',
              patient: 'Aarav Mehta'
            };
            matchedUser = {
              id: `staff-${role}-${Date.now().toString().slice(-4)}`,
              name: defaultNames[role],
              email,
              role,
              department: role === 'doctor' ? 'Cardiology' : (role === 'nurse' ? 'ICU' : 'Administration')
            };
          }
        }

        if (matchedUser) {
          localStorage.setItem('sehatsetu_user', JSON.stringify(matchedUser));
          localStorage.setItem('sehatsetu_role', role);
          set({ user: matchedUser, userRole: role, authLoading: false });
          
          // Log audit login trail
          const actor = role === 'patient' 
            ? { id: matchedUser.id, name: matchedUser.name, role: 'patient' }
            : { id: matchedUser.id, name: matchedUser.name, role };
            
          await addItem('auditLogs', {
            userId: actor.id,
            userName: actor.name,
            role: actor.role,
            action: 'login',
            entityType: 'staff' as any,
            entityId: actor.id,
            timestamp: new Date().toISOString()
          });

          // Bootstrap data listeners
          get().initSubscriptions();
          return true;
        }
        set({ authLoading: false });
        return false;
      } catch (err) {
        console.error("Login failed:", err);
        set({ authLoading: false });
        return false;
      }
    },

    logout: () => {
      const { user, userRole } = get();
      if (user && userRole) {
        addItem('auditLogs', {
          userId: user.id,
          userName: user.name,
          role: userRole,
          action: 'logout',
          entityType: 'staff' as any,
          entityId: user.id,
          timestamp: new Date().toISOString()
        });
      }

      localStorage.removeItem('sehatsetu_user');
      localStorage.removeItem('sehatsetu_role');
      get().clearSubscriptions();
      set({ user: null, userRole: null });
    },

    registerStaff: async (staffData: Partial<Staff>) => {
      try {
        const result = await addItem('staff', staffData);
        return result;
      } catch (err) {
        console.error("Register staff failed:", err);
        throw err;
      }
    },

    initSubscriptions: () => {
      // Clear old listeners first
      get().clearSubscriptions();

      // Seed Firestore database if empty
      seedFirestoreIfEmpty();

      const collections: { key: keyof AppState; name: string }[] = [
        { key: 'patients', name: 'patients' },
        { key: 'staff', name: 'staff' },
        { key: 'rooms', name: 'rooms' },
        { key: 'medicines', name: 'medicines' },
        { key: 'alerts', name: 'alerts' },
        { key: 'appointments', name: 'appointments' },
        { key: 'diagnoses', name: 'diagnoses' },
        { key: 'treatments', name: 'treatments' },
        { key: 'analyses', name: 'analyses' },
        { key: 'tasks', name: 'tasks' },
        { key: 'responsibilities', name: 'responsibilities' },
        { key: 'history', name: 'history' },
        { key: 'auditLogs', name: 'auditLogs' }
      ];

      const newUnsubs = collections.map((col) => {
        return subscribeCollection(col.name as any, (data) => {
          // Sort audit logs, alerts, appointments by date descending/ascending
          let sortedData = [...data];
          if (col.key === 'auditLogs' || col.key === 'alerts') {
            sortedData.sort((a, b) => new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime());
          }
          if (col.key === 'appointments') {
            sortedData.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
          }
          set({ [col.key]: sortedData } as any);
        });
      });

      set({ unsubscribers: newUnsubs });

      // Run daily alert checkers asynchronously
      get().checkInventoryAlerts();
    },

    clearSubscriptions: () => {
      const { unsubscribers } = get();
      unsubscribers.forEach((unsub) => unsub());
      set({ unsubscribers: [] });
    },

    createItemAction: async (collection: any, item: any) => {
      const { user, userRole } = get();
      const actor = user && userRole ? { id: user.id, name: user.name, role: userRole } : undefined;
      const result = await addItem(collection, item, actor);
      
      // Stock updates on prescription confirm
      if (collection === 'treatments' && item.type === 'medication') {
        // Find matching medicine and deduct stock
        const medicines = get().medicines;
        const matchedMed = medicines.find(m => m.name.toLowerCase() === item.medName.toLowerCase());
        if (matchedMed) {
          await get().deductMedicineStock(matchedMed.id, 1); // Deduct 1 unit for prescription
        }
      }
      return result;
    },

    updateItemAction: async (collection: any, id: string, fields: any) => {
      const { user, userRole } = get();
      const actor = user && userRole ? { id: user.id, name: user.name, role: userRole } : undefined;
      return await updateItem(collection, id, fields, actor);
    },

    deleteItemAction: async (collection: any, id: string) => {
      const { user, userRole } = get();
      const actor = user && userRole ? { id: user.id, name: user.name, role: userRole } : undefined;
      return await deleteItem(collection, id, actor);
    },

    acknowledgeAlert: async (alertId: string) => {
      const { user } = get();
      await get().updateItemAction('alerts', alertId, {
        status: 'acknowledged',
        acknowledgedAt: new Date().toISOString(),
        nurseId: user?.id || 'system'
      });
    },

    admitPatient: async (patientId: string, roomId: string) => {
      const room = get().rooms.find(r => r.id === roomId);
      if (!room) return false;
      if (room.currentOccupancy >= room.capacity) {
        return false; // Room full!
      }

      // Add patient ID to room array
      const updatedPatientIds = [...(room.patientIds || [])];
      if (!updatedPatientIds.includes(patientId)) {
        updatedPatientIds.push(patientId);
      }

      await get().updateItemAction('rooms', roomId, {
        patientIds: updatedPatientIds,
        currentOccupancy: updatedPatientIds.length
      });

      // Update room reference inside patient context (if any) or just audit it
      return true;
    },

    dischargePatient: async (patientId: string, roomId: string) => {
      const room = get().rooms.find(r => r.id === roomId);
      if (!room) return false;

      const updatedPatientIds = (room.patientIds || []).filter(id => id !== patientId);
      await get().updateItemAction('rooms', roomId, {
        patientIds: updatedPatientIds,
        currentOccupancy: updatedPatientIds.length
      });
      return true;
    },

    deductMedicineStock: async (medicineId: string, qty: number) => {
      const med = get().medicines.find(m => m.id === medicineId);
      if (!med) return;
      const newStock = Math.max(0, med.stockQty - qty);
      
      await get().updateItemAction('medicines', medicineId, {
        stockQty: newStock
      });

      // Trigger automatic low stock alerts
      if (newStock <= med.reorderLevel) {
        // Create an alert inside collection
        const alerts = get().alerts;
        const exists = alerts.some(a => a.title === 'Low Stock Warning' && a.body.includes(med.name) && a.status === 'active');
        if (!exists) {
          await addItem('alerts', {
            patientId: 'inventory',
            patientName: 'Pharmacy Store',
            priority: 'medium',
            title: 'Low Stock Warning',
            body: `Medicine stock levels for ${med.name} (${med.strength}) have dropped to ${newStock} (Reorder level: ${med.reorderLevel}).`,
            status: 'active',
            createdAt: new Date().toISOString()
          });
        }
      }
    },

    checkInventoryAlerts: async () => {
      // Loop over stock and expiry, generate alerts if needed
      const medicines = await getItems('medicines');
      const alerts = await getItems('alerts');
      
      for (const med of medicines) {
        // 1. Low stock checks
        if (med.stockQty <= med.reorderLevel) {
          const exists = alerts.some(a => a.title === 'Low Stock Warning' && a.body.includes(med.name) && a.status === 'active');
          if (!exists) {
            await addItem('alerts', {
              patientId: 'inventory',
              patientName: 'Pharmacy Store',
              priority: 'medium',
              title: 'Low Stock Warning',
              body: `Medicine stock levels for ${med.name} (${med.strength}) have dropped to ${med.stockQty}.`,
              status: 'active',
              createdAt: new Date().toISOString()
            });
          }
        }

        // 2. Expiry checks (within 30 days)
        const expiryDate = new Date(med.expiryDate);
        const daysToExpiry = (expiryDate.getTime() - Date.now()) / (24 * 3600 * 1000);
        if (daysToExpiry > 0 && daysToExpiry <= 30) {
          const exists = alerts.some(a => a.title === 'Expiry Alert' && a.body.includes(med.name) && a.status === 'active');
          if (!exists) {
            await addItem('alerts', {
              patientId: 'inventory',
              patientName: 'Pharmacy Store',
              priority: 'high',
              title: 'Expiry Alert',
              body: `Medicine inventory batch for ${med.name} (${med.strength}) is expiring within ${Math.ceil(daysToExpiry)} days (Expiry: ${med.expiryDate}).`,
              status: 'active',
              createdAt: new Date().toISOString()
            });
          }
        }
      }
    }
  };
});
