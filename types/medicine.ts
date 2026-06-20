export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string; // e.g. Antibiotic, Analgesic
  dosageForm: string; // e.g. Tablet, Injection, Syrup
  strength: string; // e.g. 500mg, 10mg/mL
  manufacturer: string;
  stockQty: number;
  reorderLevel: number;
  expiryDate: string; // YYYY-MM-DD
  unitPrice: number; // in Rupees
  createdAt: string;
}
