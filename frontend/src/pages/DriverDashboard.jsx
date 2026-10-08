import React, { useState, useEffect } from 'react';
import VoiceReporter from '../components/VoiceReporter';
import { Truck, AlertTriangle, Send, CheckCircle2, ShieldAlert, Package, Navigation, Info } from 'lucide-react';
import { api } from '../services/api';

export default function DriverDashboard({ driverData, onReportSuccess, showToast }) {
  const [activeTab, setActiveTab] = useState('TAP'); // 'VOICE' | 'TAP' | 'TEXT'
  const [selectedCategory, setSelectedCategory] = useState('VEHICLE'); // 'VEHICLE' | 'NATURAL_DISASTER'
  const [textDescription, setTextDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dashboardState, setDashboardState] = useState(driverData || null);
  const [gpsStatus, setGpsStatus] = useState('WAITING'); // 'ACTIVE' | 'WAITING' | 'DENIED' | 'UNAVAILABLE' | 'UNSUPPORTED'
  const [coords, setCoords] = useState({ latitude: 12.9716, longitude: 77.5946, source: 'SIMULATED_GPS' });

  const fetchLatestState = async () => {
    try {
      const data = await api.getDriver('DRV04');
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
              vehicleId: 'V04',
              driverId: 'DRV04',
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
  }, []);

  const handleReport = async (inputMethod, category, type, description, voiceMeta = {}) => {
    setSubmitting(true);
    try {
      const payload = {
        driver_id: 'DRV04',
        vehicle_id: 'V04',
        route_id: voiceMeta.routeId || 'R03',
        input_method: inputMethod,
        category: voiceMeta.category || category,
        type: voiceMeta.type || type,
        description: description || `${type} reported on route R03`,
        latitude: 12.9716,
        longitude: 77.5946,
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Driver Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-amber-500 text-slate-950 p-4 rounded-2xl font-black text-xl flex items-center justify-center">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-white">Alex Driver (DRV04)</h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                ACTIVE SHIFT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Assigned Vehicle: <span className="font-bold text-white">V04</span> | Active Route: <span className="font-bold text-white">R03 (Industrial Corridor)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700">
          <Navigation className={`w-5 h-5 ${gpsStatus === 'ACTIVE' ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
          <div className="text-xs">
            <div className="flex items-center space-x-1.5">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                gpsStatus === 'ACTIVE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : gpsStatus === 'DENIED'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {gpsStatus === 'ACTIVE' ? 'LIVE GPS ● Tracking Active' : gpsStatus === 'DENIED' ? 'Location permission required for live tracking' : 'SIMULATED GPS'}
              </span>
            </div>
            <div className="font-mono text-slate-200 font-bold mt-1">
              {coords.latitude.toFixed(4)}° N, {coords.longitude.toFixed(4)}° E
            </div>
          </div>
        </div>
      </div>

      {/* Incoming New Recovery Plan Alert Banner (If Owner Sent Plan) */}
      {plan && (plan.status === 'SENT' || plan.status === 'APPROVED' || plan.status === 'DRIVER_ACKNOWLEDGED' || plan.status === 'IN_PROGRESS' || plan.status === 'COMPLETED') && (
        <div className="bg-emerald-900 text-white rounded-2xl p-6 border-2 border-emerald-500 shadow-xl space-y-4 pulse-red">
          <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-500 text-slate-950 p-2.5 rounded-xl font-black">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700">
                  INCOMING NEW DELIVERY PLAN
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">Recovery Instruction Received</h3>
              </div>
            </div>
            <span className="text-xs font-bold bg-emerald-500 text-slate-950 px-3 py-1 rounded-full uppercase">
              {plan.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-emerald-950/70 p-4 rounded-xl border border-emerald-800 text-xs">
            <div>
              <span className="text-emerald-400 font-bold block text-[10px] uppercase">Original Plan</span>
              <p className="font-semibold text-white mt-0.5">V04 → Shipment D101</p>
            </div>
            <div>
              <span className="text-emerald-400 font-bold block text-[10px] uppercase">New Reassigned Plan</span>
              <p className="font-extrabold text-amber-300 mt-0.5">V05 → Shipment D101</p>
            </div>
            <div>
              <span className="text-emerald-400 font-bold block text-[10px] uppercase">Expected Delay Impact</span>
              <p className="font-bold text-white mt-0.5">10 Minutes (38 min saved)</p>
            </div>
          </div>

          <div className="bg-emerald-950/50 p-3 rounded-lg text-xs text-emerald-200 border border-emerald-800">
            <strong className="text-white">Ops Director Note:</strong> Reassigned critical delivery D101 to standby vehicle V05 at Hub North. Please proceed with remaining deliveries D102 and D103.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {plan.status === 'SENT' || plan.status === 'APPROVED' ? (
              <button
                onClick={handleAcknowledge}
                className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-base font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 uppercase tracking-wide"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>ACKNOWLEDGE & CONTINUE</span>
              </button>
            ) : plan.status === 'DRIVER_ACKNOWLEDGED' || plan.status === 'IN_PROGRESS' ? (
              <button
                onClick={handleCompleteDelivery}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white text-base font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 uppercase tracking-wide"
              >
                <Package className="w-6 h-6" />
                <span>Mark Delivery Completed</span>
              </button>
            ) : (
              <div className="w-full py-3 bg-emerald-800 text-emerald-100 font-extrabold text-center rounded-xl text-sm border border-emerald-600">
                ✓ DELIVERY COMPLETED & RECOVERY LIFECYCLE CLOSED
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Report Disturbance Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600 bg-red-100 px-3 py-1 rounded-full">
            Driver Emergency reporting
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">REPORT DISTURBANCE</h2>
          <p className="text-xs text-slate-500 font-medium">
            Fast, high-readability driver interface. Select Voice, Tap, or Text below.
          </p>
        </div>

        {/* 3 Report Mode Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('TAP')}
            className={`py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'TAP' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👆 TAP</span>
          </button>

          <button
            onClick={() => setActiveTab('VOICE')}
            className={`py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'VOICE' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎙 VOICE</span>
          </button>

          <button
            onClick={() => setActiveTab('TEXT')}
            className={`py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'TEXT' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>⌨ TEXT</span>
          </button>
        </div>

        {/* TAB 1: TAP INTERFACE (Large Driver-Friendly Buttons) */}
        {activeTab === 'TAP' && (
          <div className="space-y-5">
            {/* Category Selector */}
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedCategory('VEHICLE')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                  selectedCategory === 'VEHICLE'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                🚚 Vehicle Disturbance
              </button>
              <button
                onClick={() => setSelectedCategory('NATURAL_DISASTER')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                  selectedCategory === 'NATURAL_DISASTER'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                🌩️ Natural Disaster
              </button>
            </div>

            {/* Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(selectedCategory === 'VEHICLE' ? vehicleButtons : disasterButtons).map((item) => (
                <button
                  key={item.type}
                  disabled={submitting}
                  onClick={() => handleReport('TAP', selectedCategory, item.type, `${item.label} reported on route R03`)}
                  className="p-5 bg-slate-50 hover:bg-red-50 border-2 border-slate-200 hover:border-red-500 rounded-2xl text-center transition-all group shadow-sm flex flex-col items-center justify-center space-y-2"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="font-extrabold text-sm text-slate-900 group-hover:text-red-700">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: VOICE INTERFACE */}
        {activeTab === 'VOICE' && (
          <VoiceReporter
            onConfirmVoiceReport={(voiceData) =>
              handleReport('VOICE', voiceData.category, voiceData.type, voiceData.description, voiceData)
            }
          />
        )}

        {/* TAB 3: TEXT INTERFACE */}
        {activeTab === 'TEXT' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Describe the problem
              </label>
              <textarea
                rows={3}
                value={textDescription}
                onChange={(e) => setTextDescription(e.target.value)}
                placeholder="Example: Engine stopped near route R03 (Mile 18)..."
                className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
              />
            </div>
            <button
              disabled={submitting || !textDescription.trim()}
              onClick={() => handleReport('TEXT', 'VEHICLE', 'ENGINE_ISSUE', textDescription)}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Send Report</span>
            </button>
          </div>
        )}
      </div>

      {/* Active Disturbance Report Status */}
      {disturbance && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Active Report Status: #{disturbance.disturbance_code}</h3>
            </div>
            <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
              {disturbance.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-[10px] block font-bold">Input Method</span>
              <span className="font-extrabold text-blue-400">{disturbance.input_method}</span>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-[10px] block font-bold">Category & Type</span>
              <span className="font-bold text-slate-200">{disturbance.category} • {disturbance.type}</span>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-[10px] block font-bold">Severity</span>
              <span className="font-extrabold text-red-400">{disturbance.severity}</span>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-[10px] block font-bold">Time Captured</span>
              <span className="font-bold text-slate-200">{disturbance.timestamp}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
