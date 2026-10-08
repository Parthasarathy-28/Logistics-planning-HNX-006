import React from 'react';
import { PlayCircle, RefreshCw, LogOut, Truck } from 'lucide-react';

export default function Navbar({ currentUser, onLogout, onLoadDemo, onResetDemo, activePage, setActivePage }) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div 
          className="flex items-center space-x-3 cursor-pointer" 
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
          <div className="bg-blue-600 p-2 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Truck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
                ROUTERESCUE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                Decision Support
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Disruption-Aware Logistics System</p>
          </div>
        </div>

        {/* Navigation Tabs (Owner vs Driver) */}
        {currentUser && (
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            {currentUser.role === 'DRIVER' ? (
              <button
                onClick={() => setActivePage('driver-dashboard')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activePage === 'driver-dashboard' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Driver Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActivePage('owner-dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activePage === 'owner-dashboard' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  Owner Alerts
                </button>
                <button
                  onClick={() => setActivePage('impact-analysis')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activePage === 'impact-analysis' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  Impact Analysis
                </button>
                <button
                  onClick={() => setActivePage('recovery-decision')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activePage === 'recovery-decision' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  Recovery Engine
                </button>
                <button
                  onClick={() => setActivePage('simulation')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activePage === 'simulation' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  What-If Simulation
                </button>
              </>
            )}
          </nav>
        )}

        {/* Demo Controls & Role Badge / Logout */}
        <div className="flex items-center space-x-3">
          {/* Hackathon Demo Action Buttons */}
          <div className="flex items-center space-x-2 border-r border-slate-700 pr-3">
            <button
              onClick={onLoadDemo}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              title="Pre-loads the target Engine Issue scenario on R03"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Load Demo</span>
            </button>
            <button
              onClick={onResetDemo}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition-all"
              title="Resets database back to clean baseline state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* User Session Info / Logout */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                currentUser.role === 'DRIVER' 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              }`}>
                {currentUser.role === 'DRIVER' 
                  ? `🚚 DRIVER (${currentUser.name || 'Alex'})` 
                  : `👔 OWNER (${currentUser.name || 'Sarah'})`}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-semibold rounded-lg transition-all"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActivePage('login')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
