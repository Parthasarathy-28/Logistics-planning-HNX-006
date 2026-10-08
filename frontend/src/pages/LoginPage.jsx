import React, { useState, useEffect } from 'react';
import { Truck, ShieldCheck, Lock, User, AlertCircle, CheckCircle2, UserPlus, Navigation, Cpu, Activity, ArrowRight, Shield } from 'lucide-react';
import { api } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('LOGIN'); // 'LOGIN' | 'REGISTER'

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('OWNER'); // 'OWNER' | 'DRIVER'
  const [regVehicleId, setRegVehicleId] = useState('V05');
  const [regRouteId, setRegRouteId] = useState('R03');

  // Logistics dropdown options
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);

  // UI state
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch vehicles and routes for driver registration select dropdowns
  useEffect(() => {
    async function loadOptions() {
      try {
        const vRes = await api.getVehicles();
        if (vRes.success && vRes.vehicles) {
          setVehicles(vRes.vehicles);
          if (vRes.vehicles.length > 0) setRegVehicleId(vRes.vehicles[0].id);
        }
        const rRes = await api.getRoutes();
        if (rRes.success && rRes.routes) {
          setRoutes(rRes.routes);
          if (rRes.routes.length > 0) setRegRouteId(rRes.routes[0].id);
        }
      } catch (err) {
        console.error('Failed to load vehicle/route options:', err);
      }
    }
    loadOptions();
  }, []);

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!loginUsername.trim() || !loginPassword) {
      setError('Username and password are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(loginUsername.trim(), loginPassword);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Invalid username or password');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!regName.trim() || !regUsername.trim() || !regPassword || !regConfirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: regName.trim(),
        username: regUsername.trim(),
        password: regPassword,
        confirmPassword: regConfirmPassword,
        role: regRole,
        ...(regRole === 'DRIVER' ? { vehicleId: regVehicleId, routeId: regRouteId } : {})
      };

      const res = await api.register(payload);
      if (res.success) {
        setSuccessMsg('Account created successfully. Please log in.');
        setLoginUsername(regUsername.trim());
        setLoginPassword('');
        setRegPassword('');
        setRegConfirmPassword('');
        setMode('LOGIN');
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoUser, demoPass) => {
    setLoginUsername(demoUser);
    setLoginPassword(demoPass);
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await api.login(demoUser, demoPass);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Invalid username or password');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 lg:p-8 bg-white tech-grid-pattern relative overflow-hidden">
      {/* Ambient Radial Glass Backdrops */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl w-full glass-card-hero overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] relative z-10">
        
        {/* LEFT COLUMN: Premium Enterprise Command Hero Panel */}
        <div className="lg:col-span-6 bg-[#0F172A] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Background Decorative Mesh Graphics & Glowing Nodes */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center space-x-2.5 bg-slate-800/90 border border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span className="tracking-widest uppercase text-[10px]">Fleet Intelligence Operational</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl shadow-blue-500/30">
                <Truck className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white font-display">ROUTERESCUE</h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Enterprise Decision Support</p>
              </div>
            </div>
          </div>

          {/* Animated Route Network SVG Illustration */}
          <div className="relative z-10 my-4 py-2 flex items-center justify-center">
            <svg viewBox="0 0 400 160" className="w-full h-36 max-w-md text-blue-500">
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
              <rect width="400" height="160" fill="url(#grid)" opacity="0.4" />

              <path d="M 30 100 Q 120 40, 220 100 T 370 60" fill="none" stroke="#334155" strokeWidth="3" strokeDasharray="4,4" />
              <path d="M 30 100 Q 120 40, 220 100 T 370 60" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="200" strokeDashoffset="0" className="animate-pulse" />
              
              <path d="M 220 100 Q 280 140, 370 60" fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="6,4" />

              <circle cx="220" cy="100" r="12" fill="#ef4444" opacity="0.2" className="animate-ping" />
              <circle cx="220" cy="100" r="6" fill="#dc2626" />
              <text x="220" y="80" fill="#f87171" fontSize="10" fontWeight="bold" textAnchor="middle">🚨 DISRUPTION</text>

              <circle cx="120" cy="62" r="7" fill="#3b82f6" />
              <circle cx="120" cy="62" r="3" fill="#ffffff" />
              <text x="120" y="48" fill="#60a5fa" fontSize="9" fontWeight="bold" textAnchor="middle">🚚 V04 ACTIVE</text>

              <circle cx="280" cy="122" r="6" fill="#10b981" />
              <text x="280" y="142" fill="#34d399" fontSize="9" fontWeight="bold" textAnchor="middle">🅿️ V05 STANDBY</text>
            </svg>
          </div>

          {/* Hero Value Statement */}
          <div className="relative z-10 my-4 space-y-3">
            <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight font-display">
              Turn disruptions into <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-amber-300 bg-clip-text text-transparent">intelligent recovery decisions.</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Real-time multi-lingual disruption input, dynamic impact cascade analysis, automated recovery scoring, and live GIS vehicle tracking.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl flex items-start space-x-3">
                <Activity className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-extrabold text-white">Multi-Lingual Reporting</div>
                  <div className="text-[11px] text-slate-400 font-medium">Tamil, Tanglish & English Voice</div>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl flex items-start space-x-3">
                <Cpu className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-extrabold text-white">Scored Recovery Engine</div>
                  <div className="text-[11px] text-slate-400 font-medium">Automated SLA Risk Optimization</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-300 text-[11px]">Node.js REST • SQLite GIS • Leaflet Maps</span>
            </div>
            <span className="font-mono text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400">v2.4 Production</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Modern Form Control Area */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between bg-white text-slate-900">
          <div className="space-y-6">
            
            {/* Form Mode Toggle Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 font-display">
                  {mode === 'LOGIN' ? 'Sign In to Platform' : 'Create Account'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {mode === 'LOGIN' ? 'Enter credentials to access assigned role dashboard' : 'Register a new Owner or Driver profile'}
                </p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setError(null); setSuccessMsg(null); setMode('LOGIN'); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'LOGIN' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setError(null); setSuccessMsg(null); setMode('REGISTER'); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'REGISTER' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Success Notification Alert */}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs flex items-center space-x-2.5 animate-fade-in shadow-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-bold">{successMsg}</span>
              </div>
            )}

            {/* Error Notification Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl text-xs flex items-center space-x-2.5 animate-fade-in shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="font-bold">{error}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 tracking-wide active:scale-95 border border-blue-500"
                >
                  {loading ? <span>AUTHENTICATING...</span> : <span>SIGN IN TO ROUTERESCUE</span>}
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-slate-500">Need an account? </span>
                  <button
                    type="button"
                    onClick={() => { setError(null); setSuccessMsg(null); setMode('REGISTER'); }}
                    className="text-xs font-extrabold text-blue-600 hover:text-blue-700 underline"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}

            {/* REGISTRATION FORM */}
            {mode === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Partha Sharma"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                    Username
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. partha"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                      Password
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                {/* Role Selector Buttons */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('OWNER')}
                      className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center space-x-2 transition-all ${
                        regRole === 'OWNER'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <span>Operations Owner</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('DRIVER')}
                      className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center space-x-2 transition-all ${
                        regRole === 'DRIVER'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-amber-500" />
                      <span>Fleet Driver</span>
                    </button>
                  </div>
                </div>

                {/* Additional Driver Assignment Fields */}
                {regRole === 'DRIVER' && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2.5 animate-fade-in">
                    <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                      Driver Logistics Assignment
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">
                          Vehicle
                        </label>
                        <select
                          value={regVehicleId}
                          onChange={(e) => setRegVehicleId(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                        >
                          {vehicles.length > 0 ? (
                            vehicles.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.vehicle_code} ({v.type})
                              </option>
                            ))
                          ) : (
                            <option value="V04">V04 (Delivery Truck)</option>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">
                          Route
                        </label>
                        <select
                          value={regRouteId}
                          onChange={(e) => setRegRouteId(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                        >
                          {routes.length > 0 ? (
                            routes.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.route_code} - {r.name}
                              </option>
                            ))
                          ) : (
                            <option value="R03">R03 - Industrial South</option>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 tracking-wide active:scale-95 border border-emerald-600"
                >
                  {loading ? <span>CREATING ACCOUNT...</span> : <span>REGISTER ACCOUNT</span>}
                </button>
              </form>
            )}
          </div>

          {/* Hackathon Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="text-center">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                Hackathon Demo Quick Credentials
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('owner', 'owner123')}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs text-left transition-all flex items-center space-x-2.5 shadow-sm border border-slate-200"
              >
                <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="font-extrabold text-[11px] text-slate-900">OWNER DEMO</div>
                  <div className="text-[9px] text-slate-500 font-mono">owner / owner123</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('driver01', 'driver123')}
                className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs text-left transition-all flex items-center space-x-2.5 shadow-sm"
              >
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <div className="font-extrabold text-[11px] text-amber-900">DRIVER DEMO</div>
                  <div className="text-[9px] text-amber-700 font-mono">driver01 / driver123</div>
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
