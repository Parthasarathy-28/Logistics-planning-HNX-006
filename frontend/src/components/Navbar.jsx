import React from 'react';
import { PlayCircle, RefreshCw, LogOut, Truck, ShieldAlert, Cpu, Activity } from 'lucide-react';

export default function Navbar({ currentUser, onLogout, onLoadDemo, onResetDemo, activePage, setActivePage }) {
  return (
    <header className="bg-white/95 backdrop-blur-xl text-slate-900 border-b border-slate-200 sticky top-0 z-50 shadow-sm relative">
      {/* Top Futuristic Accent Bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500" />
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Command System Header */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => {
            if (!currentUser) {
              setActivePage('login');
            } else if (currentUser.role === 'DRIVER') {
              setActivePage('driver-dashboard');
            } else {
              setActivePage('owner-dashboard');
            }
          }}
        >
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-2.5 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all border border-blue-400/30">
            <Truck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 font-display">
                ROUTERESCUE
              </span>
              <span className="inline-flex items-center space-x-1.5 text-[9px] uppercase font-bold tracking-widest bg-gradient-to-r from-blue-50 to-violet-50 text-violet-700 border border-violet-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>COMMAND CENTER</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Disruption-Aware Logistics Intelligence Platform</p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs (Owner vs Driver) */}
        {currentUser && (
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
            {currentUser.role === 'DRIVER' ? (
              <button
                onClick={() => setActivePage('driver-dashboard')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activePage === 'driver-dashboard'
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Driver Console
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActivePage('owner-dashboard')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePage === 'owner-dashboard'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Overview & Alerts
                </button>
                <button
                  onClick={() => setActivePage('impact-analysis')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePage === 'impact-analysis'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Impact Analysis
                </button>
                <button
                  onClick={() => setActivePage('recovery-decision')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePage === 'recovery-decision'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Recovery Engine
                </button>
                <button
                  onClick={() => setActivePage('simulation')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePage === 'simulation'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  What-If Simulation
                </button>
              </>
            )}
          </nav>
        )}

        {/* Demo Controls & Authenticated User Identity */}
        <div className="flex items-center space-x-3">
          {/* Hackathon Demo Controls */}
          <div className="flex items-center space-x-2 border-r border-slate-200 pr-3">
            <button
              onClick={onLoadDemo}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 border border-emerald-500/40"
              title="Pre-loads target Engine Issue scenario on Route R03"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Load Demo</span>
            </button>
            <button
              onClick={onResetDemo}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all"
              title="Resets database back to clean baseline state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* User Session Badge & Logout */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-xs font-bold rounded-full border shadow-2xs ${
                currentUser.role === 'DRIVER' 
                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                  : 'bg-gradient-to-r from-blue-50 to-violet-50 text-violet-800 border border-violet-200'
              }`}>
                {currentUser.role === 'DRIVER' 
                  ? `🚚 DRIVER (${(currentUser.name || 'DRIVER').toUpperCase()})` 
                  : `👔 OWNER (${(currentUser.name || 'OWNER').toUpperCase()})`}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-all"
                title="Log out of platform"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActivePage('login')}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Login
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
