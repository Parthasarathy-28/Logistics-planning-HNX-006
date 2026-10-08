import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

import LoginPage from './pages/LoginPage';
import DriverDashboard from './pages/DriverDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import DisturbanceDetailsPage from './pages/DisturbanceDetailsPage';
import ImpactAnalysisPage from './pages/ImpactAnalysisPage';
import RecoveryDecisionPage from './pages/RecoveryDecisionPage';
import SimulationPage from './pages/SimulationPage';

import { api } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState({ role: 'DRIVER', name: 'Alex Driver' });
  const [activePage, setActivePage] = useState('driver-dashboard');
  const [selectedDisturbanceId, setSelectedDisturbanceId] = useState('DIST_DEMO_R03');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleLogin = (role, username) => {
    const name = role === 'DRIVER' ? 'Alex Driver' : 'Sarah Jenkins (Ops Director)';
    setCurrentUser({ role, name });
    setActivePage(role === 'DRIVER' ? 'driver-dashboard' : 'owner-dashboard');
    showToast(`Logged in as ${name}`, 'success');
  };

  const handleLoadDemo = async () => {
    try {
      const res = await api.loadDemoScenario();
      if (res.disturbance) {
        setSelectedDisturbanceId(res.disturbance.id);
      }
      showToast('✓ Demo Scenario Loaded: Critical Engine Issue on Route R03 (Vehicle V04)!', 'success');
      setActivePage(currentUser?.role === 'DRIVER' ? 'driver-dashboard' : 'owner-dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to load demo scenario', 'error');
    }
  };

  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      showToast('✓ Database reset to clean baseline state.', 'info');
      setActivePage(currentUser?.role === 'DRIVER' ? 'driver-dashboard' : 'owner-dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to reset demo', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onLoadDemo={handleLoadDemo}
        onResetDemo={handleResetDemo}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Main Page Container */}
      <main className="flex-1 pb-12">
        {activePage === 'login' && <LoginPage onLogin={handleLogin} />}

        {activePage === 'driver-dashboard' && (
          <DriverDashboard
            onReportSuccess={(disturbance) => {
              setSelectedDisturbanceId(disturbance.id);
              showToast('Report submitted! Switch to Owner view to inspect impact.', 'success');
            }}
            showToast={showToast}
          />
        )}

        {activePage === 'owner-dashboard' && (
          <OwnerDashboard
            onViewDetails={(id) => {
              setSelectedDisturbanceId(id);
              setActivePage('disturbance-details');
            }}
            onViewImpact={(id) => {
              setSelectedDisturbanceId(id);
              setActivePage('impact-analysis');
            }}
            showToast={showToast}
          />
        )}

        {activePage === 'disturbance-details' && (
          <DisturbanceDetailsPage
            disturbanceId={selectedDisturbanceId}
            onViewImpact={(id) => {
              setSelectedDisturbanceId(id);
              setActivePage('impact-analysis');
            }}
          />
        )}

        {activePage === 'impact-analysis' && (
          <ImpactAnalysisPage
            disturbanceId={selectedDisturbanceId}
            onGenerateRecovery={(id) => {
              setSelectedDisturbanceId(id);
              setActivePage('recovery-decision');
            }}
          />
        )}

        {activePage === 'recovery-decision' && (
          <RecoveryDecisionPage
            disturbanceId={selectedDisturbanceId}
            onSendSuccess={() => {
              showToast('Plan Sent! You can now switch to Driver view to acknowledge.', 'success');
            }}
            showToast={showToast}
          />
        )}

        {activePage === 'simulation' && <SimulationPage showToast={showToast} />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-4 px-6 text-center text-xs border-t border-slate-800">
        <p className="font-semibold">
          ROUTERESCUE — Disruption-Aware Logistics Decision Support System • React + Vite + Node.js + Express + SQLite
        </p>
      </footer>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
