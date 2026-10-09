import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Truck, User, Clock, ArrowRight, Package, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function DisturbanceDetailsPage({ disturbanceId, onViewImpact }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const id = disturbanceId || 'DIST_DEMO_R03';
        const data = await api.getDisturbance(id);
        setDetails(data);
      } catch (err) {
        console.error('Failed to load disturbance details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [disturbanceId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Loading Incident Intelligence Report...</p>
      </div>
    );
  }

  const dist = details?.disturbance || {
    disturbance_code: 'DST-101',
    driver_name: 'Alex Driver',
    vehicle_number: 'V04',
    route_name: 'Industrial Corridor South (R03)',
    input_method: 'TAP',
    category: 'VEHICLE',
    type: 'ENGINE ISSUE',
    description: 'Engine stopped near route R03 (Mile 18)',
    latitude: 12.9716,
    longitude: 77.5946,
    timestamp: '10:42 AM',
    severity: 'CRITICAL'
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in text-slate-900">
      {/* COMMAND HEADER */}
      <div className="command-card rail-red p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200 flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span>INCIDENT TELEMETRY REPORT</span>
            </span>
            <span className="text-xs text-slate-600 font-mono font-medium">{dist.timestamp}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            INCIDENT REPORT #{dist.disturbance_code || 'DST-101'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium">
            Real-time disruption telemetry captured via {dist.input_method || 'DRIVER'} interface.
          </p>
        </div>

        <button
          onClick={() => onViewImpact(dist.id)}
          className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 uppercase tracking-wider shrink-0 active:scale-95 border border-red-500/30"
        >
          <span>RUN IMPACT CASCADE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 CORE INCIDENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WHAT HAPPENED? */}
        <div className="command-card p-6 space-y-3">
          <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest block">WHAT HAPPENED?</span>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-200 shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">{dist.type}</h3>
              <span className="text-xs font-bold text-slate-600 uppercase">{dist.category} INCIDENT</span>
            </div>
          </div>
          <p className="text-xs text-slate-800 font-medium bg-slate-50 p-4 rounded-xl border border-slate-200 italic leading-relaxed">
            "{dist.description}"
          </p>
        </div>

        {/* WHERE & WHEN? */}
        <div className="command-card p-6 space-y-3">
          <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest block">WHERE & WHEN?</span>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl border border-orange-200 shadow-sm">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">Route {dist.route_id || dist.route_code || 'R03'}</h3>
              <span className="text-xs font-medium text-slate-600">{dist.route_name || 'Industrial Corridor South'}</span>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs">
            <p className="text-slate-600 font-medium">GPS Coordinates:</p>
            <p className="font-mono font-bold text-slate-900 text-sm">{dist.latitude}° N, {dist.longitude}° E</p>
          </div>
        </div>

        {/* WHO IS AFFECTED? */}
        <div className="command-card p-6 space-y-3">
          <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest block">WHO IS AFFECTED?</span>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200 shadow-sm">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">{dist.driver_name || 'Authenticated Driver'}</h3>
              <span className="text-xs font-bold text-slate-600 uppercase">Assigned Unit: {dist.vehicle_number || 'V04'}</span>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs">
            <p className="text-slate-600 font-medium">Capture Source Method:</p>
            <p className="font-bold text-orange-600 text-sm uppercase">{dist.input_method || 'TAP'} REPORTING</p>
          </div>
        </div>

        {/* SEVERITY LEVEL */}
        <div className="command-card rail-red p-6 space-y-3 bg-red-50/30">
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest block">SEVERITY RATING</span>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-2xl font-bold text-red-600">{dist.severity}</h3>
              <span className="text-xs text-red-700 font-bold">ACTION REQUIRED</span>
            </div>
            <span className="text-xs font-bold bg-red-600 text-white px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              HIGH PRIORITY
            </span>
          </div>
          <p className="text-xs text-slate-700 font-medium pt-1">
            Triggers automatic impact cascading engine & SLA deadline breach evaluation.
          </p>
        </div>
      </div>
    </div>
  );
}

