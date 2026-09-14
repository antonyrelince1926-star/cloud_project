import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  User as UserIcon, 
  RotateCcw, 
  FastForward, 
  Lock, 
  LogIn, 
  LogOut,
  ChevronDown,
  Building2,
  FileCheck,
  Database
} from 'lucide-react';

interface HeaderProps {
  onOpenLogin: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogin, activeTab, setActiveTab }) => {
  const { 
    currentUser, 
    switchRole, 
    serverTime, 
    timeOffsetMinutes, 
    setSimulatedTimeOffset, 
    resetServerTime, 
    alerts,
    logout 
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [timeMenuOpen, setTimeMenuOpen] = useState(false);

  const activeCriticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).length;
  const isSecure = activeCriticalAlerts === 0;

  const roleLabels: Record<UserRole, { label: string; badgeBg: string }> = {
    ADMIN: { label: 'Examination Authority (Admin)', badgeBg: 'bg-[#222222] text-white' },
    QUESTION_SETTER: { label: 'Question Setter', badgeBg: 'bg-[#e95d2a] text-white' },
    REVIEWER: { label: 'Academic Reviewer', badgeBg: 'bg-[#4b5563] text-white' },
    EXAMINATION_CENTRE: { label: 'Examination Centre', badgeBg: 'bg-[#059669] text-white' },
  };

  const navItems = [
    { id: 'admin', label: 'Admin Security Center', icon: ShieldCheck, role: 'ADMIN' },
    { id: 'vault', label: 'Vault Integrity Dashboard', icon: Database, badge: 'RECHARTS' },
    { id: 'setter', label: 'Question Setter Studio', icon: FileCheck, role: 'QUESTION_SETTER' },
    { id: 'reviewer', label: 'Reviewer Portal', icon: UserIcon, role: 'REVIEWER' },
    { id: 'centre', label: 'Centre Release Station', icon: Building2, role: 'EXAMINATION_CENTRE' },
    { id: 'scenarios', label: 'Security Test Scenarios (1-7)', icon: Lock, badge: 'TESTS' },
    { id: 'audit', label: 'Audit Logs & SIEM', icon: ShieldAlert },
    { id: 'architecture', label: 'Architecture & Prisma', icon: ShieldCheck, badge: 'SPECS' },
  ];

  return (
    <header className="bg-white border-b border-[#e5e5ea] sticky top-0 z-40">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & System Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('admin')}>
            <div className="w-10 h-10 rounded-lg bg-[#222222] flex items-center justify-center text-white shadow-sm border border-[#333333]">
              <Lock className="w-5 h-5 text-[#e95d2a]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-[#222222]">
                  ZERO-TRUST <span className="text-[#e95d2a]">SPLIT-SEAL</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#f4f4f6] text-[#4b5563] border border-[#e5e5ea]">
                  PROTOTYPE
                </span>
              </div>
              <p className="text-xs text-[#6b7280] font-medium">
                Competitive Examination Question Paper Custody & Release System
              </p>
            </div>
          </div>

          {/* Center Info: System Status & Server Clock */}
          <div className="hidden md:flex items-center space-x-4">
            {/* System Status Pill */}
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isSecure 
                ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]' 
                : 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca] animate-pulse'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isSecure ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`}></span>
              <span>{isSecure ? 'SYSTEM STATUS: SECURE' : `ALERT: ${activeCriticalAlerts} INTEGRITY VIOLATIONS`}</span>
            </div>

            {/* Server Time Engine Display */}
            <div className="relative">
              <button 
                onClick={() => setTimeMenuOpen(!timeMenuOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-[#f4f4f6] text-xs font-mono font-medium text-[#222222] border border-[#e5e5ea] hover:bg-[#eaeaea] transition"
                title="Click to simulate fast-forward or rewind server time"
              >
                <Clock className="w-3.5 h-3.5 text-[#e95d2a]" />
                <span>SERVER TIME:</span>
                <span className="font-bold text-[#e95d2a]">
                  {serverTime.toLocaleTimeString()}
                </span>
                {timeOffsetMinutes !== 0 && (
                  <span className="text-[10px] px-1 rounded bg-[#e95d2a] text-white">
                    {timeOffsetMinutes > 0 ? `+${timeOffsetMinutes}m` : `${timeOffsetMinutes}m`}
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-[#6b7280]" />
              </button>

              {/* Server Time Simulation Menu */}
              {timeMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-[#e5e5ea] p-3 text-xs z-50">
                  <div className="font-bold text-[#222222] mb-1.5 flex items-center justify-between">
                    <span>Time-Lock Simulator</span>
                    <span className="font-mono text-[#6b7280] text-[10px]">Authoritative</span>
                  </div>
                  <p className="text-[11px] text-[#6b7280] mb-2.5 leading-snug">
                    Simulate future time to test the release engine when the examination release window opens.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    <button 
                      onClick={() => { setSimulatedTimeOffset(timeOffsetMinutes + 30); setTimeMenuOpen(false); }}
                      className="px-2 py-1.5 rounded bg-[#f4f4f6] hover:bg-[#e5e5ea] text-left font-medium text-[#222222] flex items-center space-x-1"
                    >
                      <FastForward className="w-3 h-3 text-[#e95d2a]" />
                      <span>+30 Mins</span>
                    </button>
                    <button 
                      onClick={() => { setSimulatedTimeOffset(timeOffsetMinutes + 120); setTimeMenuOpen(false); }}
                      className="px-2 py-1.5 rounded bg-[#f4f4f6] hover:bg-[#e5e5ea] text-left font-medium text-[#222222] flex items-center space-x-1"
                    >
                      <FastForward className="w-3 h-3 text-[#e95d2a]" />
                      <span>+2 Hours</span>
                    </button>
                    <button 
                      onClick={() => { setSimulatedTimeOffset(timeOffsetMinutes - 60); setTimeMenuOpen(false); }}
                      className="px-2 py-1.5 rounded bg-[#f4f4f6] hover:bg-[#e5e5ea] text-left font-medium text-[#222222] flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3 text-[#6b7280]" />
                      <span>-1 Hour</span>
                    </button>
                    <button 
                      onClick={() => { resetServerTime(); setTimeMenuOpen(false); }}
                      className="px-2 py-1.5 rounded bg-[#fef3ee] text-[#e95d2a] hover:bg-[#fde2d4] text-left font-bold flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Real-Time</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action: User & Role Switcher */}
          <div className="flex items-center space-x-3">
            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-[#e5e5ea] bg-white hover:bg-[#f4f4f6] transition text-left"
              >
                <div className="w-7 h-7 rounded-full bg-[#f4f4f6] flex items-center justify-center text-[#222222] font-bold text-xs border border-[#e5e5ea]">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-[#222222] leading-tight flex items-center space-x-1.5">
                    <span>{currentUser.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${roleLabels[currentUser.role]?.badgeBg || 'bg-gray-800 text-white'}`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#6b7280]">{currentUser.email}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#6b7280]" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-[#e5e5ea] p-2 text-xs z-50">
                  <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6b7280] border-b border-[#f4f4f6] mb-1">
                    Simulate Persona / Role:
                  </div>
                  
                  <button
                    onClick={() => { switchRole('ADMIN'); setRoleDropdownOpen(false); }}
                    className="w-full text-left px-2.5 py-2 rounded hover:bg-[#f4f4f6] flex items-start space-x-2.5 transition"
                  >
                    <div className="w-6 h-6 rounded bg-[#222222] text-white flex items-center justify-center text-xs font-bold mt-0.5">A</div>
                    <div>
                      <div className="font-bold text-[#222222]">Director Marcus Vance</div>
                      <div className="text-[11px] text-[#6b7280]">Role: ADMIN (Examination Authority)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { switchRole('QUESTION_SETTER'); setRoleDropdownOpen(false); }}
                    className="w-full text-left px-2.5 py-2 rounded hover:bg-[#f4f4f6] flex items-start space-x-2.5 transition"
                  >
                    <div className="w-6 h-6 rounded bg-[#e95d2a] text-white flex items-center justify-center text-xs font-bold mt-0.5">S</div>
                    <div>
                      <div className="font-bold text-[#222222]">Dr. Aris Thorne</div>
                      <div className="text-[11px] text-[#6b7280]">Role: QUESTION_SETTER</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { switchRole('REVIEWER'); setRoleDropdownOpen(false); }}
                    className="w-full text-left px-2.5 py-2 rounded hover:bg-[#f4f4f6] flex items-start space-x-2.5 transition"
                  >
                    <div className="w-6 h-6 rounded bg-[#4b5563] text-white flex items-center justify-center text-xs font-bold mt-0.5">R</div>
                    <div>
                      <div className="font-bold text-[#222222]">Prof. Elena Rostova</div>
                      <div className="text-[11px] text-[#6b7280]">Role: REVIEWER</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { switchRole('EXAMINATION_CENTRE', 'centre-101'); setRoleDropdownOpen(false); }}
                    className="w-full text-left px-2.5 py-2 rounded hover:bg-[#f4f4f6] flex items-start space-x-2.5 transition"
                  >
                    <div className="w-6 h-6 rounded bg-[#059669] text-white flex items-center justify-center text-xs font-bold mt-0.5">C1</div>
                    <div>
                      <div className="font-bold text-[#222222]">Officer J. Martinez</div>
                      <div className="text-[11px] text-[#6b7280]">Role: CENTRE 101 (Metropolis)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { switchRole('EXAMINATION_CENTRE', 'centre-102'); setRoleDropdownOpen(false); }}
                    className="w-full text-left px-2.5 py-2 rounded hover:bg-[#f4f4f6] flex items-start space-x-2.5 transition"
                  >
                    <div className="w-6 h-6 rounded bg-[#059669] text-white flex items-center justify-center text-xs font-bold mt-0.5">C2</div>
                    <div>
                      <div className="font-bold text-[#222222]">Officer T. Chen</div>
                      <div className="text-[11px] text-[#6b7280]">Role: CENTRE 102 (Capitol)</div>
                    </div>
                  </button>

                  <div className="border-t border-[#e5e5ea] pt-1.5 mt-1">
                    <button
                      onClick={() => { setRoleDropdownOpen(false); onOpenLogin(); }}
                      className="w-full text-left px-2 py-1.5 text-xs text-[#e95d2a] font-semibold hover:bg-[#fef3ee] rounded flex items-center space-x-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Test Login with Password & MFA</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Login / Auth Button */}
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 rounded-lg bg-[#222222] text-white text-xs font-semibold hover:bg-black transition flex items-center space-x-1.5 shadow-sm"
              title="Open MFA Login Demonstration"
            >
              <LogIn className="w-3.5 h-3.5 text-[#e95d2a]" />
              <span className="hidden sm:inline">MFA Auth</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Photofocus Style: Clean horizontal bar with subtle accent) */}
        <nav className="flex space-x-1 overflow-x-auto py-1 border-t border-[#f4f4f6]">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#e95d2a] text-white shadow-sm'
                    : 'text-[#4b5563] hover:text-[#222222] hover:bg-[#f4f4f6]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6b7280]'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider ${
                    isActive ? 'bg-black text-white' : 'bg-[#e95d2a] text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
