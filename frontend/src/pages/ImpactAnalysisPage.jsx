import React, { useState, useEffect } from 'react';
import VisualCascade from '../components/VisualCascade';
import { ShieldAlert, ArrowRight, Package, Clock, AlertTriangle, Layers } from 'lucide-react';
import { api } from '../services/api';

export default function ImpactAnalysisPage({ disturbanceId, onGenerateRecovery }) {
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImpact() {
      try {
        const id = disturbanceId || 'DIST_DEMO_R03';
        const data = await api.analyzeImpact(id);
        setImpactData(data);
      } catch (err) {
        console.error('Failed to load impact analysis:', err);
      } finally {
        setLoading(false);
      }
    }
    loadImpact();
  }, [disturbanceId]);

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-bold">Running Intelligence Impact Analysis...</div>;
  }

  const deliveries = impactData?.analyzedDeliveries || [
    { id: 'D101', delivery_code: 'D101', customer_name: 'Apex Tech Solutions', deadline: '14:00', current_eta: '13:20', new_eta: '14:08', risk_level: 'CRITICAL', risk_reason: 'New ETA (14:08) breaches deadline (14:00) by 8 mins!', priority: 'CRITICAL' },
    { id: 'D102', delivery_code: 'D102', customer_name: 'Metro Logistics Hub', deadline: '15:30', current_eta: '13:45', new_eta: '14:33', risk_level: 'HIGH', risk_reason: 'Within deadline window.', priority: 'HIGH' },
    { id: 'D103', delivery_code: 'D103', customer_name: 'Omni Retailers', deadline: '17:00', current_eta: '14:10', new_eta: '14:58', risk_level: 'LOW', risk_reason: 'Buffer remaining.', priority: 'STANDARD' }
  ];

  const summary = impactData?.riskSummary || {
    critical_risks: 1,
    total_affected: 3,
    total_delay_min: 48
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
            Impact Analysis Engine
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">DETERMINISTIC IMPACT & SLA RISK ANALYSIS</h1>
          <p className="text-xs text-slate-500 font-medium">Traces Disturbance → Route → Vehicle → Deliveries → SLA Deadlines</p>
        </div>

        <button
          onClick={() => onGenerateRecovery(disturbanceId)}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2 uppercase tracking-wide shrink-0"
        >
          <span>GENERATE RECOVERY OPTIONS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-medium uppercase block">Affected Route</span>
          <span className="text-lg font-black text-slate-900">1 Route (R03)</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-medium uppercase block">Affected Vehicle</span>
          <span className="text-lg font-black text-slate-900">1 Vehicle (V04)</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-medium uppercase block">Affected Deliveries</span>
          <span className="text-lg font-black text-blue-600">{summary.total_affected} Deliveries</span>
        </div>
        <div className="bg-red-50 p-4 rounded-2xl border border-red-200 shadow-sm">
          <span className="text-xs text-red-600 font-bold uppercase block">Critical Deadline Risk</span>
          <span className="text-lg font-black text-red-700">{summary.critical_risks} Shipment (D101)</span>
        </div>
      </div>

      {/* Visual Dependency Cascade */}
      <VisualCascade
        disturbance={impactData?.disturbance}
        routeCode={impactData?.route?.route_code || 'R03'}
        vehicleCode={impactData?.vehicle?.vehicle_code || 'V04'}
        deliveries={deliveries.map(d => ({
          code: d.delivery_code,
          customer: d.customer_name,
          risk: d.risk_level,
          isCritical: d.risk_level === 'CRITICAL',
          deadline: d.deadline,
          eta: d.new_eta
        }))}
      />

      {/* Risk Calculation Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-base text-slate-900">Delivery SLA Risk Breakdown</h3>
          <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded font-bold text-slate-700">
            Calculated Disruption Overhead: +{summary.total_delay_min} mins
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Delivery Code</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Original ETA</th>
                <th className="p-3">New Calculated ETA</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {deliveries.map((item) => (
                <tr key={item.id} className={item.risk_level === 'CRITICAL' ? 'bg-red-50/60 font-bold' : ''}>
                  <td className="p-3 font-extrabold text-slate-900">{item.delivery_code}</td>
                  <td className="p-3 text-slate-700">{item.customer_name}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">{item.deadline}</td>
                  <td className="p-3 font-mono text-slate-500">{item.current_eta || item.original_eta}</td>
                  <td className={`p-3 font-mono font-extrabold ${item.risk_level === 'CRITICAL' ? 'text-red-600' : 'text-slate-800'}`}>
                    {item.new_eta}
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      item.risk_level === 'CRITICAL' 
                        ? 'bg-red-600 text-white' 
                        : item.risk_level === 'HIGH'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.risk_level}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 font-sans text-[11px] max-w-xs">{item.risk_reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
