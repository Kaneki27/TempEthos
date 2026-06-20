export type AnalysisType = 'bioblood' | 'urine' | 'rw';

export interface BaseAnalysis {
  id: string;
  patientId: string;
  staffId: string; // Staff member who performed/recorded it
  type: AnalysisType;
  date: string; // ISO String
  notes?: string;
  aiSummaryRef?: string; // Links to aiReports cache
}

export interface BiobloodAnalysis extends BaseAnalysis {
  type: 'bioblood';
  bloodCount: {
    wbc: number; // cells/mcL
    rbc: number; // million/mcL
    hemoglobin: number; // g/dL
    platelets: number; // cells/mcL
  };
  bloodChemistry: {
    sodium: number; // mEq/L
    potassium: number; // mEq/L
    glucose: number; // mg/dL
    creatinine: number; // mg/dL
  };
  bloodType: string;
  coagulationProfile: {
    pt: number; // seconds
    inr: number;
  };
  referenceRanges: string;
}

export interface UrineAnalysis extends BaseAnalysis {
  type: 'urine';
  volume: number; // mL
  appearance: 'clear' | 'cloudy' | 'turbid' | 'dark';
  ph: number;
  glucose: 'negative' | 'trace' | 'positive';
  protein: 'negative' | 'trace' | 'positive';
  bloodCells: number; // per HPF
  bacteria: 'none' | 'few' | 'moderate' | 'many';
  crystals: 'none' | 'few' | 'moderate' | 'many';
}

export interface RwAnalysis extends BaseAnalysis {
  type: 'rw';
  // Mirroring urine with RW-specific syphilis markers
  volume: number; // mL
  appearance: 'clear' | 'cloudy' | 'turbid' | 'dark';
  ph: number;
  glucose: 'negative' | 'trace' | 'positive';
  protein: 'negative' | 'trace' | 'positive';
  bloodCells: number; // per HPF
  bacteria: 'none' | 'few' | 'moderate' | 'many';
  crystals: 'none' | 'few' | 'moderate' | 'many';
  rwMarker: 'reactive' | 'non-reactive'; // RW specific marker (Wassermann test)
}

export type Analysis = BiobloodAnalysis | UrineAnalysis | RwAnalysis;
