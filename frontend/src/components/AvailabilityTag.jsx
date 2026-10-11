import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function AvailabilityTag({ actualAvailable, statusMessage, roomStatus }) {
  if (roomStatus === 'MAINTENANCE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <AlertTriangle className="w-3.5 h-3.5" />
        Under Maintenance
      </span>
    );
  }

  if (roomStatus === 'INACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-700/40 text-slate-400 border border-slate-700">
        <XCircle className="w-3.5 h-3.5" />
        Inactive
      </span>
    );
  }

  if (actualAvailable) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        Actual: Available
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30"
      title={statusMessage}
    >
      <XCircle className="w-3.5 h-3.5" />
      Actual: Occupied
    </span>
  );
}
