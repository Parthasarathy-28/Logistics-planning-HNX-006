import React, { useState, useEffect } from 'react';
import { Sliders, Activity, Clock, ShieldAlert, Award, ArrowRight } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
          Scenario Modeling Engine
        </span>
        <h1 className="text-2xl font-black text-slate-900 mt-2">WHAT-IF DISRUPTION SIMULATION</h1>
        <p className="text-xs text-slate-500 font-medium">Test dynamic disruption duration shifts and observe real-time SLA recalculations</p>
      </div>

      {/* Control Panel: Duration Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Select Disruption Duration Parameter</h3>
          </div>
          <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
            {durationHours} Hours Duration
          </span>
        </div>

        {/* Buttons Preset */}
        <div className="grid grid-cols-4 gap-3">
          {[2, 4, 6, 8].map((hrs) => (
            <button
              key={hrs}
              onClick={() => setDurationHours(hrs)}
              className={`py-3.5 rounded-2xl font-extrabold text-sm transition-all border-2 ${
                durationHours === hrs
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {hrs} Hours
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Results Display */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 font-bold">Recalculating Decision Engine for {durationHours}h scenario...</div>
      ) : simResult ? (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Simulated Delay</span>
              <span className="text-xl font-black text-slate-900">{simResult.simulatedDelayMin} Minutes</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Affected Shipments</span>
              <span className="text-xl font-black text-blue-600">{simResult.riskSummary.total_affected} Deliveries</span>
            </div>
            <div className="bg-red-50 p-4 rounded-2xl border border-red-200 shadow-sm">
              <span className="text-[10px] text-red-600 font-bold uppercase block">Critical Risks</span>
              <span className="text-xl font-black text-red-700">{simResult.riskSummary.critical_risks} Shipments</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Recommended Action</span>
              <span className="text-sm font-extrabold text-emerald-900 block truncate">{simResult.recommendedOption?.title}</span>
            </div>
          </div>

          {/* Explainability Callout */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-extrabold uppercase tracking-wider">
              <Award className="w-5 h-5 text-blue-400" />
              <span>Simulated Decision Engine Recommendation</span>
            </div>
            <h3 className="text-lg font-black text-white">{simResult.recommendedOption?.title}</h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              "{simResult.explanation}"
            </p>
          </div>

          {/* Deliveries Risk Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">Recalculated SLA Timelines ({durationHours}h Disruption)</h3>
            <div className="divide-y divide-slate-100">
              {simResult.analyzedDeliveries.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs font-medium">
                  <div>
                    <span className="font-extrabold text-slate-900 mr-2">{item.delivery_code}</span>
                    <span className="text-slate-600">{item.customer_name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-slate-500">Deadline: {item.deadline}</span>
                    <span className={`font-mono font-bold ${item.risk_level === 'CRITICAL' ? 'text-red-600' : 'text-slate-800'}`}>
                      New ETA: {item.new_eta}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      item.risk_level === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-emerald-100 text-emerald-800'
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
