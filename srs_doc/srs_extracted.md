

SehatSetu

AI-Powered Hospital Management System



Software Requirements Specification

Version 2.0  •  ethosh IGNITE 2026  •  Track 2: Full-Stack AI

June 2026



Table of Contents







1. Introduction

1.1 Purpose

SehatSetu (meaning 'Health Bridge' in Hindi) is a comprehensive, AI-powered digital hospital management system designed for the futuristic hospital envisioned in the ethosh IGNITE 2026 'Hospital 2050' challenge. It addresses the five core hospital pain-points: physician documentation overload, nurse alert fatigue, patient confusion around visits, administrator scheduling chaos, and fragmented information spread across multiple systems.

The system provides a unified web platform where doctors, nurses, administrators, patients, and hospital leadership interact with intelligent software tools throughout the day — powered by a Next.js frontend, a Firebase backend, and Google Gemini for clinical AI capabilities, including automated patient report analysis.

1.2 Scope

SehatSetu delivers:

Patient Data Management — full CRUD, document uploads, AI-analysed lab reports

Staff Management — Doctors, Nurses, Administrative staff with role-based dashboards

Medical Records — Treatments (3 subtypes), Diagnoses, Medical History, Analyses (3 subtypes)

Appointment & Room Scheduling — real-time conflict detection, bed capacity management

Medicine / Inventory Management — stock tracking and prescriptions

AI Clinical Assistant — Gemini-powered patient report analysis, decision-support summaries

Nurse Workflow Automation — smart alert prioritisation, task batching

Patient Portal — pre/post-visit guidance, report summaries in plain language

Administrator Command Centre — bed capacity, staffing heatmaps, scheduling optimisation

Search & Reporting — global search, PDF/CSV export

Role-based Dashboards — Admin, Doctor, Nurse, Patient views

1.3 Technology Stack



Layer

Technology

Frontend

Next.js 14 (App Router, TypeScript, Tailwind CSS)

Authentication

Firebase Authentication (Email/Password, Google OAuth)

Database

Cloud Firestore (NoSQL, real-time)

File Storage

Firebase Cloud Storage (PDFs, images, reports)

Backend Logic

Next.js API Routes / Firebase Cloud Functions

AI / LLM

Google Gemini 1.5 Pro — patient report analysis, clinical summaries

Hosting

Firebase App Hosting / Vercel

State Management

Zustand + React Query (TanStack)

UI Components

shadcn/ui + Tailwind CSS (Teal #0891B2 primary)

Realtime

Firestore onSnapshot listeners for live dashboards

1.4 Problem Statement Alignment (ethosh IGNITE 2026 — PS2 'Hospital 2050')

SehatSetu directly addresses all five challenges articulated in the problem statement:



Challenge

Stakeholder

SehatSetu Solution

Too much documentation

Doctors

AI-dictated note summarisation; auto-filled diagnosis drafts via Gemini

Alert & task overload

Nurses

Smart alert triage; AI-batched repetitive tasks; priority queues

Pre/post-visit confusion

Patients

Plain-language AI report summaries; visit checklists in Patient Portal

Bed / staffing / scheduling

Administrators

Real-time capacity heatmap; conflict-aware scheduler; staffing analytics

Fragmented information

All staff

Single Firestore source-of-truth; global search; unified dashboards

1.5 Definitions & Abbreviations



Term

Definition

SRS

Software Requirements Specification

CRUD

Create, Read, Update, Delete

LLM

Large Language Model (Google Gemini 1.5 Pro)

EMR

Electronic Medical Record

RACI

Responsible, Accountable, Consulted, Informed

DAO

Data Access Object pattern

JWT

JSON Web Token (Firebase ID Token)

RBAC

Role-Based Access Control

Firestore

Cloud Firestore — Firebase NoSQL real-time database

Cloud Functions

Firebase serverless backend functions

onSnapshot

Firestore real-time listener API



2. System Architecture

2.1 High-Level Architecture

SehatSetu follows a Next.js App Router architecture with Firebase as a fully-managed BaaS (Backend-as-a-Service). The Gemini LLM integration lives in a secure Next.js API Route that acts as a proxy, ensuring API keys are never exposed on the client.



Architecture Summary

Browser (Next.js Client) ⟷ Next.js App Router (SSR/RSC) ⟷ Firebase SDK
Next.js API Routes (/api/*) ⟷ Google Gemini API (LLM)
Firebase Auth ⟷ Firestore ⟷ Cloud Storage ⟷ Cloud Functions



2.2 Module Structure



Module / Path

Responsibility

app/(auth)/

Login, Register, Password Reset pages (Next.js App Router)

app/(dashboard)/

Role-gated dashboards — Admin, Doctor, Nurse, Patient

app/patients/

Patient list, detail, add, edit pages

app/staff/

Staff management pages (doctors, nurses, administrative)

app/medical-records/

Treatments, Diagnoses, Medical History, Analyses

app/appointments/

Appointment booking and room scheduling

app/medicines/

Medicine / inventory management

app/ai-assistant/

Gemini-powered report analysis & clinical summaries

app/patient-portal/

Patient-facing views: visit guides, report summaries

app/search/

Global search hub

app/api/gemini/

Server-side Gemini API proxy route

app/api/reports/

PDF/CSV report generation

lib/firebase/

Firebase SDK init, Firestore helpers, Storage helpers

lib/ai/

Gemini client, prompt templates, response parsers

components/ui/

shadcn/ui component library

components/shared/

Data tables, modals, search bars, role guards

hooks/

Custom React hooks (useAuth, usePatients, useRealtime…)

types/

TypeScript interfaces for all domain entities

store/

Zustand global state slices

2.3 Key Design Patterns

Next.js App Router — Server Components for data-fetching; Client Components for interactivity

Firebase RBAC — Custom claims (role: admin | doctor | nurse | patient) enforced in Firestore Security Rules and middleware

Repository Pattern — each Firestore collection wrapped in a typed repository class (e.g. PatientRepository, TreatmentRepository)

Optimistic UI — mutations update local state immediately, confirmed/rolled back on Firestore response

Real-time Listeners — onSnapshot subscriptions for live dashboards, alert queues, bed maps

AI Gateway Pattern — all Gemini calls routed through /api/gemini; client never holds API key

Inheritance Modelling in Firestore — base document + subtype field + discriminated union types (e.g. treatment.type: 'medication' | 'surgical' | 'rehabilitation')

2.4 Firebase Firestore Collections



Collection

Entities Stored

users

Auth profiles (uid, role, name, email, linkedId)

patients

Patient demographic + medical baseline data

staff

Base staff record — links to doctors / nurses / administrative sub-collections

doctors

Doctor-specific attributes (specialization, yearsExp, appointments)

nurses

Nurse-specific attributes (certification, shift, specialization)

administrative

Admin-specific attributes (tasks, responsibilities)

appointments

Appointment records linked to patient + doctor + room

treatments

Treatment records (base + subtype fields)

diagnoses

Diagnosis records

medicalHistory

Medical history entries with timestamps

analyses

Lab analysis records (base + subtype fields)

medicines

Medicine / inventory catalogue

procedures

Procedure records

rooms

Room / bed inventory and occupancy status

tasks

Staff task assignments

responsibilities

Administrative responsibility records

alerts

Nurse alert queue with priority and status

auditLogs

Immutable audit trail for all CRUD operations

aiReports

Gemini-generated analysis results cached per patient document



3. Functional Requirements

3.1 Authentication Module



ID

Requirement

Description

FR-AUTH-01

Email/Password Login

Firebase Auth — email & password with form validation

FR-AUTH-02

Google OAuth Login

Firebase Google Sign-In for staff convenience

FR-AUTH-03

Role-Based Redirect

After login, redirect to role-specific dashboard based on Firestore custom claim

FR-AUTH-04

Session Persistence

Firebase ID Token auto-refreshed; protected via Next.js middleware

FR-AUTH-05

Password Reset

Firebase sendPasswordResetEmail flow

FR-AUTH-06

Account Lockout

Firebase rate limiting + custom lockout after 5 failed attempts

FR-AUTH-07

Audit on Login

Login/logout events written to auditLogs collection

3.2 Dashboard Module



ID

Requirement

Description

FR-DASH-01

Statistics Display

Real-time Firestore-aggregated counts: total patients, today's appointments, active staff, bed occupancy

FR-DASH-02

Recent Patients

Last 10 admitted patients with quick-link to detail

FR-DASH-03

Upcoming Treatments

Today's treatment schedule for the logged-in doctor / nurse

FR-DASH-04

Quick Navigation

Side menu with role-aware visible items

FR-DASH-05

Date & Shift Display

Current date, time, and nurse shift displayed in header

FR-DASH-06

AI Insight Banner

Daily Gemini-generated operational insight (e.g. 'Bed occupancy 87% — consider discharge planning')

FR-DASH-07

Alert Feed (Nurse)

Live onSnapshot alert queue with priority badges; one-click acknowledge

FR-DASH-08

Bed Capacity Map (Admin)

Visual room/bed occupancy heatmap with drill-down

FR-DASH-09

Staffing Overview (Admin)

Department headcount vs scheduled capacity

3.3 Patient Management Module



ID

Requirement

Description

FR-PAT-01

Patient CRUD

Create, read, update, delete patient records in Firestore

FR-PAT-02

Patient Attributes

patientId (auto UUID), name, nationalId, gender, dateOfBirth, age, height, weight, bloodType, address, contactNumber, emergencyContact

FR-PAT-03

Patient List View

Paginated table with column sort, real-time search filter

FR-PAT-04

Patient Detail Tabs

Overview | Treatments | Diagnoses | Analyses | Medical History | Documents | AI Summary

FR-PAT-05

Document Upload

Upload PDF/image reports to Firebase Cloud Storage; linked to patient record

FR-PAT-06

AI Report Analysis

Uploaded lab report auto-sent to Gemini 1.5 Pro for plain-language summary + anomaly flags

FR-PAT-07

Patient Portal Access

Generate one-time link for patient to view their AI-summarised reports and visit guides

FR-PAT-08

Data Persistence

All writes go to Firestore with offline persistence enabled (PWA mode)

FR-PAT-09

Soft Delete

Archive patients rather than hard-delete; admin can restore

3.4 Staff Management Module



ID

Requirement

Description

FR-STF-01

Staff CRUD

Create, read, update, delete staff records

FR-STF-02

Staff Types

Doctor, Nurse, Administrative — stored in separate Firestore collections, linked to base staff record

FR-STF-03

Base Staff Attributes

staffId (auto UUID), name, nationalId, email, dateOfBirth, age, contactNumber, jobTitle, department, role

FR-STF-04

Doctor Attributes

specialization, yearsOfExperience, doctorAppointments array

FR-STF-05

Nurse Attributes

certification, yearsOfExperience, specialization, shift

FR-STF-06

Admin Attributes

tasks (ref array), responsibilities (ref array)

FR-STF-07

Role-based Views

Separate filtered list views: All Staff, Doctors, Nurses, Administrative

FR-STF-08

Staff Detail Page

Profile, linked records, shift calendar, assigned tasks/responsibilities

FR-STF-09

Search/Filter

Filter by department, role, shift, name

FR-STF-10

Workload Indicator

AI-surfaced flag if a doctor's appointment count exceeds recommended threshold

3.5 Medical Records Module



ID

Requirement

Description

FR-MED-01

Treatment Management

CRUD for treatments; base fields + subtype discriminator

FR-MED-02

Medication Treatment

medName, route, frequency, dosage, startDate, endDate, prescribingDoctor

FR-MED-03

Surgical Treatment

surgeonCredentials, anesthesiaType, approach, site, complications, outcomeNotes

FR-MED-04

Rehabilitation Treatment

goals, initialAssessment, plan, schedule, progressNotes, dischargeStatus

FR-MED-05

Diagnosis Management

CRUD: diagnosisId, patientId, staffId, date, icdCode, description, severity

FR-MED-06

Medical History

CRUD: historyId, patientId, timestamp (date+time), result, observation, complication, recordedBy

FR-MED-07

Analysis Management

CRUD for lab analyses; base fields + subtype discriminator

FR-MED-08

Bioblood Analysis

bloodCount, bloodChemistry, bloodType, coagulationProfile, referenceRanges

FR-MED-09

Urine Analysis

volume, appearance, pH, glucose, protein, bloodCells, bacteria, crystals

FR-MED-10

RW Analysis

Fields mirroring urine analysis with RW-specific markers

FR-MED-11

AI Analysis Summary

On save of any analysis, Gemini interprets values, flags out-of-range results, suggests follow-up

FR-MED-12

Procedure Management

CRUD for procedures linked to patient and staff

3.6 AI Clinical Assistant Module (Gemini Integration)



ID

Requirement

Description

FR-AI-01

Report Upload & Parse

Doctor/nurse uploads PDF report; system extracts text (PDF.js) and sends to Gemini

FR-AI-02

Plain-Language Summary

Gemini generates a patient-friendly explanation of lab results (reading level ≤ Grade 8)

FR-AI-03

Clinical Flag Detection

Gemini identifies anomalous values and ranks them Critical / High / Medium / Low

FR-AI-04

Suggested Follow-up

Gemini suggests next clinical steps (non-prescriptive; doctor must confirm)

FR-AI-05

Doctor Note Drafting

Doctor dictates (or types) free text; Gemini formats as structured SOAP note

FR-AI-06

Diagnosis Assist

Given symptoms/history, Gemini provides differential diagnosis suggestions (advisory only)

FR-AI-07

Discharge Summary

Gemini drafts discharge summary from patient record; doctor reviews and approves

FR-AI-08

AI Result Caching

Gemini responses stored in aiReports collection; re-use within 24 hours to save API cost

FR-AI-09

Confidence Display

Every AI output shows a confidence indicator and 'Reviewed by AI — verify clinically' disclaimer

FR-AI-10

Nurse Alert Triage

Gemini re-ranks pending nurse alerts by clinical urgency based on patient context

FR-AI-11

Patient Visit Guide

Gemini generates personalised pre/post-visit instructions for Patient Portal

FR-AI-12

Operational Insight

Nightly Cloud Function sends Firestore aggregates to Gemini; result displayed in Admin dashboard

3.7 Appointment & Room Module



ID

Requirement

Description

FR-APT-01

Appointment CRUD

Create, read, update, delete appointments

FR-APT-02

Appointment Attributes

appointmentId, patientId, doctorId, roomId, dateTime, duration, type, status, notes

FR-APT-03

Conflict Detection

Real-time Firestore query checks for doctor double-booking and room overlap before save

FR-APT-04

Room Management

CRUD for rooms: roomId, roomNumber, ward, type, capacity, currentOccupancy, status

FR-APT-05

Patient-Specific View

Patient detail page shows all past and upcoming appointments

FR-APT-06

Calendar View

Week/day calendar for doctor's appointments with drag-to-reschedule

FR-APT-07

Bed Admission

Admit patient to room; updates room.currentOccupancy in real-time

FR-APT-08

Smart Scheduling Hint

Gemini suggests optimal appointment slot based on doctor workload and patient urgency

3.8 Medicine / Inventory Module



ID

Requirement

Description

FR-INV-01

Medicine CRUD

Create, read, update, delete medicine records

FR-INV-02

Medicine Attributes

medicineId, name, genericName, category, dosageForm, strength, manufacturer, stockQty, reorderLevel, expiryDate, unitPrice

FR-INV-03

Low Stock Alert

Firestore Cloud Function triggers alert when stockQty <= reorderLevel

FR-INV-04

Expiry Alert

Daily Cloud Function flags medicines expiring within 30 days

FR-INV-05

Prescription Linkage

MedicationTreatment records reference medicines collection for stock deduction on confirm

3.9 Search Module



ID

Requirement

Description

FR-SRCH-01

Global Search

Firestore full-text search (via Algolia/Typesense integration) across patients, staff, diagnoses, medicines

FR-SRCH-02

Entity Search Screens

Dedicated filtered search for: Treatments, Diagnoses, Medicines, Procedures

FR-SRCH-03

Recent Search History

Last 10 searches stored locally (localStorage) for quick re-access

FR-SRCH-04

AI Search Assist

Natural-language query ('show me diabetic patients over 60') parsed by Gemini to Firestore filters

3.10 Task & Responsibility Module



ID

Requirement

Description

FR-TSK-01

Task Management

CRUD for tasks: taskId, title, assignedTo (staffId), priority, dueDate, status, notes

FR-TSK-02

Responsibility Management

CRUD for responsibilities: respId, title, assignedTo, department, description

FR-TSK-03

AI Task Batching

Gemini groups nurse tasks by patient room/ward to minimise travel and cognitive load

FR-TSK-04

Task Notifications

Firestore Cloud Messaging push notification when task assigned or due in 30 min

3.11 Patient Portal Module



ID

Requirement

Description

FR-PP-01

Secure Patient Access

Patient logs in with Firebase Auth; can only read their own Firestore documents

FR-PP-02

Report Summary View

Patient sees AI-generated plain-language summary of their latest lab reports

FR-PP-03

Visit Checklist

AI-generated pre-visit preparation and post-visit care instructions

FR-PP-04

Appointment History

List of past and upcoming appointments with doctor name, date, notes

FR-PP-05

Medication List

Current active medications with dosage and schedule

FR-PP-06

Download My Records

Patient can download their records as PDF

3.12 Audit & Compliance Module



ID

Requirement

Description

FR-AUD-01

Audit Log Write

Every CRUD mutation writes to auditLogs collection: timestamp, userId, role, action, entityType, entityId, diff

FR-AUD-02

Audit Log View

Admin can view and filter audit logs by user, date range, entity type

FR-AUD-03

Immutable Logs

Firestore Security Rules prevent any user (including admin) from updating or deleting audit log entries

FR-AUD-04

Export Audit

Admin can export audit logs as CSV for compliance



4. Data Model

4.1 Entity Hierarchy



Domain Entity Tree

Person (TypeScript interface)
├── Patient
└── Staff
    ├── Doctor
    ├── Nurse
    └── Administrative

Treatment (base document)
├── MedicationTreatment
├── SurgicalTreatment
└── Rehabilitation

Analysis (base document)
├── BiobloodAnalysis
├── UrineAnalysis
└── RwAnalysis

Diagnosis | MedicalHistory | Appointment | Medicine
Procedure | Room | Tasks | Responsibilities | Alerts | AuditLogs | AiReports



4.2 Firestore Schema (Key Collections)



Collection

Key Fields

patients

uid (auto), name, nationalId, gender, dob, bloodType, address, contact, emergencyContact, createdAt, updatedAt, isArchived

staff

uid (auto), name, nationalId, email, dob, contact, jobTitle, department, role, linkedId, createdAt

doctors

staffId (ref), specialization, yearsOfExperience, appointmentIds[]

nurses

staffId (ref), certification, specialization, shift, yearsOfExperience

administrative

staffId (ref), taskIds[], responsibilityIds[]

appointments

uid, patientId, doctorId, roomId, dateTime, durationMin, type, status, notes

treatments

uid, patientId, staffId, type (medication|surgical|rehabilitation), date, + subtype fields

diagnoses

uid, patientId, staffId, date, icdCode, description, severity

medicalHistory

uid, patientId, staffId, timestamp, result, observation, complication

analyses

uid, patientId, staffId, type (bioblood|urine|rw), date, + subtype fields, aiSummaryRef

medicines

uid, name, genericName, category, dosageForm, strength, stockQty, reorderLevel, expiryDate

rooms

uid, roomNumber, ward, type, capacity, currentOccupancy, status

alerts

uid, patientId, nurseId, priority, title, body, status, createdAt, acknowledgedAt

aiReports

uid, patientId, documentRef, promptHash, geminiResponse, createdAt, expiresAt

auditLogs

uid, userId, role, action, entityType, entityId, diff (JSON), timestamp

4.3 TypeScript Interfaces (Excerpts)



Patient Interface

interface Patient {
  id: string;
  name: string;
  nationalId: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: Timestamp;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  address: string;
  contactNumber: string;
  emergencyContact: { name: string; relation: string; phone: string };
  isArchived: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}



Treatment Union Type

type TreatmentType = 'medication' | 'surgical' | 'rehabilitation';

interface BaseTreatment {
  id: string; patientId: string; staffId: string;
  type: TreatmentType; date: Timestamp; notes?: string;
}

interface MedicationTreatment extends BaseTreatment {
  type: 'medication';
  medName: string; route: string; frequency: string; dosage: string;
}

type Treatment = MedicationTreatment | SurgicalTreatment | RehabilitationTreatment;



5. User Interface Specification

5.1 Screen Inventory

SehatSetu has 40+ screens organised into Next.js App Router route groups:

Authentication

/login — Role-aware login (email + Google OAuth)

/register — Staff self-registration (admin-approval required)

/reset-password — Firebase password reset flow

Dashboards (Role-Gated)

/dashboard — Admin overview: stats, bed map, staffing, AI insight

/dashboard/doctor — Doctor view: today's patients, upcoming treatments, AI drafts

/dashboard/nurse — Nurse view: live alert feed, batched task queue, AI triage

/dashboard/patient — Patient portal: reports, visits, medications

Patient Management (8 screens)

/patients — Patient list with real-time search

/patients/new — Add patient form

/patients/[id] — Patient detail: Overview | Treatments | Diagnoses | Analyses | History | Documents | AI Summary

/patients/[id]/edit — Edit patient

Staff Management (8 screens)

/staff — All staff list with role filter tabs

/staff/doctors — Doctors only

/staff/nurses — Nurses only

/staff/administrative — Admin staff only

/staff/new — Add staff with role selector

/staff/[id] — Staff detail with linked records

/staff/[id]/edit — Edit staff

Medical Records (16 screens)

Treatments: /treatments/new, /treatments/[id]/edit, /treatments/search

Diagnoses: /diagnoses/new, /diagnoses/[id]/edit, /diagnoses/search

Medical History: /history/new, /history/[id]/edit

Analyses: /analyses/new, /analyses/[id]/edit, /analyses/search

Procedures: /procedures/new, /procedures/[id]/edit, /procedures/search

Medicines: /medicines/new, /medicines/[id]/edit, /medicines/search

Appointments & Rooms (4 screens)

/appointments — Calendar + list view

/appointments/new — Booking with conflict detection

/appointments/[id]/edit — Reschedule/cancel

/rooms — Bed map + room management

AI Assistant (3 screens)

/ai/report-analysis — Upload report → Gemini summary

/ai/note-drafting — Dictate → SOAP note

/ai/discharge-summary — Draft discharge summary

Tasks & Responsibilities (4 screens)

/tasks — Task list with AI-batched grouping

/tasks/new, /tasks/[id]/edit

/responsibilities/new, /responsibilities/[id]/edit

Search & Admin Utilities

/search — Global search hub

/audit — Audit log viewer (admin only)

/reports — Export centre: PDF/CSV generation

5.2 UI Components & Design System



Component

Description

DataTable

shadcn/ui Table with Tanstack Table — sortable, filterable, paginated, real-time

FilteredSearch

Controlled input with debounce triggering Firestore queries

RoleGuard

Next.js middleware + client component wrapper to protect routes by role

AISummaryCard

Card component displaying Gemini output with confidence badge and disclaimer

AlertQueue

Nurse dashboard component: live Firestore feed of alerts, priority colour-coded

BedMap

Admin dashboard: SVG room grid, each cell coloured by occupancy (green/amber/red)

CalendarView

Weekly appointment calendar (react-big-calendar), drag-and-drop support

FileUploader

Firebase Storage uploader with progress bar; triggers AI analysis on complete

AuditTimeline

Chronological list of audit events for a specific entity

5.3 Design System



Token

Value

Primary colour

#0891B2 (Teal-500)

Primary dark

#0E7490 (Teal-600)

Accent

#06B6D4 (Cyan-500)

Background

#F8FAFC

Surface

#FFFFFF

Text primary

#1E293B

Text secondary

#64748B

Success

#10B981

Warning

#F59E0B

Error

#EF4444

Font family

Inter (primary), JetBrains Mono (code blocks)

Base font size

16px

Border radius

0.5rem (8px)

Responsive breakpoints

sm: 640px, md: 768px, lg: 1024px, xl: 1280px



6. Non-Functional Requirements

6.1 Performance

Page initial load (LCP) < 2.5 s on 4G connection

Firestore query response < 500 ms for up to 10,000 records with proper indexing

Real-time alert delivery latency < 1 s via Firestore onSnapshot

Gemini API response < 8 s for report analysis (streaming response shown progressively)

PDF export < 5 s for documents up to 50 pages

Client-side search filter debounce 300 ms

6.2 Security

Firebase Authentication — ID Token checked on every request via Next.js middleware

Firestore Security Rules — role-based read/write rules; patients can only read own documents

API Key Protection — Gemini API key stored in Next.js environment variable; never exposed to browser

HTTPS enforced — Firebase Hosting auto-provisions SSL

File Upload Validation — Firebase Storage Rules restrict file types (PDF, JPEG, PNG) and size (≤ 20 MB)

Input Sanitisation — Zod schema validation on all API routes and form submissions

Audit Immutability — Firestore Security Rules block writes to auditLogs by any authenticated user

No Plain-text Secrets — Firebase environment config via Secret Manager

6.3 Usability

WCAG 2.1 AA accessibility compliance (colour contrast, keyboard navigation, ARIA labels)

Responsive design — mobile (360px) through desktop (1920px)

Skeleton loaders for all async data fetches

Toast notifications for all CRUD success/error states

AI outputs always include disclaimer: 'Reviewed by AI — verify clinically before action'

Patient Portal text at ≤ Grade 8 reading level (enforced in Gemini prompt)

6.4 Reliability

Firebase Firestore offline persistence enabled — data accessible during network interruption

Cloud Functions retry on failure (3 attempts with exponential backoff)

Gemini API failures degrade gracefully — feature hidden, error logged, user notified

Daily automated Firestore backups via Firebase export to Cloud Storage

Target uptime SLA: 99.9% (Firebase SLA)

6.5 Maintainability

TypeScript strict mode across all files — no implicit any

ESLint + Prettier enforced in CI/CD pipeline

Modular repository pattern — adding a new collection requires only a new Repository class

AI prompt templates in /lib/ai/prompts.ts — editable without touching component code

Firebase Emulator Suite for local development — no production data needed

6.6 Scalability

Firestore horizontally scales automatically; no infrastructure to manage

Next.js deployed on Vercel — edge functions for low-latency global delivery

Gemini API quota managed via rate-limiting middleware in /api/gemini route

Firestore composite indexes defined in firestore.indexes.json for all query patterns



7. AI Module Specification (Gemini Integration)

7.1 Integration Architecture

All Gemini calls are made server-side through a secure Next.js API route at /api/gemini. The client sends a POST request with a prompt payload; the server adds the API key, calls the Gemini 1.5 Pro API, and streams the response back. Results are cached in the aiReports Firestore collection for 24 hours to reduce cost.

7.2 Prompt Templates



Prompt ID

Purpose & Key Instructions

PROMPT-001: Report Analysis

System: 'You are a clinical AI assistant. Summarise this lab report for a patient (Grade 8 reading level). Flag any out-of-range values as Critical/High/Medium/Low. Do not provide diagnoses.' Input: extracted PDF text + patient age/gender.

PROMPT-002: SOAP Note Draft

System: 'You are a medical scribe. Convert the following doctor dictation into a structured SOAP note (Subjective, Objective, Assessment, Plan).' Input: free-text dictation.

PROMPT-003: Diagnosis Assist

System: 'You are a clinical decision-support tool. Given the following symptoms and history, list the top 5 differential diagnoses with ICD-10 codes and rationale. Advisory only — physician must confirm.' Input: symptoms, history, current meds.

PROMPT-004: Discharge Summary

System: 'Draft a hospital discharge summary from the following structured patient data. Include: reason for admission, key findings, treatment received, discharge medications, follow-up plan.' Input: Firestore patient record JSON.

PROMPT-005: Alert Triage

System: 'You are a nurse workflow AI. Re-rank the following nurse alerts by clinical urgency. Return a JSON array in order of priority with a one-sentence rationale for each.' Input: alerts JSON + patient context.

PROMPT-006: Visit Guide

System: 'Write a friendly, reassuring pre-visit preparation guide and post-visit care instructions for a patient. Grade 8 reading level. No medical jargon.' Input: appointment type, diagnosis codes.

PROMPT-007: Operational Insight

System: 'Analyse the following hospital operational metrics and provide 3 concise insights and 2 recommended actions for hospital leadership.' Input: daily aggregated Firestore stats.

PROMPT-008: Natural Language Search

System: 'Convert the following natural language query into a Firestore query filter object (JSON). Only use fields that exist in the schema provided.' Input: user query + schema excerpt.

7.3 Safety & Governance

All AI outputs are labelled with a visible disclaimer: 'AI-generated — requires clinical verification'

No AI output is saved to a patient's primary medical record without explicit staff confirmation (click to approve)

Gemini API calls include a safety filter level of BLOCK_MEDIUM_AND_ABOVE

PHI (Protected Health Information) is anonymised before being sent to Gemini where possible (patient name replaced with 'the patient')

AI feature access is role-gated: patient-facing AI is limited to summaries/guides; clinical AI is only visible to doctors and nurses

Confidence scores are shown for analysis results where derivable from Gemini response metadata



8. Installation & Deployment Guide

8.1 Prerequisites



Tool

Version Required

Node.js

18.x or 20.x LTS

npm / pnpm

npm 9+ or pnpm 8+

Firebase CLI

firebase-tools 13+

Git

Any recent version

Google Cloud Project

With Gemini API enabled

8.2 Environment Variables (.env.local)



Required Environment Variables

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Gemini (server-side only — no NEXT_PUBLIC_ prefix)
GEMINI_API_KEY=...

# Optional: Algolia for full-text search
NEXT_PUBLIC_ALGOLIA_APP_ID=...
ALGOLIA_ADMIN_KEY=...

8.3 Local Development



Setup & Run Commands

# 1. Clone and install
git clone https://github.com/your-org/sehatsetu
cd sehatsetu && npm install

# 2. Start Firebase Emulators (Auth, Firestore, Storage, Functions)
firebase emulators:start

# 3. Run Next.js dev server
npm run dev

# 4. Open http://localhost:3000

8.4 Production Deployment



Production Build & Deploy

# Deploy Next.js to Vercel
vercel --prod

# Deploy Firebase (Firestore rules, Storage rules, Cloud Functions)
firebase deploy --only firestore,storage,functions

# Or use Firebase App Hosting (Next.js native support)
firebase apphosting:backends:create

8.5 Project Structure



Directory Tree

sehatsetu/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, register, reset
│   ├── (dashboard)/        # Role-gated dashboards
│   ├── patients/           # Patient management
│   ├── staff/              # Staff management
│   ├── medical-records/    # Treatments, diagnoses, analyses
│   ├── appointments/       # Scheduling & rooms
│   ├── medicines/          # Inventory
│   ├── ai-assistant/       # Gemini tools
│   ├── patient-portal/     # Patient-facing views
│   ├── search/             # Global search
│   └── api/                # Next.js API routes
│       ├── gemini/         # Gemini proxy
│       └── reports/        # PDF/CSV export
├── lib/
│   ├── firebase/           # SDK init & helpers
│   └── ai/                 # Gemini client & prompts
├── components/             # UI + shared components
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript interfaces
├── store/                  # Zustand state slices
├── functions/              # Firebase Cloud Functions
├── firestore.rules         # Firestore security rules
├── storage.rules           # Storage security rules
├── firestore.indexes.json  # Composite indexes
└── firebase.json           # Firebase project config



9. Known Limitations & Future Enhancements

9.1 Current Limitations (v1.0 Scope)

Full-text search requires Algolia/Typesense setup; basic Firestore queries used as fallback

Gemini API rate limits may throttle bulk report analysis; queuing system to be implemented

Drag-and-drop appointment reschedule is read-only in mobile view

PDF generation uses client-side rendering; very large reports (> 100 pages) may be slow

No HL7/FHIR interoperability in v1.0 — external system integration deferred

Offline mode (Firestore persistence) does not support AI features — network required for Gemini

Multi-hospital (multi-tenant) architecture not implemented in v1.0

9.2 Recommended Enhancements (Roadmap)

HL7 FHIR R4 Integration — standardised health data exchange with external EMR systems

Multi-tenant Architecture — support for hospital chains / groups under one deployment

Voice Input for AI Note Drafting — Web Speech API + Gemini for hands-free SOAP note creation

Predictive Bed Management — Gemini-powered admission/discharge prediction based on historical data

Drug Interaction Checker — Gemini screens new prescriptions against patient's current medication list

WhatsApp / SMS Notifications — appointment reminders to patients via Twilio

DICOM Imaging Integration — link radiology images to patient record (Phase 2)

Unit & Integration Tests — Jest + React Testing Library + Firebase Emulator Suite

CI/CD Pipeline — GitHub Actions: lint, type-check, test, deploy on merge to main

Mobile App — React Native (Expo) sharing Firebase and TypeScript type definitions



10. Testing Checklist

10.1 Manual Test Cases



Module

Test Case

Expected Result

Auth

Login with valid credentials

Redirect to role-appropriate dashboard

Auth

Login with wrong password

Error toast; no redirect; attempt logged

Auth

Access /patients without login

Redirect to /login via middleware

Patient

Add new patient with all fields

Document created in Firestore; appears in list

Patient

Upload lab report PDF

File stored in Cloud Storage; AI analysis triggered

Patient

AI report analysis completes

Summary shown on patient AI tab with disclaimer

Staff

Add doctor with specialization

Doctor created; visible in /staff/doctors

Treatment

Add MedicationTreatment

Correct subtype fields saved; linked to patient

Treatment

Add SurgicalTreatment

Surgeon, anesthesia, complication fields saved

Appointment

Book overlapping appointment

Conflict detected; save blocked; error shown

Room

Admit patient to full room

Admission blocked; capacity error displayed

Nurse Dashboard

New alert fires

Alert appears in queue within 1 s via onSnapshot

AI Search

Type 'diabetic patients over 60'

Gemini parses to Firestore filter; correct results

Audit

Edit patient name

Audit log entry created with diff showing old→new name

Audit

Try to delete audit log

Firestore Security Rule blocks; error returned

Patient Portal

Patient views AI summary

Plain-language text shown; clinical notes hidden

Medicine

Stock drops to reorder level

Low-stock alert created in alerts collection

Export

Generate patient report PDF

PDF downloaded with all tabs of patient detail



11. Appendix

11.1 TypeScript Interface Reference



Interface / Type

Location

Patient

types/patient.ts

Staff, Doctor, Nurse, Administrative

types/staff.ts

Treatment, MedicationTreatment, SurgicalTreatment, Rehabilitation

types/treatment.ts

Diagnosis

types/diagnosis.ts

MedicalHistory

types/medicalHistory.ts

Analysis, BiobloodAnalysis, UrineAnalysis, RwAnalysis

types/analysis.ts

Medicine

types/medicine.ts

Procedure

types/procedure.ts

Appointment

types/appointment.ts

Room

types/room.ts

Task, Responsibility

types/tasks.ts

Alert

types/alert.ts

AuditLog

types/audit.ts

AiReport

types/ai.ts

11.2 Firebase Cloud Functions Reference



Function

Trigger & Purpose

onPatientReportUploaded

Storage trigger: new file in /reports/{patientId}/ → call Gemini PROMPT-001 → save result to aiReports

checkMedicineStock

Scheduled (daily 6am): scan medicines.stockQty <= reorderLevel → create alert

checkMedicineExpiry

Scheduled (daily 6am): scan medicines.expiryDate within 30 days → create alert

generateOperationalInsight

Scheduled (daily 7am): aggregate Firestore stats → call Gemini PROMPT-007 → save to dashboardInsights

writeAuditLog

Callable function: invoked from client on every CRUD mutation → write to auditLogs

notifyTaskAssigned

Firestore trigger: new task document → send FCM push to assignee

cleanAiReportCache

Scheduled (daily midnight): delete aiReports documents where expiresAt < now()

11.3 Firestore Security Rules Summary



Key Rule Logic

// Patients: staff can read/write; patient can only read own record
match /patients/{patientId} {
  allow read: if isStaff() || isOwnPatient(patientId);
  allow write: if isStaff();
}

// Audit Logs: anyone can create, nobody can update or delete
match /auditLogs/{logId} {
  allow create: if isAuthenticated();
  allow read: if isAdmin();
  allow update, delete: if false;
}

// AI Reports: doctors/nurses can read; only Cloud Functions write
match /aiReports/{reportId} {
  allow read: if isDoctor() || isNurse();
  allow write: if false; // Functions only
}



— End of Document —

SehatSetu SRS v2.0  •  ethosh IGNITE 2026  •  Full-Stack AI Track