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

const OWNER_PAGES = ['owner-dashboard', 'disturbance-details', 'impact-analysis', 'recovery-decision', 'simulation'];
const DRIVER_PAGES = ['driver-dashboard'];

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('routerescue_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activePage, setActivePage] = useState(() => {
    try {
      const saved = localStorage.getItem('routerescue_user');
      if (saved) {
        const user = JSON.parse(saved);
        return user.role === 'DRIVER' ? 'driver-dashboard' : 'owner-dashboard';
      }
    } catch {
      // ignore
    }
    return 'login';
  });

  const [selectedDisturbanceId, setSelectedDisturbanceId] = useState('DIST_DEMO_R03');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Enforce role route protection
  useEffect(() => {
    if (!currentUser) {
      if (activePage !== 'login') {
        setActivePage('login');
      }
      return;
    }

    if (currentUser.role === 'DRIVER' && OWNER_PAGES.includes(activePage)) {
      setActivePage('driver-dashboard');
      showToast('Access Denied: Drivers cannot access Owner Operations.', 'error');
    } else if (currentUser.role === 'OWNER' && DRIVER_PAGES.includes(activePage)) {
      setActivePage('owner-dashboard');
      showToast('Access Denied: Operations Owner cannot access Driver Portal.', 'error');
    }
  }, [currentUser, activePage]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('routerescue_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save session to localStorage:', e);
    }

    const targetPage = user.role === 'DRIVER' ? 'driver-dashboard' : 'owner-dashboard';
    setActivePage(targetPage);
    showToast(`✓ Logged in as ${user.name} (${user.role})`, 'success');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('routerescue_user');
    } catch (e) {
      console.error('Failed to clear session from localStorage:', e);
    }
    setCurrentUser(null);
    setActivePage('login');
    showToast('Logged out successfully.', 'info');
  };

  const handleLoadDemo = async () => {
    try {
      const res = await api.loadDemoScenario();
      if (res.disturbance) {
        setSelectedDisturbanceId(res.disturbance.id);
      }
      showToast('✓ Demo Scenario Loaded: Critical Engine Issue on Route R03 (Vehicle V04)!', 'success');
      if (currentUser) {
        setActivePage(currentUser.role === 'DRIVER' ? 'driver-dashboard' : 'owner-dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Failed to load demo scenario', 'error');
    }
  };

  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      showToast('✓ Database reset to clean baseline state.', 'info');
      if (currentUser) {
        setActivePage(currentUser.role === 'DRIVER' ? 'driver-dashboard' : 'owner-dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Failed to reset demo', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onLoadDemo={handleLoadDemo}
        onResetDemo={handleResetDemo}
        activePage={activePage}
        setActivePage={(page) => {
          if (!currentUser && page !== 'login') {
            setActivePage('login');
            showToast('Please log in to continue.', 'error');
            return;
          }
          if (currentUser?.role === 'DRIVER' && OWNER_PAGES.includes(page)) {
            showToast('Access Denied: Drivers cannot access Owner pages.', 'error');
            return;
          }
          if (currentUser?.role === 'OWNER' && DRIVER_PAGES.includes(page)) {
            showToast('Access Denied: Owners cannot access Driver pages.', 'error');
            return;
          }
          setActivePage(page);
        }}
      />

      {/* Main Page Container */}
      <main className="flex-1 pb-12">
        {!currentUser || activePage === 'login' ? (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            {activePage === 'driver-dashboard' && (
              <DriverDashboard
                driverData={currentUser}
                onReportSuccess={(disturbance) => {
                  setSelectedDisturbanceId(disturbance.id);
                  showToast('Report submitted! Disturbance registered in database.', 'success');
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
                  showToast('Plan Sent! Driver can now view and acknowledge.', 'success');
                }}
                showToast={showToast}
              />
            )}

            {activePage === 'simulation' && <SimulationPage showToast={showToast} />}
          </>
        )}
      </main>

      <footer className="bg-white text-slate-500 py-5 px-6 text-center text-xs border-t border-slate-200/80 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-slate-600">
            <span className="font-black text-slate-900 tracking-tight">ROUTERESCUE</span> — Disruption-Aware Logistics Decision Support System
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            React • Vite • Node.js • Express • SQLite • Leaflet GPS
          </p>
        </div>
      </footer>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
