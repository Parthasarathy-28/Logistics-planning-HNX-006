import React, { useState, useEffect } from 'react';
import VisualCascade from '../components/VisualCascade';
import { ShieldAlert, ArrowRight, Package, Clock, AlertTriangle, Layers, Zap, Truck, MapPin } from 'lucide-react';
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
    return (
      <div className="max-w-6xl mx-auto p-12 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Running Intelligence Impact Analysis...</p>
      </div>
    );
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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in text-slate-900">
      {/* COMMAND HEADER */}
      <div className="command-card rail-orange p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-200 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-orange-600" />
              <span>IMPACT ANALYSIS ENGINE</span>
            </span>
            <span className="text-xs text-slate-600 font-mono font-medium">DETERMINISTIC MODEL</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            IMPACT & SLA RISK CASCADE
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium">
            Propagates physical incident telemetry across route geometry, vehicle assignments, package SLAs, and customer deadlines.
          </p>
        </div>

        <button
          onClick={() => onGenerateRecovery(disturbanceId)}
          className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2.5 uppercase tracking-wider shrink-0 active:scale-95 border border-orange-500/30"
        >
          <span>GENERATE RECOVERY OPTIONS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="command-card p-5 space-y-1">
          <span className="text-slate-600 text-[10px] font-bold uppercase tracking-wider block">Affected Corridor</span>
          <span className="font-display text-xl font-bold text-slate-900 block">Route R03</span>
          <span className="text-[11px] text-orange-600 font-semibold block">Industrial Corridor South</span>
        </div>
        <div className="command-card p-5 space-y-1">
          <span className="text-slate-600 text-[10px] font-bold uppercase tracking-wider block">Affected Vehicle</span>
          <span className="font-display text-xl font-bold text-slate-900 block">Vehicle V04</span>
          <span className="text-[11px] text-slate-600 font-medium block">KA-04-ED-4004</span>
        </div>
        <div className="command-card p-5 space-y-1">
          <span className="text-slate-600 text-[10px] font-bold uppercase tracking-wider block">Affected Deliveries</span>
          <span className="font-display text-xl font-bold text-orange-600 block">{summary.total_affected} Shipments</span>
          <span className="text-[11px] text-slate-600 font-medium block">D101, D102, D103</span>
        </div>
        <div className="command-card rail-red p-5 space-y-1 bg-red-50/30">
          <span className="text-red-700 text-[10px] font-bold uppercase tracking-wider block">SLA Breach Risk</span>
          <span className="font-display text-xl font-bold text-red-600 block">{summary.critical_risks} Shipment</span>
          <span className="text-[11px] text-red-700 font-bold block">D101 (Apex Tech)</span>
        </div>
      </div>

      {/* VISUAL DEPENDENCY CASCADE */}
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

      {/* RISK CALCULATION TABLE */}
      <div className="command-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">DELIVERY SLA RISK BREAKDOWN</h3>
            <p className="text-xs text-slate-700 font-medium">Deterministic recalculation of customer arrival windows based on +48 min delay overhead</p>
          </div>
          <span className="text-xs font-mono bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-lg font-bold self-start sm:self-auto">
            Disruption Overhead: +{summary.total_delay_min} mins
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Delivery Code</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Deadline SLA</th>
                <th className="p-3.5">Original ETA</th>
                <th className="p-3.5">Calculated New ETA</th>
                <th className="p-3.5">Risk Rating</th>
                <th className="p-3.5">Impact Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {deliveries.map((item) => (
                <tr key={item.id} className={item.risk_level === 'CRITICAL' ? 'bg-red-50/50 font-bold' : 'hover:bg-slate-50/80 transition-colors'}>
                  <td className="p-3.5 font-bold text-slate-900">{item.delivery_code}</td>
                  <td className="p-3.5 text-slate-700">{item.customer_name}</td>
                  <td className="p-3.5 font-mono font-bold text-slate-900">{item.deadline}</td>
                  <td className="p-3.5 font-mono text-slate-600">{item.current_eta || item.original_eta}</td>
                  <td className={`p-3.5 font-mono font-bold ${item.risk_level === 'CRITICAL' ? 'text-red-600' : 'text-slate-900'}`}>
                    {item.new_eta}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                      item.risk_level === 'CRITICAL' 
                        ? 'bg-red-600 text-white shadow-sm' 
                        : item.risk_level === 'HIGH'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {item.risk_level}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-700 font-sans text-xs max-w-xs">{item.risk_reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

