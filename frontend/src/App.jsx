import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LightingProvider, useLighting } from './context/LightingContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PoleMap from './components/PoleMap';
import PoleTable from './components/PoleTable';
import Analytics from './pages/Analytics';
import Maintenance from './pages/Maintenance';
import Records from './pages/Records';
import AlertFeed from './components/AlertFeed';
import AiControlModal from './components/AiControlModal';
import DemoPage from './pages/DemoPage';
import { ArrowLeft, Lock, LogOut, ArrowRight, Shield } from 'lucide-react';

function getInitialRoute() {
  if (typeof window === 'undefined') return 'landing';
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (hash === 'console' || hash === 'dashboard') return 'console';
  if (hash === 'login') return 'login';
  if (hash === 'demo' || hash === 'simulation') return 'demo';
  // Default for root route '/' is always the Landing Page
  return 'landing';
}

function AppContent() {
  const { isAuthenticated, logout, user } = useAuth();
  const { activeTab } = useLighting();
  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);

  // Synchronize route with URL hash for seamless browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(getInitialRoute());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route) => {
    setCurrentRoute(route);
    if (route === 'landing') {
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname);
      }
    } else {
      window.location.hash = `#/${route}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
    navigateTo('landing');
  };

  // 1. Root / Landing Page View (Default on '/' route)
  if (currentRoute === 'landing') {
    return (
      <LandingPage
        onEnterConsole={() => navigateTo(isAuthenticated ? 'console' : 'login')}
        onOpenDemoLab={() => navigateTo('demo')}
        onLogout={handleLogout}
      />
    );
  }

  // 2. Official Officer Sign In Portal
  if (currentRoute === 'login') {
    if (isAuthenticated) {
      // If already logged in, enter console directly
      navigateTo('console');
      return null;
    }
    return (
      <LoginPage
        onBackToLanding={() => navigateTo('landing')}
        onOpenDemoLab={() => navigateTo('demo')}
        onSuccess={() => navigateTo('console')}
      />
    );
  }

  // 3. Isolated Simulation & Fault Lab
  if (currentRoute === 'demo') {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 p-4 sm:p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Top Simulation Lab Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <button
              onClick={() => navigateTo('landing')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono hover:text-white border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>

            <div className="flex items-center space-x-2">
              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={() => navigateTo('console')}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-semibold hover:from-sky-400 hover:to-indigo-500 flex items-center space-x-1.5 shadow-lg transition-all"
                  >
                    <span>Operations Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 hover:text-red-300 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigateTo('login')}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-semibold hover:from-sky-400 hover:to-indigo-500 flex items-center space-x-1.5 shadow-lg transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Officer Sign In</span>
                </button>
              )}
            </div>
          </div>

          <DemoPage />
        </div>
      </div>
    );
  }

  // 4. Authenticated Operations Console
  if (!isAuthenticated) {
    // If attempting to access console without active session, redirect to login
    return (
      <LoginPage
        onBackToLanding={() => navigateTo('landing')}
        onOpenDemoLab={() => navigateTo('demo')}
        onSuccess={() => navigateTo('console')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans overflow-x-hidden">
      <Header
        onGoToLanding={() => navigateTo('landing')}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 w-full overflow-hidden">
        <Sidebar
          onGoToLanding={() => navigateTo('landing')}
          onLogout={handleLogout}
        />
        <main className="flex-1 min-w-0 p-5 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-65px)]">
          <div className="max-w-7xl mx-auto space-y-6 pb-10">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'map' && <PoleMap />}
            {activeTab === 'poles' && <PoleTable />}
            {activeTab === 'maintenance' && <Maintenance />}
            {activeTab === 'records' && <Records />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'alerts' && <AlertFeed />}
            {activeTab === 'ai-settings' && <AiControlModal />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LightingProvider>
        <AppContent />
      </LightingProvider>
    </AuthProvider>
  );
}
