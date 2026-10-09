import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, Navigation, AlertTriangle, Package, ShieldCheck, MapPin, Radio } from 'lucide-react';

// Custom Leaflet DivIcons using styled HTML/SVG badges
const createCustomIcon = (type, label, source = 'SIMULATED_GPS', status = 'ACTIVE') => {
  let bgColor = 'bg-emerald-600';
  let borderColor = 'border-emerald-400';
  let iconSymbol = '🚚';

  if (type === 'disruption') {
    bgColor = 'bg-red-600';
    borderColor = 'border-red-300';
    iconSymbol = '🚨';
  } else if (type === 'delivery') {
    bgColor = 'bg-amber-500';
    borderColor = 'border-amber-300';
    iconSymbol = '📦';
  } else if (status === 'DISRUPTED') {
    bgColor = 'bg-red-600';
    borderColor = 'border-red-400';
    iconSymbol = '⚠️';
  } else if (status === 'AVAILABLE' || label === 'V05') {
    bgColor = 'bg-blue-600';
    borderColor = 'border-blue-300';
    iconSymbol = '🅿️';
  }

  const html = `
    <div className="relative flex items-center justify-center">
      <div className="${bgColor} ${borderColor} text-white text-[11px] font-black px-2 py-1 rounded-full shadow-lg border-2 flex items-center space-x-1 tracking-tight">
        <span>${iconSymbol}</span>
        <span>${label}</span>
        ${source === 'LIVE_GPS' ? '<span className="w-2 h-2 bg-emerald-300 rounded-full animate-ping"></span>' : ''}
      </div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-leaflet-marker',
    iconSize: [80, 32],
    iconAnchor: [40, 16],
    popupAnchor: [0, -16]
  });
};

// Component to dynamically fit map bounds when vehicles update
function MapBoundsFitter({ vehicles = [] }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (vehicles.length > 0 && !hasFitted.current) {
      const bounds = L.latLngBounds(vehicles.map(v => [v.latitude, v.longitude]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      hasFitted.current = true;
    }
  }, [vehicles, map]);

  return null;
}

export default function FleetMap({ vehicles = [], disruptions = [], deliveries = [] }) {
  const defaultCenter = [12.9716, 77.5946]; // Default Bangalore hub coordinates

  // Count active live vs simulated GPS sources
  const liveCount = vehicles.filter(v => v.source === 'LIVE_GPS').length;
  const simCount = vehicles.filter(v => v.source !== 'LIVE_GPS').length;
  const activeDisruptionsCount = disruptions.length;

  // Polyline for Route R03 corridor visualization
  const routeR03Path = [
    [12.9250, 77.5890], // Hub South
    [12.9550, 77.5900], // Mile 10
    [12.9716, 77.5946], // Disruption Spot (Mile 18 / R03)
    [12.9800, 77.6000]  // Industrial Park B
  ];

  return (
    <div className="command-card p-6 space-y-4 text-slate-900">
      {/* Fleet Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-display font-bold text-slate-900">🗺️ LIVE FLEET & GEOGRAPHIC MAP</h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              OpenStreetMap Connected
            </span>
          </div>
          <p className="text-xs text-slate-700 font-medium">Real-time GPS vehicle tracking and interactive spatial disruption mapping</p>
        </div>

        {/* Compact Summary Metrics */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-600 text-[10px] font-bold block">Active Fleet</span>
            <span className="font-display font-bold text-slate-900">{vehicles.length} Vehicles</span>
          </div>
          <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-900 shadow-sm">
            <span className="text-emerald-700 text-[10px] font-bold block">Live GPS</span>
            <span className="font-display font-bold">{liveCount} Active</span>
          </div>
          <div className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 text-blue-900 shadow-sm">
            <span className="text-blue-700 text-[10px] font-bold block">Simulated GPS</span>
            <span className="font-display font-bold">{simCount} Fleet</span>
          </div>
          <div className="bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 text-red-900 shadow-sm">
            <span className="text-red-700 text-[10px] font-bold block">Disruptions</span>
            <span className="font-display font-bold">{activeDisruptionsCount} Active</span>
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <span className="text-slate-600 text-[10px] uppercase font-bold">Legend:</span>
        <div className="flex items-center space-x-1 text-emerald-700">
          <span>🟢 Active Vehicle</span>
        </div>
        <div className="flex items-center space-x-1 text-blue-700">
          <span>🔵 Standby Vehicle (V05)</span>
        </div>
        <div className="flex items-center space-x-1 text-red-700">
          <span>🔴 Active Disruption</span>
        </div>
        <div className="flex items-center space-x-1 text-amber-700">
          <span>📦 Affected Delivery (D101)</span>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <div className="h-[420px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={11}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapBoundsFitter vehicles={vehicles} />

          {/* Route R03 Corridor Line */}
          <Polyline
            positions={routeR03Path}
            pathOptions={{ color: '#f97316', weight: 4, dashArray: '6, 8', opacity: 0.8 }}
          />

          {/* Vehicle Markers */}
          {vehicles.map((v) => (
            <Marker
              key={v.vehicleId}
              position={[v.latitude, v.longitude]}
              icon={createCustomIcon('vehicle', v.vehicleCode, v.source, v.status)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2 space-y-1 text-xs">
                  <div className="flex items-center justify-between border-b pb-1 font-bold">
                    <span>Vehicle: {v.vehicleCode} ({v.vehicleNumber})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.source === 'LIVE_GPS' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {v.source === 'LIVE_GPS' ? 'LIVE GPS' : 'SIMULATED GPS'}
                    </span>
                  </div>
                  <div><strong className="text-slate-600">Driver:</strong> {v.driverName}</div>
                  <div><strong className="text-slate-600">Route:</strong> Route {v.routeId}</div>
                  <div><strong className="text-slate-600">Status:</strong> <span className={v.status === 'DISRUPTED' ? 'text-red-600 font-bold' : 'text-slate-800'}>{v.status}</span></div>
                  <div><strong className="text-slate-600">Coordinates:</strong> <span className="font-mono">{v.latitude.toFixed(4)}°, {v.longitude.toFixed(4)}°</span></div>
                  {v.speed !== null && v.speed !== undefined && (
                    <div><strong className="text-slate-600">Speed:</strong> {v.speed} km/h</div>
                  )}
                  <div className="text-[10px] text-slate-400 pt-1">
                    Last Updated: {new Date(v.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Disruption Markers */}
          {disruptions.map((d) => (
            <Marker
              key={d.id}
              position={[d.latitude || 12.9716, d.longitude || 77.5946]}
              icon={createCustomIcon('disruption', `🚨 ${d.type}`, 'LIVE_GPS', 'DISRUPTED')}
            >
              <Popup>
                <div className="p-2 space-y-1 text-xs">
                  <div className="font-extrabold text-red-600 border-b pb-1">
                    🚨 DISRUPTION REPORTED ({d.severity})
                  </div>
                  <div><strong>Type:</strong> {d.type}</div>
                  <div><strong>Route:</strong> Route {d.route_code || d.route_id}</div>
                  <div><strong>Vehicle:</strong> {d.vehicle_number || d.vehicle_id}</div>
                  <div><strong>Reported:</strong> {d.description}</div>
                  <div className="text-[10px] text-slate-500 pt-1">Timestamp: {d.timestamp}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Delivery Destination Markers */}
          {deliveries.filter(del => del.latitude && del.longitude).map((del) => (
            <Marker
              key={del.id}
              position={[del.latitude, del.longitude]}
              icon={createCustomIcon('delivery', del.delivery_code, 'SIMULATED_GPS')}
            >
              <Popup>
                <div className="p-2 space-y-1 text-xs">
                  <div className="font-extrabold text-amber-900 border-b pb-1">
                    📦 Shipment {del.delivery_code} ({del.priority})
                  </div>
                  <div><strong>Customer:</strong> {del.customer_name}</div>
                  <div><strong>Destination:</strong> {del.destination}</div>
                  <div><strong>Deadline:</strong> <span className="font-bold text-red-600">{del.deadline}</span></div>
                  <div><strong>Current ETA:</strong> {del.current_eta}</div>
                  <div><strong>Status:</strong> {del.status}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
