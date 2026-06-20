'use client';

import { Sparkles, AlertCircle, Check } from 'lucide-react';

interface AISummaryCardProps {
  title: string;
  summary: string;
  confidence?: number;
  criticalFlags?: {
    field: string;
    value: string;
    range: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    explanation: string;
  }[];
  suggestedFollowUp?: string[];
  onApprove?: () => void;
  approveLabel?: string;
  isApproved?: boolean;
  loading?: boolean;
}

export default function AISummaryCard({
  title,
  summary,
  confidence = 90,
  criticalFlags = [],
  suggestedFollowUp = [],
  onApprove,
  approveLabel = "Approve and Save to Medical Record",
  isApproved = false,
  loading = false,
}: AISummaryCardProps) {
  
  const severityColors = {
    critical: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    low: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50/40 to-teal-50/20 p-6 shadow-sm relative overflow-hidden">
      {/* Sparkle graphic */}
      <div className="absolute top-[-20px] right-[-20px] h-20 w-20 rounded-full bg-cyan-200/20 blur-xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-100/50 pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-cyan-600 p-1.5 rounded-lg text-white">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">{title}</h3>
            <span className="text-[10px] font-medium text-slate-400">Google Gemini 1.5 Clinical Assistant</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {confidence && (
            <span className="inline-flex items-center rounded-full bg-cyan-100/80 px-2.5 py-0.5 text-xs font-semibold text-cyan-800">
              {confidence}% Confidence
            </span>
          )}
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
            Advisory Only
          </span>
        </div>
      </div>

      {/* Summary content */}
      <div className="mt-4">
        <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{summary}</p>
      </div>

      {/* Critical Anomaly Flags */}
      {criticalFlags.length > 0 && (
        <div className="mt-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lab Anomaly Flags</h4>
          <div className="grid grid-cols-1 gap-3">
            {criticalFlags.map((flag, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl border flex gap-3 text-left ${severityColors[flag.severity] || 'bg-slate-50 border-slate-200 text-slate-700'}`}
              >
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{flag.field}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/70 border border-current font-mono">
                      Val: {flag.value} (Normal: {flag.range})
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.25 rounded bg-current/10 border-current font-sans">
                      {flag.severity}
                    </span>
                  </div>
                  <p className="text-xs mt-1.5 leading-relaxed opacity-90">{flag.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up Steps */}
      {suggestedFollowUp.length > 0 && (
        <div className="mt-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Suggested Next Steps</h4>
          <ul className="space-y-2">
            {suggestedFollowUp.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-600">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-500 shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sign-off / Approve Button */}
      {onApprove && (
        <div className="mt-6 pt-4 border-t border-cyan-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-[10px] text-slate-400 italic">
            Reviewed by AI — verify clinically before action
          </span>

          <button
            onClick={onApprove}
            disabled={isApproved || loading}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition ${
              isApproved 
                ? 'bg-emerald-600 text-white shadow-emerald-600/10 cursor-default' 
                : 'bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-cyan-600/10 disabled:opacity-50'
            }`}
          >
            {isApproved ? (
              <>
                <Check className="h-4 w-4" />
                Approved & Record Synchronized
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {loading ? 'Processing approval...' : approveLabel}
              </>
            )}
          </button>
        </div>
      )}
      
      {!onApprove && (
        <div className="mt-4 pt-3 border-t border-cyan-100/30 text-[10px] text-slate-400 italic">
          Reviewed by AI — verify clinically before action
        </div>
      )}

    </div>
  );
}
