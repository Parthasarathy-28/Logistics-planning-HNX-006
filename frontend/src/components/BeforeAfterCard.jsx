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
    <div className="command-card rail-emerald p-6 space-y-5 text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
            Measurable Logistics Impact
          </span>
          <h3 className="text-lg font-display font-bold text-slate-900 mt-1.5 flex items-center space-x-2">
            <span>BEFORE VS AFTER RECOVERY IMPACT</span>
          </h3>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-emerald-800 flex items-center space-x-2 shadow-sm">
          <TrendingDown className="w-5 h-5 text-emerald-600" />
          <span className="font-display text-sm font-bold">{delayAvoided} MIN DELAY AVOIDED</span>
        </div>
      </div>

      {/* Comparative Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BEFORE Card */}
        <div className="bg-red-50/50 border border-red-200 rounded-2xl p-4 space-y-3 relative overflow-hidden rail-red">
          <div className="absolute top-0 right-0 bg-red-100 text-red-800 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider border-b border-l border-red-200">
            Unmitigated Status
          </div>
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wide">BEFORE Recovery Action</h4>
          </div>
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-600 font-medium flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-red-600" />
                <span>Estimated Delay:</span>
              </span>
              <span className="font-display text-sm font-bold text-red-600">{before.potential_delay_min} min</span>
            </div>
            <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-600 font-medium">Critical SLA Risks:</span>
              <span className="font-display text-sm font-bold text-red-600">{before.critical_risks_count} Delivery</span>
            </div>
            <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-600 font-medium">Affected Shipments:</span>
              <span className="font-display text-sm font-bold text-slate-900">{before.affected_deliveries_count} Deliveries</span>
            </div>
          </div>
        </div>

        {/* AFTER Card */}
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-3 relative overflow-hidden rail-green">
          <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider shadow-sm">
            Optimized Recovery
          </div>
          <div className="flex items-center space-x-2 text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wide">AFTER Recovery Action</h4>
          </div>
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-emerald-200 shadow-sm">
              <span className="text-xs text-slate-600 font-medium flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>New Estimated Delay:</span>
              </span>
              <span className="font-display text-sm font-bold text-emerald-600">{after.potential_delay_min} min</span>
            </div>
            <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-emerald-200 shadow-sm">
              <span className="text-xs text-slate-600 font-medium">Critical SLA Risks:</span>
              <span className="font-display text-sm font-bold text-emerald-600">{after.critical_risks_count} (Zero Risk!)</span>
            </div>
            <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-emerald-200 shadow-sm">
              <span className="text-xs text-slate-600 font-medium">Reassigned Shipment:</span>
              <span className="font-display text-sm font-bold text-slate-900">{after.affected_deliveries_count} Delivery (D101 → V05)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Highlight */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-emerald-900 font-medium shadow-sm">
        <span>
          Result: Reassigning shipment <strong className="text-slate-900">D101</strong> to standby vehicle <strong className="text-slate-900">V05</strong> saved 38 minutes and preserved 100% SLA deadline compliance.
        </span>
        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
      </div>
    </div>
  );
}
