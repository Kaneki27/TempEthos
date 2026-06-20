import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  PROMPT_REPORT_ANALYSIS, 
  PROMPT_SOAP_NOTE, 
  PROMPT_DIAGNOSIS_ASSIST, 
  PROMPT_DISCHARGE_SUMMARY, 
  PROMPT_ALERT_TRIAGE, 
  PROMPT_VISIT_GUIDE, 
  PROMPT_OPERATIONAL_INSIGHT 
} from './prompts';
import { 
  mockReportAnalysis, 
  mockSoapNote, 
  mockDiagnosisAssist, 
  mockDischargeSummary, 
  mockAlertTriage, 
  mockVisitGuide, 
  mockOperationalInsight 
} from './mockAi';
import { Alert } from '../../types';

const apiKey = process.env.GEMINI_API_KEY;
const hasApiKey = !!apiKey;
const genAI = hasApiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper to query Gemini API
const queryGemini = async (systemPrompt: string, userContent: string, isJson = false): Promise<string> => {
  if (!genAI) {
    throw new Error("Gemini API key is not configured.");
  }
  
  // Use gemini-1.5-flash for rapid clinical assistant responses
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: isJson ? { responseMimeType: 'application/json' } : undefined,
  });

  const prompt = `${systemPrompt}\n\nUser Input Data:\n${userContent}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

export const getReportAnalysis = async (reportText: string, patientContext?: string) => {
  if (!hasApiKey) {
    // Artificial latency for visual progress feedback
    await new Promise(resolve => setTimeout(resolve, 1500));
    return mockReportAnalysis(reportText);
  }

  try {
    const input = `Patient Context: ${patientContext || 'Unknown'}\nExtracted Lab Report Text: ${reportText}`;
    const result = await queryGemini(PROMPT_REPORT_ANALYSIS.system, input, true);
    return JSON.parse(result);
  } catch (err) {
    console.error("Gemini report analysis failed, falling back to mock:", err);
    return mockReportAnalysis(reportText);
  }
};

export const getSoapNote = async (dictationText: string) => {
  if (!hasApiKey) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockSoapNote(dictationText);
  }

  try {
    return await queryGemini(PROMPT_SOAP_NOTE.system, dictationText, false);
  } catch (err) {
    console.error("Gemini SOAP note drafting failed, falling back to mock:", err);
    return mockSoapNote(dictationText);
  }
};

export const getDiagnosisAssist = async (symptoms: string, history?: string, currentMeds?: string) => {
  if (!hasApiKey) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockDiagnosisAssist(symptoms);
  }

  try {
    const input = `Symptoms: ${symptoms}\nHistory: ${history || 'N/A'}\nCurrent Medications: ${currentMeds || 'N/A'}`;
    const result = await queryGemini(PROMPT_DIAGNOSIS_ASSIST.system, input, true);
    return JSON.parse(result);
  } catch (err) {
    console.error("Gemini diagnosis assist failed, falling back to mock:", err);
    return mockDiagnosisAssist(symptoms);
  }
};

export const getDischargeSummary = async (patientData: any) => {
  if (!hasApiKey) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return mockDischargeSummary(patientData);
  }

  try {
    const input = JSON.stringify(patientData, null, 2);
    return await queryGemini(PROMPT_DISCHARGE_SUMMARY.system, input, false);
  } catch (err) {
    console.error("Gemini discharge summary failed, falling back to mock:", err);
    return mockDischargeSummary(patientData);
  }
};

export const getAlertTriage = async (alerts: Alert[], patientContexts?: string) => {
  if (!hasApiKey) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockAlertTriage(alerts);
  }

  try {
    const input = `Alerts Queue:\n${JSON.stringify(alerts, null, 2)}\n\nPatient Contexts:\n${patientContexts || 'N/A'}`;
    const result = await queryGemini(PROMPT_ALERT_TRIAGE.system, input, true);
    return JSON.parse(result);
  } catch (err) {
    console.error("Gemini alert triage failed, falling back to mock:", err);
    return mockAlertTriage(alerts);
  }
};

export const getVisitGuide = async (type: string, diagnosisCodes?: string) => {
  if (!hasApiKey) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockVisitGuide(type);
  }

  try {
    const input = `Appointment Type: ${type}\nDiagnosis Codes: ${diagnosisCodes || 'N/A'}`;
    return await queryGemini(PROMPT_VISIT_GUIDE.system, input, false);
  } catch (err) {
    console.error("Gemini visit guide failed, falling back to mock:", err);
    return mockVisitGuide(type);
  }
};

export const getOperationalInsight = async (stats: any) => {
  if (!hasApiKey) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return mockOperationalInsight(stats);
  }

  try {
    const input = JSON.stringify(stats, null, 2);
    const result = await queryGemini(PROMPT_OPERATIONAL_INSIGHT.system, input, true);
    return JSON.parse(result);
  } catch (err) {
    console.error("Gemini operational insight failed, falling back to mock:", err);
    return mockOperationalInsight(stats);
  }
};
