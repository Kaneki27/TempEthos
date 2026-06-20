import { NextResponse } from 'next/server';
import { 
  getReportAnalysis, 
  getSoapNote, 
  getDiagnosisAssist, 
  getDischargeSummary, 
  getAlertTriage, 
  getVisitGuide, 
  getOperationalInsight 
} from '@/lib/ai/gemini';
import { addItem, getItems } from '@/lib/firebase/db';
import { AiReport } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action parameter is required.' }, { status: 400 });
    }

    switch (action) {
      case 'report-analysis': {
        const { text, patientId, patientContext } = payload;
        if (!text || !patientId) {
          return NextResponse.json({ error: 'Text and patientId are required for report analysis.' }, { status: 400 });
        }

        // Cache implementation: check if patient has a cached report in the last 24 hours
        // We calculate a prompt hash
        const promptHash = `report-${patientId}-${text.substring(0, 50).replace(/\s/g, '')}`;
        
        try {
          const cachedReports: AiReport[] = await getItems('aiReports');
          const hit = cachedReports.find(r => 
            r.patientId === patientId && 
            r.promptHash === promptHash && 
            new Date(r.expiresAt) > new Date()
          );

          if (hit) {
            console.log(`[AI Cache] Hit for patient ${patientId}`);
            return NextResponse.json({ data: hit.geminiResponse, cached: true });
          }
        } catch (cacheErr) {
          console.error('[AI Cache] Read error, proceeding to call Gemini:', cacheErr);
        }

        // Call Gemini
        const result = await getReportAnalysis(text, patientContext);
        
        // Cache result in aiReports
        try {
          const newCacheEntry = {
            patientId,
            promptHash,
            geminiResponse: result,
            expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
          };
          await addItem('aiReports', newCacheEntry);
        } catch (cacheWriteErr) {
          console.error('[AI Cache] Write error:', cacheWriteErr);
        }

        return NextResponse.json({ data: result, cached: false });
      }

      case 'soap-note': {
        const { text } = payload;
        if (!text) {
          return NextResponse.json({ error: 'Text is required for SOAP note.' }, { status: 400 });
        }
        const result = await getSoapNote(text);
        return NextResponse.json({ data: result });
      }

      case 'diagnosis-assist': {
        const { symptoms, history, currentMeds } = payload;
        if (!symptoms) {
          return NextResponse.json({ error: 'Symptoms are required for diagnosis assist.' }, { status: 400 });
        }
        const result = await getDiagnosisAssist(symptoms, history, currentMeds);
        return NextResponse.json({ data: result });
      }

      case 'discharge-summary': {
        const { patientData } = payload;
        if (!patientData) {
          return NextResponse.json({ error: 'Patient data is required for discharge summary.' }, { status: 400 });
        }
        const result = await getDischargeSummary(patientData);
        return NextResponse.json({ data: result });
      }

      case 'alert-triage': {
        const { alerts, patientContexts } = payload;
        if (!alerts || !Array.isArray(alerts)) {
          return NextResponse.json({ error: 'Alerts array is required for triage.' }, { status: 400 });
        }
        const result = await getAlertTriage(alerts, patientContexts);
        return NextResponse.json({ data: result });
      }

      case 'visit-guide': {
        const { type, diagnosisCodes } = payload;
        if (!type) {
          return NextResponse.json({ error: 'Appointment type is required for visit guide.' }, { status: 400 });
        }
        const result = await getVisitGuide(type, diagnosisCodes);
        return NextResponse.json({ data: result });
      }

      case 'operational-insight': {
        const { stats } = payload;
        if (!stats) {
          return NextResponse.json({ error: 'Stats is required for operational insight.' }, { status: 400 });
        }
        const result = await getOperationalInsight(stats);
        return NextResponse.json({ data: result });
      }

      default:
        return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    console.error(`[API Gemini] Error processing request:`, err);
    return NextResponse.json({ error: err.message || 'Server error occurred.' }, { status: 500 });
  }
}
