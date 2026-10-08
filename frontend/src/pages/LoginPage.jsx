import React from 'react';
import { Truck, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/30">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">ROUTERESCUE</h1>
          <p className="text-xs font-semibold text-slate-500">Disruption-Aware Logistics Decision Support System</p>
        </div>

        <div className="bg-slate-100 p-3 rounded-2xl text-center">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Hackathon Local Demo Login
          </span>
          <p className="text-[11px] text-slate-500">Select a pre-seeded role to test the complete workflow</p>
        </div>

        {/* Role Cards */}
        <div className="space-y-3">
          {/* Driver Login */}
          <button
            onClick={() => onLogin('DRIVER', 'driver')}
            className="w-full p-4 bg-white hover:bg-blue-50/50 border-2 border-slate-200 hover:border-blue-500 rounded-2xl text-left transition-all flex items-center space-x-4 group shadow-sm"
          >
            <div className="bg-amber-100 text-amber-700 p-3 rounded-xl group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900">DRIVER LOGIN</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                  Demo Account
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Alex Driver (Vehicle V04 • Route R03)</p>
            </div>
          </button>

          {/* Owner Login */}
          <button
            onClick={() => onLogin('OWNER', 'owner')}
            className="w-full p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-left transition-all flex items-center space-x-4 group shadow-md"
          >
            <div className="bg-blue-600 text-white p-3 rounded-xl group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-white">OPERATIONS OWNER LOGIN</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-400/30">
                  Demo Account
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">Sarah Jenkins (Ops Director Dashboard)</p>
            </div>
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-400 italic">
            Deterministic SQLite DB • REST APIs • Zero Cloud Dependencies
          </p>
        </div>
      </div>
    </div>
  );
}
