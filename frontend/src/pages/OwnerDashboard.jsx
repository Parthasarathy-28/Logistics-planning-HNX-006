import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, AlertTriangle, ArrowRight, Truck, MapPin, Activity, 
  CheckCircle, RefreshCw, Eye, Zap, Clock, ShieldCheck, TrendingUp, AlertCircle
} from 'lucide-react';
import FleetMap from '../components/FleetMap';
import { api } from '../services/api';

export default function OwnerDashboard({ onViewImpact, onViewDetails, showToast }) {
  const [alertsData, setAlertsData] = useState(null);
  const [fleetData, setFleetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const fetchData = async () => {
    try {
      const [alerts, fleet] = await Promise.all([
        api.getOwnerAlerts(),
        api.getFleetLocations()
      ]);
      setAlertsData(alerts);
      setFleetData(fleet);
    } catch (err) {
      console.error('Failed to load owner dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3500);
    const timeInterval = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const alerts = alertsData?.alerts || [];
  const latestAlert = alerts.length > 0 ? alerts[0] : null;
  const activeVehiclesCount = fleetData?.vehicles?.length || 5;
  const activeDisruptionsCount = alerts.length;
  const atRiskDeliveries = alerts.length > 0 ? 3 : 0;
  const criticalSlaCount = alerts.length > 0 ? 1 : 0;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-900">
      
      {/* COMMAND CENTER HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white text-slate-900 p-6 rounded-3xl shadow-md border border-slate-200/80 relative overflow-hidden">
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-sm">
            <Zap className="w-6 h-6 animate-pulse text-orange-600" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-[11px] font-black uppercase tracking-widest bg-orange-50 text-orange-700 border border-orange-200 px-3 py-0.5 rounded-full flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE OPERATIONS CONTROL</span>
              </span>
              <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">
                {currentTime}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 font-display mt-1">
              FLEET COMMAND CENTER
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3 relative z-10">
          <button
            onClick={fetchData}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl flex items-center space-x-2 transition-all border border-slate-200 shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH DATA</span>
          </button>
        </div>
      </div>

      {/* MAIN KPI STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Active Vehicles */}
        <div className="command-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">ACTIVE VEHICLES</span>
            <Truck className="w-4 h-4 text-orange-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 font-display tracking-tight">{activeVehiclesCount}</span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              100% ONLINE
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Monitored Fleet Corridors</p>
        </div>

        {/* Disruptions */}
        <div className="command-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">ACTIVE DISRUPTIONS</span>
            <AlertTriangle className={`w-4 h-4 ${activeDisruptionsCount > 0 ? 'text-red-600' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 font-display tracking-tight">{activeDisruptionsCount}</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
              activeDisruptionsCount > 0 ? 'text-red-800 bg-red-50 border-red-200 animate-pulse' : 'text-slate-600 bg-slate-100 border-slate-200'
            }`}>
              {activeDisruptionsCount > 0 ? 'ACTION NEEDED' : 'CLEAR'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Real-time captured incidents</p>
        </div>

        {/* At Risk Deliveries */}
        <div className="command-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">AT-RISK DELIVERIES</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 font-display tracking-tight">{atRiskDeliveries}</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
              atRiskDeliveries > 0 ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-slate-600 bg-slate-100 border-slate-200'
            }`}>
              {atRiskDeliveries > 0 ? 'DELAY THREAT' : 'SAFE'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Impacted package tasks</p>
        </div>

        {/* Critical SLA */}
        <div className="command-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">CRITICAL SLA RISK</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 font-display tracking-tight">{criticalSlaCount}</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
              criticalSlaCount > 0 ? 'text-red-800 bg-red-50 border-red-200' : 'text-emerald-800 bg-emerald-50 border-emerald-200'
            }`}>
              {criticalSlaCount > 0 ? 'HIGH PRIORITY' : 'ZERO RISK'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">SLA breach potential</p>
        </div>

        {/* Recovery Savings */}
        <div className="command-card p-5 space-y-2 bg-gradient-to-br from-emerald-50/60 to-white">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">RECOVERY SAVINGS</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-700 font-display tracking-tight">38 MIN</span>
            <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
              OPTIMIZED
            </span>
          </div>
          <p className="text-[11px] text-emerald-700/80 font-medium">Potential delay prevented</p>
        </div>
      </div>

      {/* REAL GEOGRAPHIC MAP CONTAINER */}
      <div className="command-card p-2 shadow-md overflow-hidden">
        <FleetMap
          vehicles={fleetData?.vehicles || []}
          disruptions={fleetData?.activeDisruptions || []}
          deliveries={fleetData?.deliveries || []}
        />
      </div>

      {/* REAL-TIME ALERT CENTER PANEL */}
      {latestAlert ? (
        <div className="bg-red-50/90 text-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-red-500 shadow-lg space-y-5 relative overflow-hidden rail-red">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-200 pb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 text-white p-3 rounded-2xl shadow-md animate-bounce">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-800 bg-red-100 px-2.5 py-0.5 rounded border border-red-300">
                    CRITICAL DISRUPTION DETECTED
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{latestAlert.timestamp}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-1">
                  🚨 {latestAlert.type?.toUpperCase()} — HIGH IMPACT
                </h2>
              </div>
            </div>
            
            <span className="self-start sm:self-auto text-xs font-black bg-red-600 text-white px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              {latestAlert.severity || 'CRITICAL'} SEVERITY
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-white p-5 rounded-2xl border border-red-200 shadow-sm">
            <div className="space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Impacted Vehicle</span>
              <p className="text-base font-black text-slate-900 flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-orange-600" />
                <span>{latestAlert.vehicle_code || latestAlert.vehicle_id}</span>
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Corridor / Route</span>
              <p className="text-base font-black text-orange-600 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Route {latestAlert.route_code || latestAlert.route_id}</span>
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Deliveries Affected</span>
              <p className="text-base font-black text-amber-700">3 Packages (D101, D102, D103)</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Potential Delay</span>
              <p className="text-base font-black text-red-600">+48 Min Expected Delay</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs sm:text-sm text-slate-700 font-medium">
              Reported by driver <strong className="text-slate-900">{latestAlert.driver_name}</strong> via <span className="text-orange-600 font-bold uppercase">{latestAlert.input_method}</span>: 
              <span className="italic text-slate-800"> "{latestAlert.description}"</span>
            </p>
            <div className="flex space-x-3 w-full sm:w-auto">
              <button
                onClick={() => onViewDetails(latestAlert.id)}
                className="flex-1 sm:flex-initial px-4 py-3 bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center space-x-2 active:scale-95 shadow-sm"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                <span>VIEW DETAILS</span>
              </button>
              <button
                onClick={() => onViewImpact(latestAlert.id)}
                className="flex-1 sm:flex-initial px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 uppercase tracking-wide active:scale-95 border border-orange-500"
              >
                <span>RUN IMPACT CASCADE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="command-card p-8 text-center space-y-3 bg-emerald-50/40 border-emerald-200 rail-green">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 font-display">ALL FLEET CORRIDORS OPERATING NORMALLY</h3>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
            No active disruptions detected across monitored delivery routes. Decision intelligence system monitoring real-time telemetry.
          </p>
        </div>
      )}

      {/* ACTIVE DISTURBANCES & FLEET INTELLIGENCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disturbances List */}
        <div className="lg:col-span-2 command-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 font-display">Active Reported Disturbances ({alerts.length})</h3>
              <p className="text-xs text-slate-500">Live feed ordered by time captured</p>
            </div>
            <span className="text-[11px] font-extrabold text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              DISRUPTION LOG
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No active disruptions in log.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {alerts.map((item) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white px-3 rounded-2xl transition-all border border-transparent hover:border-slate-200">
                  <div className="flex items-start space-x-3.5">
                    <div className={`p-2.5 rounded-2xl mt-0.5 ${item.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm text-slate-900 font-display">{item.type}</span>
                        <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                          {item.vehicle_code}
                        </span>
                        <span className="text-[10px] font-extrabold bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md border border-orange-200">
                          Route {item.route_code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{item.description}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Reported by {item.driver_name} at {item.timestamp}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                      item.plan_status === 'APPROVED' || item.plan_status === 'SENT' || item.plan_status === 'DRIVER_ACKNOWLEDGED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {item.plan_status === 'NO_PLAN' ? 'PENDING ACTION' : item.plan_status}
                    </span>
                    <button
                      onClick={() => onViewImpact(item.id)}
                      className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center space-x-1"
                    >
                      <span>IMPACT ENGINE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fleet Operations Overview Sidebar */}
        <div className="command-card p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <h3 className="font-black text-base text-slate-900 font-display">FLEET TELEMETRY</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-slate-500 text-[10px] font-extrabold uppercase block">Fleet Active Units</span>
                  <span className="text-sm font-black text-slate-900">5 Delivery Vans</span>
                </div>
                <Truck className="w-5 h-5 text-orange-600" />
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-slate-500 text-[10px] font-extrabold uppercase block">Monitored Corridors</span>
                  <span className="text-sm font-black text-orange-600">5 High-Priority Routes</span>
                </div>
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-slate-500 text-[10px] font-extrabold uppercase block">Standby Dispatch Unit</span>
                  <span className="text-sm font-black text-emerald-700">V05 Express (Standby)</span>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-2xl text-xs space-y-1 text-orange-950">
              <p className="font-black flex items-center space-x-1 text-orange-900">
                <Zap className="w-3.5 h-3.5 text-orange-600" />
                <span>INTELLIGENCE ENGINE ACTIVE</span>
              </p>
              <p className="text-[11px] text-slate-600">
                Automated impact cascading & recovery scoring updated in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

