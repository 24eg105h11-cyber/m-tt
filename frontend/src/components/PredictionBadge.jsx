import React, { useState } from 'react';
import { Sparkles, Info, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

export default function PredictionBadge({
  predictedAvailability,
  confidence,
  explanation,
  insufficientData,
  contributingFactors,
  disclaimer,
  compact = false,
}) {
  const [showModal, setShowModal] = useState(false);

  const percent = predictedAvailability != null ? Math.round(predictedAvailability) : null;

  let colorClasses = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
  let badgeText = 'High Availability';
  if (percent !== null) {
    if (percent < 40) {
      colorClasses = 'border-rose-500/30 bg-rose-500/10 text-rose-400';
      badgeText = 'High Contention';
    } else if (percent < 75) {
      colorClasses = 'border-amber-500/30 bg-amber-500/10 text-amber-400';
      badgeText = 'Moderate Demand';
    }
  }

  const confidenceBadge = (
    <span
      className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
        confidence === 'HIGH'
          ? 'bg-emerald-500/20 text-emerald-300'
          : confidence === 'MEDIUM'
          ? 'bg-blue-500/20 text-blue-300'
          : 'bg-amber-500/20 text-amber-300'
      }`}
    >
      {confidence || 'LOW'} Conf.
    </span>
  );

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition hover:scale-[1.02] ${colorClasses}`}
        title="Click to view AI availability prediction factors"
      >
        <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-sm tracking-tight">
            {percent !== null ? `${percent}%` : 'N/A'}
          </span>
          {!compact && (
            <span className="text-xs opacity-90 font-medium hidden sm:inline">
              {insufficientData ? 'Prior Baseline' : 'Predicted Avail.'}
            </span>
          )}
        </div>
        {confidence && confidenceBadge}
        <Info className="w-3.5 h-3.5 opacity-70 hover:opacity-100" />
      </div>

      {/* Modal with explainability & factors */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">
                    AI Availability Prediction Insights
                  </h3>
                  <p className="text-xs text-slate-400">
                    Statistical machine prediction & heuristic analysis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4 mb-4 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                  Calculated Likelihood
                </span>
                <span className="text-3xl font-extrabold text-white">
                  {percent !== null ? `${percent}%` : 'N/A'}
                </span>
                <span className="ml-2 text-xs text-slate-400">({badgeText})</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                  Model Confidence
                </span>
                {confidenceBadge}
              </div>
            </div>

            {insufficientData && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Insufficient historical data:</strong> This classroom does not yet have enough
                  completed bookings. The system applied an empirical prior baseline. Confidence will
                  grow automatically as more bookings are recorded.
                </div>
              </div>
            )}

            <div className="space-y-3 mb-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Model Reasoning & Explanation
              </h4>
              <p className="text-sm text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800 leading-relaxed">
                {explanation || 'Prediction is based on recurring academic schedules and time-of-day demand trends.'}
              </p>

              {contributingFactors && contributingFactors.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-1.5">
                    Contributing Factors:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {contributingFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" />
              <span>
                {disclaimer ||
                  'Prediction is an AI statistical estimate based on historical patterns, not a booking guarantee. Actual classroom availability remains governed by confirmed bookings and timetable allocations.'}
              </span>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white transition shadow-lg shadow-indigo-600/20"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
}
