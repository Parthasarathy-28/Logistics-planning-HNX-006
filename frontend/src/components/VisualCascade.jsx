import React from 'react';
import { AlertTriangle, MapPin, Truck, Package, ArrowDown, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';

export default function VisualCascade({ disturbance, routeCode = 'R03', vehicleCode = 'V04', deliveries = [] }) {
  const displayDisturbance = disturbance || {
    type: 'ENGINE ISSUE',
    description: 'Engine stopped near route R03 (Mile 18)',
    severity: 'CRITICAL',
    timestamp: '10:42 AM'
  };

  const sampleDeliveries = deliveries.length > 0 ? deliveries : [
    { code: 'D101', customer: 'Apex Tech Solutions', risk: 'CRITICAL', isCritical: true, deadline: '14:00', eta: '14:08 (Late)' },
    { code: 'D102', customer: 'Metro Logistics Hub', risk: 'HIGH', isCritical: false, deadline: '15:30', eta: '14:33 (OK)' },
    { code: 'D103', customer: 'Omni Retailers', risk: 'LOW', isCritical: false, deadline: '17:00', eta: '14:58 (OK)' }
  ];

  const criticalItem = sampleDeliveries.find(d => d.isCritical || d.risk === 'CRITICAL') || sampleDeliveries[0];

  return (
    <div className="command-card p-6 space-y-4 text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-display font-bold text-slate-900 flex items-center space-x-2">
            <span>Visual Disruption Cascade</span>
            <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold">Live Trace</span>
          </h3>
          <p className="text-xs text-slate-700 font-medium">Deterministic dependency chain mapping physical disturbance to deadline risks</p>
        </div>
      </div>

      {/* Vertical Cascade Chain */}
      <div className="flex flex-col items-center space-y-2 py-2">
        {/* Step 1: Disturbance */}
        <div className="w-full max-w-lg bg-red-50/60 border border-red-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between rail-red">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 text-white p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-red-700 uppercase">1. Disturbance Reported</span>
              <h4 className="text-sm font-bold text-slate-900">{displayDisturbance.type || 'ENGINE ISSUE'}</h4>
              <p className="text-xs text-red-800 font-medium">{displayDisturbance.description}</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-red-600 text-white px-2.5 py-1 rounded-md shadow-sm">
            {displayDisturbance.severity || 'CRITICAL'}
          </span>
        </div>

        <ArrowDown className="w-5 h-5 text-blue-500 animate-bounce" />

        {/* Step 2: Route */}
        <div className="w-full max-w-lg bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between rail-blue">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase">2. Affected Route</span>
              <h4 className="text-sm font-bold text-slate-900">Route {routeCode}</h4>
              <p className="text-xs text-slate-700 font-medium">Industrial Corridor South (Hub South → Industrial Park B)</p>
            </div>
          </div>
          <span className="text-xs font-mono bg-white text-slate-700 px-2 py-1 rounded border border-slate-200 font-bold">
            58 km Corridor
          </span>
        </div>

        <ArrowDown className="w-5 h-5 text-blue-500 animate-bounce" />

        {/* Step 3: Vehicle */}
        <div className="w-full max-w-lg bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between rail-blue">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-indigo-700 uppercase">3. Disrupted Vehicle</span>
              <h4 className="text-sm font-bold text-slate-900">Vehicle {vehicleCode}</h4>
              <p className="text-xs text-slate-700 font-medium">KA-04-ED-4004 (Driver: Alex Driver)</p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-amber-50 text-amber-800 px-2 py-1 rounded border border-amber-200">
            Engine Stopped
          </span>
        </div>

        <ArrowDown className="w-5 h-5 text-blue-500 animate-bounce" />

        {/* Step 4: Deliveries Grid */}
        <div className="w-full max-w-lg bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="text-[10px] font-bold tracking-wider text-slate-700 uppercase flex items-center space-x-1">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              <span>4. Affected Deliveries Cascade ({sampleDeliveries.length})</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {sampleDeliveries.map((item) => (
              <div 
                key={item.code} 
                className={`p-2 rounded-lg border text-center transition-all ${
                  item.isCritical || item.risk === 'CRITICAL'
                    ? 'bg-red-50 border-red-300 text-red-900 font-bold shadow-sm'
                    : item.risk === 'HIGH'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                }`}
              >
                <div className="flex items-center justify-center space-x-1 font-bold text-sm">
                  <span>{item.code}</span>
                  <span>
                    {item.isCritical || item.risk === 'CRITICAL' ? '🔴' : item.risk === 'HIGH' ? '🟡' : '🟢'}
                  </span>
                </div>
                <p className="text-[10px] truncate font-medium mt-0.5 text-slate-700">{item.customer}</p>
                <div className="text-[9px] mt-1 font-mono font-bold">
                  ETA: {item.eta || '14:08'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ArrowDown className="w-5 h-5 text-blue-500 animate-bounce" />

        {/* Step 5: Critical SLA Risk Warning */}
        <div className="w-full max-w-lg bg-amber-50/80 border border-amber-300 rounded-xl p-3.5 shadow-sm flex items-center space-x-3 rail-amber">
          <div className="bg-amber-500 text-slate-950 p-2.5 rounded-xl shadow">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">
                5. Deadline / SLA Risk Identified
              </span>
              <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                8 MIN OVERDUE
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">
              Delivery {criticalItem.code} ({criticalItem.customer || 'Apex Tech Solutions'}) At Risk!
            </h4>
            <p className="text-xs text-slate-700 font-medium">
              Deadline: <span className="font-bold text-slate-900">2:00 PM</span> | Calculated New ETA: <span className="font-bold text-red-600">2:08 PM</span> (+48 min delay overhead)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
