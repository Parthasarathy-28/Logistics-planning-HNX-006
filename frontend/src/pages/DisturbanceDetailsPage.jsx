import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Truck, User, Clock, ArrowRight, Package } from 'lucide-react';
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
    return <div className="p-12 text-center text-slate-500 font-bold">Loading Disturbance Details...</div>;
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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-100 px-3 py-1 rounded-full">
            Disturbance Overview
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">DISTURBANCE REPORT #{dist.disturbance_code}</h1>
          <p className="text-xs text-slate-500 font-medium">Detailed situational summary reported by driver</p>
        </div>

        <button
          onClick={() => onViewImpact(dist.id)}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2 uppercase tracking-wide"
        >
          <span>VIEW IMPACT</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 5 Core Questions Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WHAT HAPPENED? */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">WHAT HAPPENED?</span>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-extrabold text-slate-900">{dist.type} ({dist.category})</h3>
          </div>
          <p className="text-xs text-slate-600 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            "{dist.description}"
          </p>
        </div>

        {/* WHERE & WHEN? */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">WHERE & WHEN?</span>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-extrabold text-slate-900">Route {dist.route_id || 'R03'}</h3>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Location: <span className="font-mono font-bold text-slate-800">{dist.latitude}° N, {dist.longitude}° E</span> (Captured at {dist.timestamp})
          </p>
        </div>

        {/* WHO IS AFFECTED? */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">WHO IS AFFECTED?</span>
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-extrabold text-slate-900">{dist.driver_name} (DRV04)</h3>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Vehicle: <span className="font-bold text-slate-800">{dist.vehicle_number} (KA-04-ED-4004)</span>
          </p>
        </div>

        {/* SEVERITY LEVEL */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">SEVERITY RATING</span>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-red-600">{dist.severity} SEVERITY</h3>
            <span className="text-xs font-bold bg-red-100 text-red-800 px-3 py-1 rounded-full">
              Requires Recovery
            </span>
          </div>
          <p className="text-xs text-slate-500">Triggers deterministic deadline & impact analysis</p>
        </div>
      </div>
    </div>
  );
}
