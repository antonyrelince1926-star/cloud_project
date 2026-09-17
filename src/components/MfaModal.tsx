import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Key, Lock, AlertCircle, CheckCircle, X, Terminal } from 'lucide-react';

interface MfaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MfaModal: React.FC<MfaModalProps> = ({ isOpen, onClose }) => {
  const { 
    loginWithPassword, 
    verifyOtp, 
    isMfaPending, 
    mfaPendingEmail, 
    demoOtp, 
    isAccountLocked,
    currentUser 
  } = useApp();

  const [email, setEmail] = useState('admin@exam-sec.gov.in');
  const [password, setPassword] = useState('password123');
  const [otpInput, setOtpInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const res = loginWithPassword(email, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Authentication failed');
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = verifyOtp(mfaPendingEmail || email, otpInput);
    if (!res.success) {
      setErrorMessage(res.error || 'MFA validation failed');
    } else {
      setSuccessMessage('MFA Verified! JWT Access & Refresh tokens generated.');
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-[#e5e5ea] w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#222222] text-white px-6 py-4 flex items-center justify-between border-b border-[#333333]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e95d2a] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Zero-Trust Authentication Gateway</h3>
              <p className="text-[11px] text-[#9ca3af]">MFA-Enforced Zero-Trust Security Protocol</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#9ca3af] hover:text-white transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Quick Credential Pre-fill Bar */}
          <div className="mb-4 bg-[#f4f4f6] p-2.5 rounded-lg border border-[#e5e5ea] text-xs">
            <div className="font-bold text-[#222222] mb-1">Quick Select Demo Account:</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button 
                type="button"
                onClick={() => { setEmail('admin@exam-sec.gov.in'); setPassword('password123'); }}
                className="px-2 py-1 bg-white hover:bg-[#e95d2a] hover:text-white rounded border border-[#e5e5ea] text-[11px] text-left transition font-medium"
              >
                Admin (Controller)
              </button>
              <button 
                type="button"
                onClick={() => { setEmail('exam-authority@exam-sec.gov.in'); setPassword('password123'); }}
                className="px-2 py-1 bg-white hover:bg-[#1e40af] hover:text-white rounded border border-[#e5e5ea] text-[11px] text-left transition font-medium"
              >
                Exam Authority General
              </button>
              <button 
                type="button"
                onClick={() => { setEmail('cso@exam-sec.gov.in'); setPassword('password123'); }}
                className="px-2 py-1 bg-white hover:bg-[#991b1b] hover:text-white rounded border border-[#e5e5ea] text-[11px] text-left transition font-medium"
              >
                Cyber Security Officer
              </button>
              <button 
                type="button"
                onClick={() => { setEmail('escrow@exam-sec.gov.in'); setPassword('password123'); }}
                className="px-2 py-1 bg-white hover:bg-[#6b21a8] hover:text-white rounded border border-[#e5e5ea] text-[11px] text-left transition font-medium"
              >
                Backup Escrow Custodian
              </button>
              <button 
                type="button"
                onClick={() => { setEmail('reviewer@exam-sec.gov.in'); setPassword('password123'); }}
                className="px-2 py-1 bg-white hover:bg-[#4b5563] hover:text-white rounded border border-[#e5e5ea] text-[11px] text-left transition font-medium"
              >
                Academic Reviewer
              </button>
              <button 
                type="button"
                onClick={() => { setEmail('setter@exam-sec.gov.in'); setPassword('password123'); }}
                className="px-2 py-1 bg-white hover:bg-[#e95d2a] hover:text-white rounded border border-[#e5e5ea] text-[11px] text-left transition font-medium"
              >
                Question Setter
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {!isMfaPending ? (
            /* STEP 1: PASSWORD AUTH */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">
                  User Email / Government Identity ID
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e5ea] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#e95d2a] focus:border-transparent"
                  placeholder="name@exam-sec.gov.in"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#222222]">Master Password</label>
                  <span className="text-[10px] text-[#6b7280]">bcrypt Hash Protected</span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e5ea] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#e95d2a] focus:border-transparent"
                  placeholder="••••••••••••"
                />
                <p className="text-[10px] text-[#6b7280] mt-1">
                  * Tip: Enter less than 6 chars to test failed attempts and the 3-attempt account lockout trigger.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#e95d2a] hover:bg-[#d44c1b] text-white font-bold text-xs transition shadow-sm flex items-center justify-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>Verify Credentials & Request MFA OTP</span>
              </button>
            </form>
          ) : (
            /* STEP 2: MFA OTP VERIFICATION */
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="p-3 bg-[#fef3ee] rounded-lg border border-[#fde2d4]">
                <div className="flex items-center justify-between text-xs font-bold text-[#e95d2a] mb-1">
                  <span className="flex items-center space-x-1">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>DEMO MODE: Secure Random OTP Generated</span>
                  </span>
                </div>
                <div className="font-mono text-xl font-extrabold tracking-widest text-[#222222] bg-white p-2 rounded border border-[#e5e5ea] text-center">
                  {demoOtp || '------'}
                </div>
                <p className="text-[10px] text-[#6b7280] mt-1.5">
                  Generated via cryptographically secure random bytes on backend. In production, sent via Hardware Token / FIDO2 / Secure SMS.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">
                  Enter 6-Digit One-Time Password (OTP)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-widest font-mono text-lg py-2 border border-[#e5e5ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e95d2a]"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => { setEmail(''); setOtpInput(''); }}
                  className="w-1/3 py-2 rounded-lg bg-[#f4f4f6] text-[#4b5563] text-xs font-semibold hover:bg-[#e5e5ea]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 rounded-lg bg-[#e95d2a] hover:bg-[#d44c1b] text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-sm"
                >
                  <Key className="w-4 h-4" />
                  <span>Verify OTP & Sign In</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#f4f4f6] px-6 py-3 border-t border-[#e5e5ea] text-[11px] text-[#6b7280] flex items-center justify-between">
          <span>Active Identity: <strong>{currentUser.name}</strong></span>
          <span className="font-mono">{currentUser.role}</span>
        </div>

      </div>
    </div>
  );
};
