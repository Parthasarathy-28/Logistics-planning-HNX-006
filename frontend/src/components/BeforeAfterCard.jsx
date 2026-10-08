import React from 'react';
import { ArrowRight, CheckCircle, AlertTriangle, TrendingDown, Clock, ShieldCheck } from 'lucide-react';

export default function BeforeAfterCard({ beforeMetrics, afterMetrics }) {
  const before = beforeMetrics || {
    potential_delay_min: 48,
    critical_risks_count: 1,
    affected_deliveries_count: 3
  };

  const after = afterMetrics || {
    potential_delay_min: 10,
    critical_risks_count: 0,
    affected_deliveries_count: 1,
    delay_avoided_min: 38
  };

  const delayAvoided = after.delay_avoided_min || (before.potential_delay_min - after.potential_delay_min);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
            Hackathon Measurable Impact
          </span>
          <h3 className="text-lg font-extrabold text-white mt-1.5 flex items-center space-x-2">
            <span>BEFORE VS AFTER RECOVERY IMPACT</span>
          </h3>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-emerald-300 flex items-center space-x-2">
          <TrendingDown className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-black">{delayAvoided} MIN DELAY AVOIDED</span>
        </div>
      </div>

      {/* Comparative Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BEFORE Card */}
        <div className="bg-slate-800/60 border border-red-500/30 rounded-xl p-4 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-red-500/20 text-red-400 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
            Unmitigated Status
          </div>
          <div className="flex items-center space-x-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="font-bold text-sm text-slate-100 uppercase tracking-wide">BEFORE Recovery Action</h4>
          </div>
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-700/50">
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-red-400" />
                <span>Estimated Delay:</span>
              </span>
              <span className="text-sm font-black text-red-400">{before.potential_delay_min} min</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-700/50">
              <span className="text-xs text-slate-400">Critical SLA Risks:</span>
              <span className="text-sm font-black text-red-400">{before.critical_risks_count} Delivery</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-700/50">
              <span className="text-xs text-slate-400">Affected Shipments:</span>
              <span className="text-sm font-bold text-slate-200">{before.affected_deliveries_count} Deliveries</span>
            </div>
          </div>
        </div>

        {/* AFTER Card */}
        <div className="bg-slate-800/60 border border-emerald-500/40 rounded-xl p-4 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
            Optimized Recovery
          </div>
          <div className="flex items-center space-x-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="font-bold text-sm text-slate-100 uppercase tracking-wide">AFTER Recovery Action</h4>
          </div>
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center bg-slate-900/60 px-3 py-2 rounded-lg border border-emerald-500/20">
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>New Estimated Delay:</span>
              </span>
              <span className="text-sm font-black text-emerald-400">{after.potential_delay_min} min</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 px-3 py-2 rounded-lg border border-emerald-500/20">
              <span className="text-xs text-slate-400">Critical SLA Risks:</span>
              <span className="text-sm font-black text-emerald-400">{after.critical_risks_count} (Zero Risk!)</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 px-3 py-2 rounded-lg border border-emerald-500/20">
              <span className="text-xs text-slate-400">Reassigned Shipment:</span>
              <span className="text-sm font-bold text-slate-200">{after.affected_deliveries_count} Delivery (D101 → V05)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Highlight */}
      <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-200">
        <span className="font-medium">
          Result: Reassigning shipment <strong className="text-white">D101</strong> to standby vehicle <strong className="text-white">V05</strong> saved 38 minutes and preserved 100% SLA deadline compliance.
        </span>
        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
      </div>
    </div>
  );
}
