import React, { useState, useEffect } from 'react';
import VoiceReporter from '../components/VoiceReporter';
import { Truck, AlertTriangle, Send, CheckCircle2, ShieldAlert, Package, Navigation, Info, Mic, TouchpadIcon, FileText, Wrench, CloudRain, Flame, Radio } from 'lucide-react';
import { api } from '../services/api';

export default function DriverDashboard({ driverData, onReportSuccess, showToast }) {
  const [activeTab, setActiveTab] = useState('TAP'); // 'VOICE' | 'TAP' | 'TEXT'
  const [selectedCategory, setSelectedCategory] = useState('VEHICLE'); // 'VEHICLE' | 'NATURAL_DISASTER'
  const [textDescription, setTextDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dashboardState, setDashboardState] = useState(driverData || null);
  const [gpsStatus, setGpsStatus] = useState('WAITING'); // 'ACTIVE' | 'WAITING' | 'DENIED' | 'UNAVAILABLE' | 'UNSUPPORTED'
  const [coords, setCoords] = useState({ latitude: 12.9716, longitude: 77.5946, source: 'SIMULATED_GPS' });

  const activeDriverId = driverData?.driverId || driverData?.id;

  const fetchLatestState = async () => {
    try {
      const data = await api.getDriver(activeDriverId || 'DRV04');
      setDashboardState(data);
    } catch (err) {
      console.error('Failed to fetch driver state:', err);
    }
  };

  // Browser Geolocation API continuous watch
  useEffect(() => {
    fetchLatestState();
    const interval = setInterval(fetchLatestState, 3000);

    if (!navigator.geolocation) {
      setGpsStatus('UNSUPPORTED');
    } else {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy || 10;
          const speed = position.coords.speed !== null ? Math.round(position.coords.speed * 3.6) : 25; // m/s to km/h
          const heading = position.coords.heading || 90;

          setCoords({ latitude: lat, longitude: lng, source: 'LIVE_GPS' });
          setGpsStatus('ACTIVE');

          // Transmit live GPS coordinates to Node.js backend
          try {
            await api.updateLocation({
              vehicleId: driverData?.vehicleId || dashboardState?.driver?.current_vehicle_id || 'V04',
              driverId: activeDriverId || 'DRV04',
              latitude: lat,
              longitude: lng,
              accuracy,
              speed,
              heading,
              source: 'LIVE_GPS'
            });
          } catch (err) {
            console.warn('GPS location update send error:', err);
          }
        },
        (error) => {
          console.warn('Geolocation position error:', error.message);
          if (error.code === error.PERMISSION_DENIED) {
            setGpsStatus('DENIED');
          } else {
            setGpsStatus('UNAVAILABLE');
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );

      return () => {
        clearInterval(interval);
        navigator.geolocation.clearWatch(watchId);
      };
    }

    return () => clearInterval(interval);
  }, [activeDriverId]);

  const handleReport = async (inputMethod, category, type, description, voiceMeta = {}) => {
    setSubmitting(true);
    try {
      const activeVehicle = driverData?.vehicleId || dashboardState?.driver?.current_vehicle_id || 'V04';
      const activeRoute = voiceMeta.routeId || driverData?.routeId || dashboardState?.driver?.current_route_id || 'R03';

      const payload = {
        driver_id: activeDriverId || 'DRV04',
        driver_name: driverData?.name || dashboardState?.driver?.name || 'Driver',
        vehicle_id: activeVehicle,
        route_id: activeRoute,
        input_method: inputMethod,
        category: voiceMeta.category || category,
        type: voiceMeta.type || type,
        description: description || `${type} reported on route ${activeRoute}`,
        latitude: coords.latitude || 12.9716,
        longitude: coords.longitude || 77.5946,
        severity: (voiceMeta.type || type) === 'ENGINE_ISSUE' || (voiceMeta.type || type) === 'ACCIDENT' || (voiceMeta.type || type) === 'FLOOD' ? 'CRITICAL' : 'HIGH',
        language: voiceMeta.language || 'mixed',
        original_transcript: voiceMeta.originalTranscript || description,
        normalized_transcript: voiceMeta.normalizedTranscript || description,
        confidence: voiceMeta.confidence || null
      };

      const res = await api.createDisturbance(payload);
      showToast(`Disturbance reported successfully via ${inputMethod}!`, 'success');
      fetchLatestState();
      if (onReportSuccess) onReportSuccess(res.disturbance);
    } catch (err) {
      showToast(err.message || 'Failed to send report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!dashboardState?.activeRecoveryPlan) return;
    try {
      await api.acknowledgePlan(dashboardState.activeRecoveryPlan.id);
      showToast('Plan Acknowledged! Resuming navigation with updated dispatch.', 'success');
      fetchLatestState();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCompleteDelivery = async () => {
    try {
      await api.completeDelivery('D101');
      showToast('✓ Delivery Completed! Status updated.', 'success');
      fetchLatestState();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const vehicleButtons = [
    { label: 'Breakdown', type: 'BREAKDOWN', icon: '🔧' },
    { label: 'Flat Tyre', type: 'FLAT_TYRE', icon: '🛞' },
    { label: 'Engine Issue', type: 'ENGINE_ISSUE', icon: '⚠️' },
    { label: 'Accident', type: 'ACCIDENT', icon: '💥' },
    { label: 'Fuel Problem', type: 'FUEL_PROBLEM', icon: '⛽' }
  ];

  const disasterButtons = [
    { label: 'Heavy Rain', type: 'HEAVY_RAIN', icon: '🌧️' },
    { label: 'Flood', type: 'FLOOD', icon: '🌊' },
    { label: 'Cyclone', type: 'CYCLONE', icon: '🌀' },
    { label: 'Landslide', type: 'LANDSLIDE', icon: '⛰️' },
    { label: 'Earthquake', type: 'EARTHQUAKE', icon: '🌩️' },
    { label: 'Storm', type: 'STORM', icon: '⚡' }
  ];

  const plan = dashboardState?.activeRecoveryPlan;
  const disturbance = dashboardState?.activeDisturbance;

  const currentDriverName = driverData?.name || dashboardState?.driver?.name || 'Driver';
  const currentDriverId = driverData?.driverId || dashboardState?.driver?.id || 'DRV04';
  const currentVehicle = driverData?.vehicleId || dashboardState?.vehicle?.vehicle_code || dashboardState?.driver?.current_vehicle_id || 'V04';
  const currentRoute = dashboardState?.route ? `${dashboardState.route.route_code} (${dashboardState.route.name})` : (driverData?.routeId || 'R03');

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in text-slate-900">
      
      {/* DRIVER HEADER COMMAND CARD */}
      <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-md border border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center space-x-4 relative z-10">
          <div className="bg-blue-50 border border-blue-200 text-blue-600 p-4 rounded-2xl font-black text-xl flex items-center justify-center shadow-sm shrink-0">
            <Truck className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900 font-display">{currentDriverName} ({currentDriverId})</h1>
              <span className="inline-flex items-center space-x-1 text-[10px] bg-amber-50 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>ACTIVE SHIFT</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Assigned Vehicle: <span className="font-extrabold text-blue-600">{currentVehicle}</span> | Active Route: <span className="font-extrabold text-slate-900">{currentRoute}</span>
            </p>
          </div>
        </div>

        {/* GPS Coordinate Live Status Pill */}
        <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shrink-0 relative z-10 shadow-inner">
          <Navigation className={`w-5 h-5 ${gpsStatus === 'ACTIVE' ? 'text-emerald-600 animate-pulse' : 'text-amber-500'}`} />
          <div className="text-xs">
            <div className="flex items-center space-x-1.5">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                gpsStatus === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : gpsStatus === 'DENIED'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {gpsStatus === 'ACTIVE' ? 'LIVE GPS ● Tracking Active' : gpsStatus === 'DENIED' ? 'Location Permission Denied' : 'SIMULATED GPS'}
              </span>
            </div>
            <div className="font-mono text-slate-900 font-bold mt-1">
              {coords.latitude.toFixed(4)}° N, {coords.longitude.toFixed(4)}° E
            </div>
          </div>
        </div>
      </div>

      {/* INCOMING RECOVERY INSTRUCTION CARD (If Owner Sent Plan) */}
      {plan && (plan.status === 'SENT' || plan.status === 'APPROVED' || plan.status === 'DRIVER_ACKNOWLEDGED' || plan.status === 'IN_PROGRESS' || plan.status === 'COMPLETED') && (
        <div className="bg-emerald-50/90 text-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-lg space-y-4 rail-green">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600 text-white p-3 rounded-2xl font-black shadow-md">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                  INCOMING DISPATCH INSTRUCTION
                </span>
                <h3 className="text-xl font-black text-slate-900 font-display mt-1">Recovery Instruction Received</h3>
              </div>
            </div>
            <span className="text-xs font-black bg-emerald-600 text-white px-4 py-1.5 rounded-full uppercase tracking-wider self-start sm:self-auto shadow-sm">
              {plan.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-emerald-200 text-xs shadow-sm">
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">Original Plan</span>
              <p className="font-bold text-slate-900 mt-0.5">V04 → Shipment D101</p>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">New Reassigned Plan</span>
              <p className="font-black text-amber-700 mt-0.5">V05 → Shipment D101</p>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">Expected Delay Impact</span>
              <p className="font-extrabold text-emerald-700 mt-0.5">10 Minutes (38 min saved)</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl text-xs text-slate-700 border border-emerald-200 shadow-sm">
            <strong className="text-slate-900 font-extrabold">Ops Director Note:</strong> Reassigned critical delivery D101 to standby vehicle V05 at Hub North. Please proceed with remaining deliveries D102 and D103.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {plan.status === 'SENT' || plan.status === 'APPROVED' ? (
              <button
                onClick={handleAcknowledge}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-black rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 uppercase tracking-wider active:scale-95 border border-emerald-500"
              >
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                <span>ACKNOWLEDGE & CONTINUE</span>
              </button>
            ) : plan.status === 'DRIVER_ACKNOWLEDGED' || plan.status === 'IN_PROGRESS' ? (
              <button
                onClick={handleCompleteDelivery}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-black rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 uppercase tracking-wider active:scale-95 border border-blue-500"
              >
                <Package className="w-6 h-6 stroke-[2.5]" />
                <span>Mark Delivery Completed</span>
              </button>
            ) : (
              <div className="w-full py-3.5 bg-emerald-100 text-emerald-800 font-extrabold text-center rounded-2xl text-sm border border-emerald-300">
                ✓ Plan Executed & Delivery Completed
              </div>
            )}
          </div>
        </div>
      )}

      {/* DISRUPTION REPORTING MAIN COMMAND SECTION */}
      <div className="command-card p-6 lg:p-8 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              Driver Reporting Focus Area
            </span>
            <h2 className="text-2xl font-black text-slate-900 font-display mt-2">REPORT OPERATIONAL DISRUPTION</h2>
            <p className="text-xs text-slate-500 font-medium">Select a reporting method to notify the Operations Control Center</p>
          </div>

          {/* Reporting Method Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl self-start sm:self-auto border border-slate-200">
            <button
              onClick={() => setActiveTab('TAP')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'TAP' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>TAP INCIDENT</span>
            </button>

            <button
              onClick={() => setActiveTab('VOICE')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'VOICE' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>VOICE REPORT</span>
            </button>

            <button
              onClick={() => setActiveTab('TEXT')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'TEXT' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>TEXT INPUT</span>
            </button>
          </div>
        </div>

        {/* TAB 1: TAP REPORTING */}
        {activeTab === 'TAP' && (
          <div className="space-y-6 animate-fade-in">
            {/* Category Selector */}
            <div className="flex space-x-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setSelectedCategory('VEHICLE')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  selectedCategory === 'VEHICLE'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                🚚 Vehicle Issues
              </button>
              <button
                onClick={() => setSelectedCategory('NATURAL_DISASTER')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  selectedCategory === 'NATURAL_DISASTER'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                🌩️ Weather & Disasters
              </button>
            </div>

            {/* Tap Grid Options */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {(selectedCategory === 'VEHICLE' ? vehicleButtons : disasterButtons).map((btn) => (
                <button
                  key={btn.type}
                  disabled={submitting}
                  onClick={() => handleReport('TAP', selectedCategory, btn.type, `${btn.label} on route ${currentRoute}`)}
                  className="p-5 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-500 rounded-2xl text-center transition-all group flex flex-col items-center justify-center space-y-2 active:scale-95 disabled:opacity-50 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{btn.icon}</span>
                  <span className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: VOICE REPORTING */}
        {activeTab === 'VOICE' && (
          <div className="animate-fade-in">
            <VoiceReporter
              onReportSuccess={(dist) => {
                fetchLatestState();
                if (onReportSuccess) onReportSuccess(dist);
              }}
              showToast={showToast}
            />
          </div>
        )}

        {/* TAB 3: TEXT REPORTING */}
        {activeTab === 'TEXT' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Describe the Incident Details
              </label>
              <textarea
                rows={4}
                value={textDescription}
                onChange={(e) => setTextDescription(e.target.value)}
                placeholder="Enter description of disruption (e.g., Heavy traffic breakdown near Mile 18, delay expected)..."
                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400"
              />
              <button
                disabled={submitting || !textDescription.trim()}
                onClick={() => handleReport('TEXT', 'VEHICLE', 'ENGINE_ISSUE', textDescription)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 active:scale-95 border border-blue-600"
              >
                <Send className="w-4 h-4" />
                <span>SUBMIT TEXT DISRUPTION REPORT</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* RECENT DISTURBANCE REPORT SUMMARY CARD WITH STATUS RAIL */}
      {disturbance && (
        <div className={`command-card p-6 space-y-4 ${
          disturbance.severity === 'CRITICAL' ? 'rail-red' : 'rail-amber'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className={`w-5 h-5 ${disturbance.severity === 'CRITICAL' ? 'text-red-600' : 'text-amber-500'}`} />
              <h3 className="text-sm font-black text-slate-900 font-display uppercase tracking-wider">
                Last Reported Disturbance: #{disturbance.disturbance_code}
              </h3>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
              disturbance.severity === 'CRITICAL' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {disturbance.severity}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-4 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Reporter</span>
              <p className="font-extrabold text-slate-900 mt-0.5">{disturbance.driver_name}</p>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Incident Type</span>
              <p className="font-extrabold text-blue-600 mt-0.5">{disturbance.type}</p>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Input Method</span>
              <p className="font-extrabold text-slate-700 mt-0.5">{disturbance.input_method}</p>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Report Status</span>
              <p className="font-extrabold text-amber-700 mt-0.5">{disturbance.status}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
