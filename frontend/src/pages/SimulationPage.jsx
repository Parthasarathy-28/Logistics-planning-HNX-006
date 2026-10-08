import React, { useState, useEffect } from 'react';
import { Sliders, Activity, Clock, ShieldAlert, Award, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function SimulationPage({ showToast }) {
  const [durationHours, setDurationHours] = useState(4);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSim = async (hours) => {
    setLoading(true);
    try {
      const res = await api.runSimulation(hours);
      setSimResult(res);
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSim(durationHours);
  }, [durationHours]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in text-slate-900">
      {/* COMMAND HEADER */}
      <div className="command-card rail-blue p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>PREDICTIVE SCENARIO ENGINE</span>
            </span>
            <span className="text-xs text-slate-600 font-mono font-medium">MONTE CARLO SIMULATION</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            WHAT-IF DISRUPTION SIMULATION
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium">
            Test hypothetical disruption durations before committing recovery actions to live fleet dispatch.
          </p>
        </div>
      </div>

      {/* DURATION CONTROL PANEL */}
      <div className="command-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="font-display font-bold text-base text-slate-900">SIMULATED DISRUPTION DURATION</h3>
          </div>
          <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
            {durationHours} HOURS DURATION PARAMETER
          </span>
        </div>

        {/* Duration Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[2, 4, 6, 8].map((hrs) => (
            <button
              key={hrs}
              onClick={() => setDurationHours(hrs)}
              className={`py-3.5 rounded-xl font-bold text-sm transition-all border flex items-center justify-center space-x-2 active:scale-95 ${
                durationHours === hrs
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Clock className={`w-4 h-4 ${durationHours === hrs ? 'text-white' : 'text-slate-500'}`} />
              <span>{hrs} Hours</span>
            </button>
          ))}
        </div>
      </div>

      {/* SIMULATION RESULTS */}
      {loading ? (
        <div className="command-card p-12 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Recalculating Decision Engine for {durationHours}h Scenario...
          </p>
        </div>
      ) : simResult ? (
        <div className="space-y-6">
          {/* Summary Stat Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="command-card p-5 space-y-1">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">Simulated Overhead</span>
              <span className="font-display text-2xl font-bold text-slate-900 block">+{simResult.simulatedDelayMin} Mins</span>
              <span className="text-[11px] text-slate-600 font-medium">Delay accumulation</span>
            </div>
            <div className="command-card p-5 space-y-1">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">Impacted Packages</span>
              <span className="font-display text-2xl font-bold text-blue-600 block">{simResult.riskSummary.total_affected} Shipments</span>
              <span className="text-[11px] text-slate-600 font-medium">Route R03 corridor</span>
            </div>
            <div className="command-card rail-red p-5 space-y-1 bg-red-50/30">
              <span className="text-[10px] text-red-700 font-bold uppercase tracking-wider block">Critical Breaches</span>
              <span className="font-display text-2xl font-bold text-red-600 block">{simResult.riskSummary.critical_risks} Shipments</span>
              <span className="text-[11px] text-red-700 font-bold block">Deadline risk</span>
            </div>
            <div className="command-card rail-green p-5 space-y-1 bg-emerald-50/30">
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Top Action</span>
              <span className="font-display text-sm font-bold text-emerald-700 block truncate">{simResult.recommendedOption?.title}</span>
              <span className="text-[11px] text-emerald-800 font-bold block">Score: {simResult.recommendedOption?.score}/100</span>
            </div>
          </div>

          {/* Explainability Callout */}
          <div className="command-card p-6 sm:p-8 space-y-4">
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Award className="w-5 h-5 text-blue-600" />
              <span>SIMULATED DECISION ENGINE RECOMMENDATION ({durationHours}H)</span>
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900">{simResult.recommendedOption?.title}</h3>
            <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              "{simResult.explanation}"
            </p>
          </div>

          {/* Recalculated Timeline Table */}
          <div className="command-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">RECALCULATED SLA TIMELINES ({durationHours}H SCENARIO)</h3>
                <p className="text-xs text-slate-700 font-medium">Delivery ETA forecasts based on simulated delay parameter</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                FORECAST
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {simResult.analyzedDeliveries.map((item) => (
                <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                  <div>
                    <span className="font-bold text-slate-900 text-sm mr-2">{item.delivery_code}</span>
                    <span className="text-slate-700 text-xs font-medium">{item.customer_name}</span>
                  </div>
                  <div className="flex items-center space-x-4 self-end sm:self-center text-xs">
                    <span className="font-mono text-slate-600">Deadline: <strong className="text-slate-900">{item.deadline}</strong></span>
                    <span className={`font-mono font-bold ${item.risk_level === 'CRITICAL' ? 'text-red-600' : 'text-slate-900'}`}>
                      Simulated ETA: {item.new_eta}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                      item.risk_level === 'CRITICAL' 
                        ? 'bg-red-600 text-white shadow-sm' 
                        : item.risk_level === 'HIGH'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {item.risk_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

