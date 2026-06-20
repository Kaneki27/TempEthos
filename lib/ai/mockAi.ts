import { Alert } from '../../types';

export const mockReportAnalysis = (text: string) => {
  const containsSugar = /glucose|sugar|diabetes/i.test(text);
  const containsHb = /hemoglobin|hb|blood/i.test(text);

  const criticalFlags = [];
  if (containsSugar || text.includes('185')) {
    criticalFlags.push({
      field: 'Fasting Blood Glucose',
      value: '185 mg/dL',
      range: '70-100 mg/dL',
      severity: 'high' as const,
      explanation: 'Blood sugar is elevated above fasting limits. This points to possible glucose intolerance or stress response.'
    });
  }
  if (containsHb || /low hb/i.test(text)) {
    criticalFlags.push({
      field: 'Hemoglobin',
      value: '10.2 g/dL',
      range: '13.5-17.5 g/dL',
      severity: 'medium' as const,
      explanation: 'Hemoglobin level is slightly low, which may indicate mild anemia. Follow-up blood counts are recommended.'
    });
  }

  // If text is generic
  if (criticalFlags.length === 0) {
    criticalFlags.push({
      field: 'Cholesterol (LDL)',
      value: '145 mg/dL',
      range: '< 100 mg/dL',
      severity: 'low' as const,
      explanation: 'LDL cholesterol is borderline high. Suggest checking dietary habits.'
    });
  }

  return {
    summary: 'The uploaded medical report reveals minor variations. Cell counts are within general limits, but specific markers require attention. We have noted out-of-range readings below.',
    criticalFlags,
    suggestedFollowUp: [
      'Discuss test variations with your consulting doctor',
      'Schedule a follow-up panel in 2-4 weeks',
      'Maintain adequate hydration and record blood pressure daily'
    ],
    confidenceScore: 94
  };
};

export const mockSoapNote = (text: string) => {
  return `### Clinical SOAP Note
*Drafted by AI Assistant*

**SUBJECTIVE:**
Patient presents with complaints described as follows: "${text || 'No description provided'}"
Reports onset of symptoms recently. Denies acute pain or respiratory distress.

**OBJECTIVE:**
- Vitals: BP 128/82 mmHg, Pulse 76 bpm, Temp 98.6 °F, O2 Sat 98% on room air.
- Physical exam: Patient alert, oriented x3. Lungs clear to auscultation. Rhythmic heart rate without murmurs.

**ASSESSMENT:**
- Primary symptom/complaint: Cardiorespiratory review.
- Differential: Rule out viral illness, localized stress, or atypical muscular strain.

**PLAN:**
1. Monitor vitals daily (heart rate, blood pressure).
2. Schedule follow-up consultation if symptoms persist beyond 48 hours.
3. Recommend rest and hydration. No active pharmaceutical prescriptions drafted yet.`;
};

export const mockDiagnosisAssist = (symptoms: string) => {
  return {
    differentials: [
      {
        icdCode: 'I10',
        condition: 'Essential (primary) hypertension',
        confidence: 85,
        rationale: 'Symptoms of headache, elevated telemetry readings, and baseline medical records align with high blood pressure.'
      },
      {
        icdCode: 'E11.9',
        condition: 'Type 2 diabetes mellitus without complications',
        confidence: 70,
        rationale: 'Elevated fasting blood glucose levels and reports of fatigue/thirst indicate possible diabetes mellitus.'
      },
      {
        icdCode: 'G43.909',
        condition: 'Migraine, unspecified, not intractable',
        confidence: 60,
        rationale: 'Severe unilateral headaches reported, exacerbated by light and sound.'
      },
      {
        icdCode: 'R07.9',
        condition: 'Chest pain, unspecified',
        confidence: 50,
        rationale: 'Atypical pressure reported. ECG and cardiac enzymes should be reviewed to rule out myocardial ischemia.'
      },
      {
        icdCode: 'Z73.3',
        condition: 'Stress state, not elsewhere classified',
        confidence: 45,
        rationale: 'Somatization of work overload, tension, and mild palpitations.'
      }
    ]
  };
};

export const mockDischargeSummary = (patientData: any) => {
  return `# HOSPITAL DISCHARGE SUMMARY
*SehatSetu Intelligent Command Center*

**Patient Name:** ${patientData?.name || 'Patient'}  
**National ID:** ${patientData?.nationalId || 'N/A'}  
**Date of Discharge:** ${new Date().toLocaleDateString()}

---

### 1. REASON FOR ADMISSION
Patient was admitted following symptoms of cardiac congestion/hypertension evaluation.

### 2. CLINICAL FINDINGS
Evaluations indicated elevated blood pressure (150/95 mmHg) and borderline high fasting blood glucose. Standard ECG and echocardiogram revealed normal ejection fraction with mild left ventricular hypertrophy.

### 3. TREATMENTS RECEIVED
- Initiated Telmisartan 40mg once daily.
- Bed rest and low-sodium cardiac diet.
- Continuous telemetry monitoring.

### 4. DISCHARGE MEDICATIONS
1. **Telmisartan 40mg** - 1 tablet orally every morning (Antihypertensive).
2. **Aspirin 75mg** - 1 tablet orally daily with meals (Antiplatelet).

### 5. FOLLOW-UP CARE PLAN
- Visit Cardiology OPD in 7 days for BP evaluation and dosage titration.
- Regular self-monitoring of blood pressure (target < 130/80 mmHg).
- Restrict daily sodium intake to less than 2,000 mg.

### 6. EMERGENCY INSTRUCTIONS
Return to emergency immediately if experiencing:
- Crushing chest pain or pressure
- Shortness of breath
- Sudden numbness or weakness in arms, face, or legs.

*Reviewed by AI — verify clinically before signing.*`;
};

export const mockAlertTriage = (alerts: Alert[]) => {
  // critical alerts first, then high, then medium, then low
  const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  
  const reRanked = [...alerts].sort((a, b) => {
    return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
  });

  return reRanked.map((alert, index) => {
    let rationale = 'Maintained default prioritization order.';
    if (alert.priority === 'critical') {
      rationale = 'Triage elevated: Vitals warnings are processed with highest priority to protect life.';
    } else if (alert.priority === 'high') {
      rationale = 'High priority: Requires review within 15 minutes to prevent clinical deterioration.';
    } else if (alert.priority === 'medium') {
      rationale = 'Medium priority: Batchable task, check after resolving critical/high queues.';
    }
    return {
      id: alert.id,
      priority: alert.priority,
      aiRationale: rationale
    };
  });
};

export const mockVisitGuide = (type: string) => {
  return `# Patient Visit Guide
*Personalised for you by SehatSetu AI*

### Pre-Visit Preparation
- **Fasting Requirement:** If your checkup includes a blood sugar panel, please fast for 8-10 hours prior to your slot. Water is allowed.
- **Documents:** Please bring your national identification card and copies of external prescriptions.
- **Medications:** Take your regular morning blood pressure medications unless instructed otherwise by your physician.

### Post-Visit Instructions
- **Active Prescription:** Ensure you fill your Telmisartan prescription. Take 1 tablet daily in the morning. Do not skip doses.
- **Dietary Advice:** Reduce sodium (salt) in your meals and drink at least 8 glasses of water daily.
- **Symptom Log:** Keep a small diary of your morning and evening blood pressure readings. Show this to your doctor on your next checkup.

*Reviewed by AI — verify clinically.*`;
};

export const mockOperationalInsight = (stats: any) => {
  const bedOccupancy = stats.bedOccupancy || 75;
  const activeStaff = stats.activeStaff || 12;

  const insights = [
    `Bed occupancy is currently at ${bedOccupancy}% — Room turnover is stable, but monitoring ICU beds is advised.`,
    `Active staff count stands at ${activeStaff} members — High nurse shift ratios are currently active in Ward B.`,
    'Medicine inventory indicates 1 item (Amoxicillin) has dropped below its reorder warning level.'
  ];

  const actions = [
    'Trigger a replenishment order for Amoxicillin capsules.',
    'Review discharge scheduling for Ward B to optimize afternoon bed capacity.'
  ];

  return { insights, actions };
};
