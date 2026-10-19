import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  AlertCircle,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import logoUrl from '../assets/logo.svg';

export default function LoginPage({ onOpenDemoLab, onBackToLanding, onSuccess }) {
  const { login, authLoading, authError } = useAuth();

  const [email, setEmail] = useState('director.operations@smartcity.gov');
  const [password, setPassword] = useState('SmartCity@2026');
  const [department, setDepartment] = useState('admin');
  const [formError, setFormError] = useState('');

  const handleDepartmentChange = (e) => {
    const val = e.target.value;
    setDepartment(val);
    if (val === 'admin') setEmail('director.operations@smartcity.gov');
    else if (val === 'nodal_zone1') setEmail('nodal.zone1@lucknowsmartcity.gov');
    else if (val === 'nodal_zone4') setEmail('nodal.zone4@lucknowsmartcity.gov');
    else if (val === 'nodal_zone5') setEmail('nodal.zone5@lucknowsmartcity.gov');
    else if (val === 'nodal_zone6') setEmail('nodal.zone6@lucknowsmartcity.gov');
    else if (val === 'operator') setEmail('operator.dispatch@smartcity.gov');
    else if (val === 'technician') setEmail('technician.field@smartcity.gov');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please enter both municipal email and password.');
      return;
    }

    setFormError('');
    const res = await login({ email, password, role: department });
    if (res?.success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">

      {/* Top Municipal Navigation Bar */}
      <header className="border-b border-slate-800/80 px-6 sm:px-12 py-4 flex items-center justify-between z-10 backdrop-blur-md bg-[#0F172A]/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-glow-cyan border border-sky-500/40 flex items-center justify-center bg-slate-900 shrink-0">
            <img src={logoUrl} alt="LuminaAI Crest" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-white tracking-tight">
                Lumina<span className="text-sky-400">AI</span>
              </span>
              <span className="px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-full font-mono">
                Smart Cities Mission
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              National Directorate of Urban Local Bodies
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Gateway Online (SSL/TLS 1.3)</span>
          </div>

          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-xs text-slate-300 hover:text-white font-mono border border-slate-700 transition-colors shadow-sm"
            >
              &larr; Back to Home
            </button>
          )}
        </div>
      </header>

      {/* Main Login Canvas */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 z-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Official Municipal System Briefing */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2.5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>State Municipal Street Lighting Infrastructure</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Autonomous Adaptive Lighting Operations Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Centralized supervisory control and data acquisition for metropolitan smart street lighting fixtures across all arterial corridors.
              </p>
            </div>

            {/* Architecture Highlights */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3 text-xs">
                <Building2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">6 Municipal Arterial Corridors</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Continuous monitoring across Gateway, Civic Centre, Expressway, Innovation, Sports, and Logistics sectors.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3 text-xs">
                <Activity className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">AI-Powered Energy Conservation</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Proactive Ridge regression combined with radar surge control targeting 40% to 60% municipal energy bill reduction.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3 text-xs">
                <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Role-Based Access Control (RBAC)</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Segregated access for City Executive Management, Control Room Shift Operators, and Rapid Response Technicians.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Official Municipal Sign In Form */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-700/80 shadow-2xl relative">
              <div className="space-y-1.5 mb-6">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Officer Sign In</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Enter your assigned municipal email and security passcode
                </p>
              </div>

              {(formError || authError) && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError || authError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Department Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Department Authority
                  </label>
                  <select
                    value={department}
                    onChange={handleDepartmentChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="admin">City Executive (Municipal Commissioner & Director — All Lucknow)</option>
                    <option value="nodal_zone1">Nodal Officer: Zone 1 (Hazratganj — Er. Alok Srivastava)</option>
                    <option value="nodal_zone4">Nodal Officer: Zone 4 (Gomti Nagar & Shaheed Path — Er. Pradeep Mishra)</option>
                    <option value="nodal_zone5">Nodal Officer: Zone 5 (Alambagh — Er. Sunil Verma)</option>
                    <option value="nodal_zone6">Nodal Officer: Zone 6 (Chowk Heritage — Er. R.K. Pandey)</option>
                    <option value="operator">Integrated Command & Control Center (Lead Grid Dispatch Operator)</option>
                    <option value="technician">Rapid Response Field Maintenance Unit (Field Service Specialist)</option>
                  </select>
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Municipal Work Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer.name@smartcity.gov"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Security Passcode
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg transition-all disabled:opacity-50"
                >
                  {authLoading ? (
                    <span>Authenticating Officer...</span>
                  ) : (
                    <>
                      <span>Sign In to Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Audit Footer Notice */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Statutory Security & Compliance Policy</span>
                </div>
                <p className="leading-relaxed text-slate-400">
                  Authorized personnel only. All access, sessions, and telemetry commands are cryptographically signed and logged under the Information Technology Act 2000.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Official Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-3 text-center text-xs text-slate-400 z-10 bg-[#0F172A]/80">
        <p>
          Directorate of Urban Local Bodies • Smart Cities Mission
        </p>
      </footer>
    </div>
  );
}
