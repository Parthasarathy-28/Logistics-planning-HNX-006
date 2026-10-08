import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, Truck, MapPin, Activity, CheckCircle, RefreshCw, Eye } from 'lucide-react';
import { api } from '../services/api';

export default function OwnerDashboard({ onViewImpact, onViewDetails, showToast }) {
  const [alertsData, setAlertsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const data = await api.getOwnerAlerts();
      setAlertsData(data);
    } catch (err) {
      console.error('Failed to load owner alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  const alerts = alertsData?.alerts || [];
  const latestAlert = alerts.length > 0 ? alerts[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            Operations Control Center
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">OWNER DECISION-SUPPORT DASHBOARD</h1>
          <p className="text-xs text-slate-500 font-medium">Real-time situational awareness and disruption recovery oversight</p>
        </div>

        <button
          onClick={fetchAlerts}
          className="self-start md:self-auto px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all shadow"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* 🚨 OWNER ALERT CARD (Prominent Requirement #7) */}
      {latestAlert ? (
        <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white rounded-3xl p-6 border-2 border-red-500 shadow-2xl space-y-4 pulse-red relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-red-900/60 pb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 text-white p-2.5 rounded-2xl shadow-lg">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                  OWNER ALERT
                </span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">🚨 DISTURBANCE FOUND</h2>
              </div>
            </div>
            <span className="text-xs font-black bg-red-600 text-white px-3 py-1 rounded-full uppercase tracking-wider">
              {latestAlert.severity || 'CRITICAL'} SEVERITY
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-red-900/40">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Vehicle</span>
              <p className="text-sm font-extrabold text-white">{latestAlert.vehicle_code || latestAlert.vehicle_id}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Route</span>
              <p className="text-sm font-extrabold text-blue-400">Route {latestAlert.route_code || latestAlert.route_id}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Disturbance Type</span>
              <p className="text-sm font-extrabold text-amber-300">{latestAlert.type}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Time Captured</span>
              <p className="text-sm font-bold text-slate-200">{latestAlert.timestamp}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <p className="text-xs text-slate-300 font-medium">
              Reported by <strong className="text-white">{latestAlert.driver_name}</strong> via <span className="text-blue-400 font-bold">{latestAlert.input_method}</span>: "{latestAlert.description}"
            </p>
            <div className="flex space-x-2 w-full sm:w-auto">
              <button
                onClick={() => onViewDetails(latestAlert.id)}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
              <button
                onClick={() => onViewImpact(latestAlert.id)}
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 uppercase tracking-wide"
              >
                <span>View Impact</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">All Fleet Operations Normal</h3>
          <p className="text-xs text-slate-500">No active disruptions detected across current active routes.</p>
        </div>
      )}

      {/* Active Disturbances Table & Fleet Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disturbances List */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900">Active Reported Disturbances ({alerts.length})</h3>
            <span className="text-xs text-slate-500">Sorted by time</span>
          </div>

          <div className="divide-y divide-slate-100">
            {alerts.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-all">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${item.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900">{item.type}</span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        Vehicle {item.vehicle_code}
                      </span>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Route {item.route_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                    item.plan_status === 'APPROVED' || item.plan_status === 'SENT' || item.plan_status === 'DRIVER_ACKNOWLEDGED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {item.plan_status === 'NO_PLAN' ? 'PENDING ACTION' : item.plan_status}
                  </span>
                  <button
                    onClick={() => onViewImpact(item.id)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm"
                  >
                    Impact Engine
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Overview Sidebar */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3">Fleet Operations Status</h3>
          <div className="space-y-3">
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 flex justify-between items-center">
              <span className="text-xs text-slate-300 font-medium">Total Active Vehicles</span>
              <span className="text-lg font-black text-white">5 Fleet Units</span>
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 flex justify-between items-center">
              <span className="text-xs text-slate-300 font-medium">Active Monitored Routes</span>
              <span className="text-lg font-black text-blue-400">5 Corridors</span>
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 flex justify-between items-center">
              <span className="text-xs text-slate-300 font-medium">Standby Replacement Units</span>
              <span className="text-lg font-black text-emerald-400">1 (V05 Express)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
