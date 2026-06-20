import { firestore } from './config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';
import { 
  seedPatients, 
  seedStaff, 
  seedRooms, 
  seedMedicines, 
  seedAlerts, 
  seedAppointments, 
  seedDiagnoses, 
  seedTreatments, 
  seedAnalyses, 
  seedTasks, 
  seedResponsibilities, 
  seedHistory, 
  seedAiReports 
} from './seeds';

type DbCollection = 'patients' | 'staff' | 'rooms' | 'medicines' | 'alerts' | 'appointments' | 'diagnoses' | 'treatments' | 'analyses' | 'tasks' | 'responsibilities' | 'history' | 'aiReports' | 'auditLogs';

// Automatic Firestore database seeder
export const seedFirestoreIfEmpty = async () => {
  try {
    // If rooms already exists, don't seed again
    const roomsSnap = await getDocs(query(collection(firestore, 'rooms'), limit(1)));
    if (!roomsSnap.empty) {
      console.log('Firestore database has existing collections. Skipping seeding.');
      return;
    }

    console.log('Firestore database is empty. Seeding default clinical records...');
    const batch = writeBatch(firestore);

    const addSeedItem = (colName: string, item: any) => {
      const docRef = doc(firestore, colName, item.id);
      const { id, ...data } = item;
      batch.set(docRef, data);
    };

    seedPatients.forEach(p => addSeedItem('patients', p));
    seedStaff.forEach(s => addSeedItem('staff', s));
    seedRooms.forEach(r => addSeedItem('rooms', r));
    seedMedicines.forEach(m => addSeedItem('medicines', m));
    seedAlerts.forEach(a => addSeedItem('alerts', a));
    seedAppointments.forEach(apt => addSeedItem('appointments', apt));
    seedDiagnoses.forEach(d => addSeedItem('diagnoses', d));
    seedTreatments.forEach(t => addSeedItem('treatments', t));
    seedAnalyses.forEach(ana => addSeedItem('analyses', ana));
    seedTasks.forEach(task => addSeedItem('tasks', task));
    seedResponsibilities.forEach(resp => addSeedItem('responsibilities', resp));
    seedHistory.forEach(hist => addSeedItem('history', hist));
    seedAiReports.forEach(rep => addSeedItem('aiReports', rep));

    await batch.commit();
    console.log('Firestore database successfully seeded.');
  } catch (err) {
    console.error('Firestore seeding failed:', err);
  }
};

// Real-time listener subscription
export const subscribeCollection = (
  colName: DbCollection, 
  callback: (data: any[]) => void
): (() => void) => {
  try {
    const q = query(collection(firestore, colName));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(items);
    }, (error) => {
      console.error(`Firestore subscription error for ${colName}:`, error);
    });
  } catch (err) {
    console.error(`Firestore query creation failed for ${colName}:`, err);
    return () => {};
  }
};

// CRUD: Read all
export const getItems = async (colName: DbCollection): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(collection(firestore, colName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (err) {
    console.error(`Firestore getItems failed for ${colName}:`, err);
    throw err;
  }
};

// CRUD: Read by ID
export const getItemById = async (colName: DbCollection, id: string): Promise<any | null> => {
  try {
    const docRef = doc(firestore, colName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (err) {
    console.error(`Firestore getItemById failed for ${colName}/${id}:`, err);
    throw err;
  }
};

// CRUD: Add
export const addItem = async (
  colName: DbCollection, 
  item: any, 
  actor?: { id: string; name: string; role: string }
): Promise<any> => {
  try {
    const docRef = await addDoc(collection(firestore, colName), {
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const newDoc = { id: docRef.id, ...item };
    
    // Log audit trail
    if (colName !== 'auditLogs' && actor) {
      await addDoc(collection(firestore, 'auditLogs'), {
        userId: actor.id,
        userName: actor.name,
        role: actor.role,
        action: 'create',
        entityType: colName,
        entityId: docRef.id,
        diff: { after: newDoc },
        timestamp: new Date().toISOString()
      });
    }
    return newDoc;
  } catch (err) {
    console.error(`Firestore addItem failed for ${colName}:`, err);
    throw err;
  }
};

// CRUD: Update
export const updateItem = async (
  colName: DbCollection, 
  id: string, 
  fields: any, 
  actor?: { id: string; name: string; role: string }
): Promise<any | null> => {
  try {
    const docRef = doc(firestore, colName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const oldDoc = docSnap.data();

    await updateDoc(docRef, {
      ...fields,
      updatedAt: new Date().toISOString()
    });

    const newDoc = { id, ...oldDoc, ...fields };

    // Log audit trail
    if (colName !== 'auditLogs' && actor) {
      const diff: any = { before: {}, after: {} };
      Object.keys(fields).forEach((key) => {
        if (oldDoc[key] !== fields[key]) {
          diff.before[key] = oldDoc[key];
          diff.after[key] = fields[key];
        }
      });
      await addDoc(collection(firestore, 'auditLogs'), {
        userId: actor.id,
        userName: actor.name,
        role: actor.role,
        action: 'update',
        entityType: colName,
        entityId: id,
        diff,
        timestamp: new Date().toISOString()
      });
    }
    return newDoc;
  } catch (err) {
    console.error(`Firestore updateItem failed for ${colName}/${id}:`, err);
    throw err;
  }
};

// CRUD: Delete
export const deleteItem = async (
  colName: DbCollection, 
  id: string, 
  actor?: { id: string; name: string; role: string }
): Promise<boolean> => {
  try {
    const docRef = doc(firestore, colName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return false;
    const oldDoc = docSnap.data();

    await deleteDoc(docRef);

    // Log audit trail
    if (colName !== 'auditLogs' && actor) {
      await addDoc(collection(firestore, 'auditLogs'), {
        userId: actor.id,
        userName: actor.name,
        role: actor.role,
        action: 'delete',
        entityType: colName,
        entityId: id,
        diff: { before: { id, ...oldDoc } },
        timestamp: new Date().toISOString()
      });
    }
    return true;
  } catch (err) {
    console.error(`Firestore deleteItem failed for ${colName}/${id}:`, err);
    throw err;
  }
};
