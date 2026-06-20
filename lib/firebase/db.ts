import { firestore, hasFirebaseConfig } from './config';
import { mockDb } from './mockDb';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';

type DbCollection = 'patients' | 'staff' | 'rooms' | 'medicines' | 'alerts' | 'appointments' | 'diagnoses' | 'treatments' | 'analyses' | 'tasks' | 'responsibilities' | 'history' | 'aiReports' | 'auditLogs';

// Real-time listener subscription
export const subscribeCollection = (
  colName: DbCollection, 
  callback: (data: any[]) => void
): (() => void) => {
  if (!hasFirebaseConfig || !firestore) {
    return mockDb.subscribe(colName, callback);
  }

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
      // Fallback to mock if Firestore fails
      return mockDb.subscribe(colName, callback);
    });
  } catch (err) {
    console.error(`Firestore query creation failed for ${colName}, falling back to mock:`, err);
    return mockDb.subscribe(colName, callback);
  }
};

// CRUD: Read all
export const getItems = async (colName: DbCollection): Promise<any[]> => {
  if (!hasFirebaseConfig || !firestore) {
    return mockDb.getAll(colName);
  }

  try {
    const querySnapshot = await getDocs(collection(firestore, colName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (err) {
    console.error(`Firestore getItems failed for ${colName}:`, err);
    return mockDb.getAll(colName);
  }
};

// CRUD: Read by ID
export const getItemById = async (colName: DbCollection, id: string): Promise<any | null> => {
  if (!hasFirebaseConfig || !firestore) {
    return mockDb.getById(colName, id);
  }

  try {
    const docRef = doc(firestore, colName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (err) {
    console.error(`Firestore getItemById failed for ${colName}/${id}:`, err);
    return mockDb.getById(colName, id);
  }
};

// CRUD: Add
export const addItem = async (
  colName: DbCollection, 
  item: any, 
  actor?: { id: string; name: string; role: string }
): Promise<any> => {
  if (!hasFirebaseConfig || !firestore) {
    return mockDb.add(colName, item, actor);
  }

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
    return mockDb.add(colName, item, actor);
  }
};

// CRUD: Update
export const updateItem = async (
  colName: DbCollection, 
  id: string, 
  fields: any, 
  actor?: { id: string; name: string; role: string }
): Promise<any | null> => {
  if (!hasFirebaseConfig || !firestore) {
    return mockDb.update(colName, id, fields, actor);
  }

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
    return mockDb.update(colName, id, fields, actor);
  }
};

// CRUD: Delete
export const deleteItem = async (
  colName: DbCollection, 
  id: string, 
  actor?: { id: string; name: string; role: string }
): Promise<boolean> => {
  if (!hasFirebaseConfig || !firestore) {
    return mockDb.delete(colName, id, actor);
  }

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
    return mockDb.delete(colName, id, actor);
  }
};

// Reset local DB helper
export const resetLocalDatabase = () => {
  mockDb.resetDatabase();
};
