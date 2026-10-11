import React from 'react';
import { Sparkles, Shield, Cpu, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/60 py-10 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 text-sm">
                CampusAI Classroom Prediction & Management System
              </p>
              <p className="text-slate-500 text-[11px]">
                Statistical AI engine & Automated Overlap-Free Allocation Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API & WebSocket Online
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              AI Baseline Model v1.4 Active
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Optimistic Concurrency Locked
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© 2026 Academic Operations & Facility Systems. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Engineered with React 19, Spring Boot 3.3, JPA & Machine Prediction.
          </p>
        </div>
      </div>
    </footer>
  );
}
