import React, { useState, useEffect } from 'react';
import { Truck, ShieldCheck, Lock, User, AlertCircle, CheckCircle2, UserPlus, ArrowRight } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/30">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">ROUTERESCUE</h1>
          <p className="text-xs font-semibold text-slate-500">Disruption-Aware Logistics</p>
          <p className="text-[11px] text-slate-400 font-medium">Turn disruptions into intelligent recovery decisions.</p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs flex items-center space-x-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center space-x-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <span>LOGIN</span>
              )}
            </button>

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">Don't have an account?</p>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMsg(null);
                  setMode('REGISTER');
                }}
                className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>CREATE ACCOUNT</span>
              </button>
            </div>
          </form>
        )}

        {/* REGISTRATION FORM */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="bg-slate-100 p-2.5 rounded-xl text-center">
              <span className="text-xs font-black text-slate-800 tracking-wide">
                CREATE ROUTERESCUE ACCOUNT
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Gokul Sharma"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="e.g. gokul"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Select Account Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('OWNER')}
                  className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center space-x-2 transition-all ${
                    regRole === 'OWNER'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Owner</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('DRIVER')}
                  className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center space-x-2 transition-all ${
                    regRole === 'DRIVER'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Driver</span>
                </button>
              </div>
            </div>

            {/* Additional Driver Assignment Fields */}
            {regRole === 'DRIVER' && (
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3 animate-fade-in">
                <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                  Driver Logistics Assignment
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                      Vehicle
                    </label>
                    <select
                      value={regVehicleId}
                      onChange={(e) => setRegVehicleId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none"
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
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                      Route
                    </label>
                    <select
                      value={regRouteId}
                      onChange={(e) => setRegRouteId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none"
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
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? <span>Creating Account...</span> : <span>CREATE ACCOUNT</span>}
            </button>

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">Already have an account?</p>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMsg(null);
                  setMode('LOGIN');
                }}
                className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-900 underline"
              >
                <span>LOGIN</span>
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Login Area */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Demo Auto-Fill
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('owner', 'owner123')}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs text-left transition-all flex items-center space-x-2"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <div>
                <div className="font-bold text-[10px]">OWNER DEMO</div>
                <div className="text-[9px] text-slate-300">owner / owner123</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('driver01', 'driver123')}
              className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs text-left transition-all flex items-center space-x-2"
            >
              <Truck className="w-3.5 h-3.5 text-white shrink-0" />
              <div>
                <div className="font-bold text-[10px]">DRIVER DEMO</div>
                <div className="text-[9px] text-amber-100">driver01 / driver123</div>
              </div>
            </button>
          </div>
        </div>

        <div className="text-center pt-1">
          <p className="text-[10px] text-slate-400 italic">
            User Registration • Bcrypt Hashing • Custom Credentials • SQLite DB
          </p>
        </div>
      </div>
    </div>
  );
}
