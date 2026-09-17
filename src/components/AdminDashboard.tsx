import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { QuestionPaper } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  Database, 
  Key, 
  Check, 
  X, 
  Layers, 
  Award,
  Fingerprint,
  ExternalLink,
  Info
} from 'lucide-react';

export const AdminDashboard: React.FC<{ 
  onNavigateToRelease?: () => void;
  onNavigateToVault?: () => void;
  onNavigateToArchitecture?: () => void;
}> = ({ onNavigateToVault, onNavigateToArchitecture }) => {
  const { 
    currentUser, 
    papers, 
    examinations, 
    alerts, 
    auditLogs, 
    releaseRecords, 
    authorityApprove, 
    toggleThresholdShare, 
    sealPaper, 
    serverTime,
    switchRole
  } = useApp();

  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const selectedPaperForApproval = papers.find(p => p.id === selectedPaperId) || null;
  const [sealingInProgress, setSealingInProgress] = useState(false);
  const [sealFeedback, setSealFeedback] = useState<string | null>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPaperId(null);
      }
    };
    if (selectedPaperId) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedPaperId]);

  // Metrics
  const totalPapers = papers.length;
  const pendingReview = papers.filter(p => p.status === 'UNDER_REVIEW' || p.status === 'SUBMITTED').length;
  const sealedCount = papers.filter(p => p.sealed).length;
  const releasedCount = papers.filter(p => p.status === 'RELEASED').length;
  const activeAlertsCount = alerts.filter(a => !a.resolved).length;
  const criticalViolationsCount = auditLogs.filter(l => l.severity === 'CRITICAL').length;
  const earlyAttemptsCount = auditLogs.filter(l => l.action === 'EARLY_RELEASE_ATTEMPT').length;

  const isSecure = activeAlertsCount === 0 && criticalViolationsCount === 0;

  const handleSealClick = async (paper: QuestionPaper) => {
    setSealingInProgress(true);
    setSealFeedback(null);
    try {
      const ok = await sealPaper(paper.id);
      if (ok) {
        setSealFeedback('Paper successfully sealed with cryptographic SHA-256 fingerprint and Ed25519/RSA digital signature.');
        setTimeout(() => setSelectedPaperId(null), 1500);
      } else {
        setSealFeedback('Sealing rejected: Requires minimum 3 of 5 authorized custodian threshold signatures.');
      }
    } catch (err: any) {
      setSealFeedback(`Error: ${err.message}`);
    } finally {
      setSealingInProgress(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner with System Security Status */}
      <div className="bg-white rounded-xl p-6 border border-[#e5e5ea] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-xl font-extrabold tracking-tight text-[#222222]">
              Examination Authority Security & Governance Center
            </h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isSecure ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]' : 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-1.5 ${isSecure ? 'bg-[#10b981]' : 'bg-[#ef4444] animate-pulse'}`}></span>
              {isSecure ? 'SYSTEM STATUS: SECURE' : 'CRITICAL SECURITY ANOMALY'}
            </span>
          </div>
          <p className="text-xs text-[#6b7280]">
            Zero-Trust Split-Seal Central Oversight • AES-256-GCM Fragment Integrity • 3-of-5 Threshold Key Custody
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onNavigateToArchitecture && (
            <button
              onClick={onNavigateToArchitecture}
              className="px-3 py-2 rounded-lg bg-white hover:bg-[#f4f4f6] text-[#222222] border border-[#e5e5ea] text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
            >
              <Layers className="w-3.5 h-3.5 text-[#e95d2a]" />
              <span>Architecture & Methodology</span>
            </button>
          )}
          {onNavigateToVault && (
            <button
              onClick={onNavigateToVault}
              className="px-3 py-2 rounded-lg bg-[#222222] hover:bg-black text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
            >
              <Database className="w-3.5 h-3.5 text-[#e95d2a]" />
              <span>Vault Integrity Dashboard</span>
            </button>
          )}
          <div className="bg-[#f4f4f6] px-3 py-2 rounded-lg border border-[#e5e5ea] text-xs">
            <div className="text-[10px] text-[#6b7280] font-semibold">Authoritative Server Time</div>
            <div className="font-mono font-bold text-[#222222]">{serverTime.toLocaleTimeString()} UTC</div>
          </div>
        </div>
      </div>

      {/* Methodology & Main Idea Fast Callout */}
      <div className="p-3.5 bg-[#222222] text-white rounded-xl border border-[#333333] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-[#333333] text-[#e95d2a] flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-white">Main Idea:</span>
              <span className="text-[#f9fafb]">“No single point of compromise can reveal the complete question paper.”</span>
            </div>
            <span className="text-[11px] text-[#9ca3af] block mt-0.5">
              10-Step Lifecycle: Secure Creation → AES-256 → Split Fragmentation → Threshold Secret Sharing → Multi-Level Approval → Digital Seal → SIEM Monitoring → Time-Lock → Controlled Release → Permanent Audit.
            </span>
          </div>
        </div>

        {onNavigateToArchitecture && (
          <button
            onClick={onNavigateToArchitecture}
            className="px-3 py-1.5 rounded-lg bg-[#e95d2a] hover:bg-[#d44c1b] text-white font-bold text-xs shrink-0 transition flex items-center space-x-1"
          >
            <span>View Flow & Specs</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#e5e5ea] shadow-xs">
          <div className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1">Total Papers</div>
          <div className="text-2xl font-black text-[#222222]">{totalPapers}</div>
          <div className="text-[10px] text-[#6b7280] mt-1">Under custody</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e5e5ea] shadow-xs">
          <div className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1">Pending Review</div>
          <div className="text-2xl font-black text-[#e95d2a]">{pendingReview}</div>
          <div className="text-[10px] text-[#6b7280] mt-1">Awaiting reviewer</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e5e5ea] shadow-xs">
          <div className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1">Sealed & Locked</div>
          <div className="text-2xl font-black text-[#222222] flex items-center">
            <span>{sealedCount}</span>
            <Lock className="w-4 h-4 ml-1.5 text-[#e95d2a]" />
          </div>
          <div className="text-[10px] text-[#6b7280] mt-1">Immutable time-lock</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e5e5ea] shadow-xs">
          <div className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1">Released Papers</div>
          <div className="text-2xl font-black text-[#059669]">{releasedCount}</div>
          <div className="text-[10px] text-[#6b7280] mt-1">Verified delivery</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e5e5ea] shadow-xs">
          <div className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1">Early Access Hits</div>
          <div className={`text-2xl font-black ${earlyAttemptsCount > 0 ? 'text-[#e95d2a]' : 'text-[#222222]'}`}>
            {earlyAttemptsCount}
          </div>
          <div className="text-[10px] text-[#6b7280] mt-1">Blocked by time-lock</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e5e5ea] shadow-xs">
          <div className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1">Critical Alerts</div>
          <div className={`text-2xl font-black ${criticalViolationsCount > 0 ? 'text-[#dc2626]' : 'text-[#059669]'}`}>
            {criticalViolationsCount}
          </div>
          <div className="text-[10px] text-[#6b7280] mt-1">Integrity/tamper events</div>
        </div>
      </div>

      {/* Main Grid: Sealed Papers Table & Custody Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Question Papers Custody Registry */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e5e5ea] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#e5e5ea] flex items-center justify-between bg-[#f4f4f6]/50">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#e95d2a]" />
              <h2 className="font-extrabold text-sm text-[#222222] tracking-tight">
                Question Papers Custody Registry
              </h2>
            </div>
            <span className="text-[11px] text-[#6b7280] font-medium">
              Zero-Trust Lifecycle Enforcement
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f4f4f6] text-[#4b5563] border-b border-[#e5e5ea] font-semibold">
                  <th className="py-2.5 px-3">Exam / Paper Code</th>
                  <th className="py-2.5 px-3">Subject & Title</th>
                  <th className="py-2.5 px-3">Lifecycle State</th>
                  <th className="py-2.5 px-3">Seal & 3-of-5 Custody</th>
                  <th className="py-2.5 px-3">Release Schedule</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5ea]">
                {papers.map(paper => {
                  const exam = examinations.find(e => e.id === paper.examinationId);
                  const thresholdApproved = paper.thresholdShares.filter(s => s.approved).length;
                  const isScheduledFuture = exam && new Date(exam.releaseTime).getTime() > serverTime.getTime();

                  return (
                    <tr key={paper.id} className="hover:bg-[#f4f4f6]/40 transition">
                      
                      <td className="py-3 px-3 font-mono font-bold text-[#222222]">
                        <div>{paper.examCode}</div>
                        <div className="text-[10px] text-[#6b7280] font-normal">{paper.id}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-[#222222]">{paper.title}</div>
                        <div className="text-[11px] text-[#6b7280]">{paper.subject}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          paper.status === 'REJECTED' ? 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]' :
                          paper.status === 'RELEASED' ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]' :
                          paper.status === 'TIME_LOCKED' ? 'bg-[#fef3ee] text-[#e95d2a] border border-[#fde2d4]' :
                          paper.status === 'REVIEW_APPROVED' || paper.status === 'AUTHORITY_APPROVED' ? 'bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe]' :
                          paper.status === 'UNDER_REVIEW' ? 'bg-[#fffbeb] text-[#92400e] border border-[#fde68a]' :
                          'bg-[#f4f4f6] text-[#4b5563] border border-[#e5e5ea]'
                        }`}>
                          {paper.status}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1.5">
                          {paper.sealed ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-[#e95d2a] bg-[#fef3ee] px-1.5 py-0.5 rounded border border-[#fde2d4]">
                              <Lock className="w-3 h-3 mr-1" /> SEALED
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] text-[#6b7280] bg-[#f4f4f6] px-1.5 py-0.5 rounded">
                              UNSEALED
                            </span>
                          )}
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            thresholdApproved >= 3 ? 'bg-[#ecfdf5] text-[#065f46]' : 'bg-[#fef2f2] text-[#991b1b]'
                          }`}>
                            {thresholdApproved}/5 Keys
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-[11px]">
                        {exam ? (
                          <div>
                            <div className="font-mono text-[#222222]">
                              {new Date(exam.releaseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className={`text-[10px] font-semibold ${isScheduledFuture ? 'text-[#e95d2a]' : 'text-[#059669]'}`}>
                              {isScheduledFuture ? '🔒 Time-Locked' : '🔓 Release Open'}
                            </div>
                          </div>
                        ) : 'Not scheduled'}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedPaperId(paper.id)}
                          className="px-2.5 py-1 rounded bg-[#222222] hover:bg-black text-white text-[11px] font-bold transition shadow-2xs"
                        >
                          Manage Custody
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Security Monitoring & Active Alerts */}
        <div className="space-y-4">
          
          {/* Active Security Alerts */}
          <div className="bg-white rounded-xl border border-[#e5e5ea] shadow-xs p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea] mb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-[#e95d2a]" />
                <h3 className="font-bold text-xs text-[#222222] uppercase tracking-wide">
                  Security Anomaly Monitor
                </h3>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f4f4f6] text-[#4b5563] font-bold">
                SIEM Real-time
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#6b7280]">
                <CheckCircle2 className="w-6 h-6 text-[#10b981] mx-auto mb-1.5" />
                No security anomalies recorded.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {alerts.slice(0, 5).map(alert => (
                  <div 
                    key={alert.id}
                    className={`p-2.5 rounded-lg border text-xs ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'
                        : 'bg-[#fffbeb] border-[#fde68a] text-[#92400e]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{alert.title}</span>
                      </div>
                      <span className="text-[9px] font-mono opacity-80">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] mt-1 leading-snug opacity-90">
                      {alert.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Threshold Custody Explainer Card */}
          <div className="bg-[#222222] text-white rounded-xl p-4 shadow-xs border border-[#333333]">
            <div className="flex items-center space-x-2 mb-2">
              <Key className="w-4 h-4 text-[#e95d2a]" />
              <h4 className="font-bold text-xs tracking-tight">Zero-Trust Split-Seal Core</h4>
            </div>
            <p className="text-[11px] text-[#9ca3af] leading-relaxed mb-3">
              No single official holds the complete key. The cryptographic release engine demands <strong>3 of 5 custodian signatures</strong>, intact split fragments in Store A/B/C, and strict time-lock expiration.
            </p>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-mono">
              <div className="bg-[#2d2d30] p-1.5 rounded border border-[#3f3f46]">
                <div className="text-[#e95d2a] font-bold">Store A</div>
                <div className="text-[9px] text-[#9ca3af]">Head Vault</div>
              </div>
              <div className="bg-[#2d2d30] p-1.5 rounded border border-[#3f3f46]">
                <div className="text-[#e95d2a] font-bold">Store B</div>
                <div className="text-[9px] text-[#9ca3af]">Core Vault</div>
              </div>
              <div className="bg-[#2d2d30] p-1.5 rounded border border-[#3f3f46]">
                <div className="text-[#e95d2a] font-bold">Store C</div>
                <div className="text-[9px] text-[#9ca3af]">Tag Vault</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Manage Custody & Threshold Modal */}
      {selectedPaperForApproval && (() => {
        const isPaperRejected = selectedPaperForApproval.status === 'REJECTED' || selectedPaperForApproval.reviews.some(r => r.decision === 'REJECTED');
        const latestRejectReview = selectedPaperForApproval.reviews.find(r => r.decision === 'REJECTED');
        const canSeal = currentUser.role === 'ADMIN' || currentUser.role === 'EXAMINATION_AUTHORITY';
        const isReviewApproved = selectedPaperForApproval.status === 'REVIEW_APPROVED' || selectedPaperForApproval.status === 'AUTHORITY_APPROVED';
        const approvedCount = selectedPaperForApproval.thresholdShares.filter(s => s.approved).length;
        const isQuorumMet = approvedCount >= 3;

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedPaperId(null);
            }}
          >
            <div className="bg-white rounded-xl shadow-2xl border border-[#e5e5ea] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
              
              {/* Modal Header - Pinned at Top */}
              <div className="bg-[#222222] text-white px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0 border-b border-[#333333]">
                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                  <Key className="w-5 h-5 text-[#e95d2a] shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm tracking-tight truncate">
                      Threshold Key Custody & Digital Seal Engine
                    </h3>
                    <div className="text-[11px] text-[#9ca3af] font-mono truncate">
                      {selectedPaperForApproval.examCode} — {selectedPaperForApproval.title}
                    </div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedPaperId(null)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-[#e5e5ea] hover:text-white flex items-center justify-center transition shrink-0 ml-2"
                  aria-label="Close dialog"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {/* Rejection Security Notice */}
                {isPaperRejected && (
                  <div className="p-3.5 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-xs text-[#991b1b] space-y-1.5">
                    <div className="font-bold flex items-center space-x-1.5 text-sm text-[#dc2626]">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-[#dc2626]" />
                      <span>SEPARATION OF DUTIES ENFORCEMENT: ACADEMICALLY REJECTED</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#7f1d1d]">
                      This question paper was <strong>REJECTED</strong> by Academic Reviewer ({latestRejectReview?.reviewerName || 'Prof. Elena Rostova'}). Under strict Zero-Trust governance, administrators and authorities are <strong>strictly barred</strong> from signing custody keys or applying digital master seals to rejected papers. Separation of duties prevents administrative override of academic rejections. The question setter must author a revised version.
                    </p>
                    {latestRejectReview?.comments && (
                      <div className="p-2 bg-white rounded border border-[#fecaca] text-[10px] font-mono text-[#7f1d1d]">
                        Reviewer Feedback: &quot;{latestRejectReview.comments}&quot;
                      </div>
                    )}
                  </div>
                )}

                {/* Zero-Trust RBAC Multi-Custodian Notice */}
                <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs text-[#334155] flex items-start space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#e95d2a] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-[#0f172a]">
                      Zero-Trust Threshold Custody: Strict Separation of Duties
                    </div>
                    <div className="text-[11px] text-[#475569] leading-relaxed">
                      You are authenticated as <strong>{currentUser.name} ({currentUser.role})</strong>. 
                      Under cryptographic quorum governance, <strong>each of the 5 custody shares can ONLY be signed by its specific designated custodian authority</strong>. The Administrator cannot proxy or sign on behalf of other authorities. Minimum 3 authorized custodian signatures are required to unlock paper sealing.
                    </div>
                  </div>
                </div>

                {/* Pre-review Warning if still in DRAFT or SUBMITTED */}
                {!isPaperRejected && (selectedPaperForApproval.status === 'DRAFT' || selectedPaperForApproval.status === 'SUBMITTED' || selectedPaperForApproval.status === 'UNDER_REVIEW') && (
                  <div className="p-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg text-xs text-[#1e40af] flex items-center space-x-2">
                    <Info className="w-4 h-4 text-[#3b82f6] shrink-0" />
                    <span>
                      Awaiting Academic Review: Reviewer must verify syllabus compliance and approve the paper before custody shares can be signed.
                    </span>
                  </div>
                )}

                {/* Status Header */}
                <div className="grid grid-cols-3 gap-3 bg-[#f4f4f6] p-3 rounded-lg border border-[#e5e5ea] text-xs">
                  <div>
                    <span className="text-[#6b7280] block text-[10px] font-bold">LIFECYCLE STATUS:</span>
                    <span className={`font-bold ${isPaperRejected ? 'text-[#dc2626]' : 'text-[#222222]'}`}>
                      {selectedPaperForApproval.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6b7280] block text-[10px] font-bold">DIGITAL SEAL:</span>
                    <span className={`font-bold ${selectedPaperForApproval.sealed ? 'text-[#e95d2a]' : 'text-[#6b7280]'}`}>
                      {selectedPaperForApproval.sealed ? '🔒 SEALED (IMMUTABLE)' : 'UNSEALED'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6b7280] block text-[10px] font-bold">MASTER SHA-256:</span>
                    <span className="font-mono text-[10px] text-[#222222] truncate block">
                      {selectedPaperForApproval.fileHash.slice(0, 16)}...
                    </span>
                  </div>
                </div>

                {/* 3-of-5 Custodian Threshold Authorization Shares */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[#222222] flex items-center space-x-1.5">
                      <Layers className="w-4 h-4 text-[#e95d2a]" />
                      <span>3-of-5 Custody Authorization Keyring</span>
                    </label>
                    <span className="text-[11px] font-mono text-[#6b7280]">
                      Required: <strong>3/5 Signatures</strong> (Current: {approvedCount}/5)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedPaperForApproval.thresholdShares.map(share => {
                      const isCustodian = currentUser.role === share.holderRole;

                      return (
                        <div 
                          key={share.shareIndex}
                          className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 transition ${
                            share.approved 
                              ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]' 
                              : isCustodian
                                ? 'bg-[#fef9f6] border-[#fde2d4] text-[#222222]'
                                : 'bg-[#f4f4f6] border-[#e5e5ea] text-[#4b5563]'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              share.approved ? 'bg-[#10b981] text-white' : isCustodian ? 'bg-[#e95d2a] text-white' : 'bg-[#e5e5ea] text-[#6b7280]'
                            }`}>
                              {share.shareIndex}
                            </div>
                            <div>
                              <div className="font-bold text-[#222222] flex items-center space-x-2">
                                <span>{share.holderTitle}</span>
                                {isCustodian && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#e95d2a] text-white rounded">
                                    YOU ARE CUSTODIAN
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#6b7280]">
                                Authorized Role: <span className="font-mono font-semibold">{share.holderRole}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 self-end sm:self-center">
                            {share.approved ? (
                              <span className="text-[10px] font-mono text-[#065f46] font-bold flex items-center">
                                <Check className="w-3.5 h-3.5 mr-1 text-[#10b981]" /> SIGNED
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#6b7280]">Awaiting Signature</span>
                            )}

                            {!selectedPaperForApproval.sealed && (
                              isCustodian ? (
                                <button
                                  disabled={isPaperRejected || !isReviewApproved}
                                  onClick={() => toggleThresholdShare(selectedPaperForApproval.id, share.shareIndex)}
                                  className={`px-3 py-1 rounded text-[11px] font-bold transition disabled:opacity-40 disabled:cursor-not-allowed ${
                                    share.approved
                                      ? 'bg-white text-[#991b1b] border border-[#fecaca] hover:bg-[#fef2f2]'
                                      : 'bg-[#e95d2a] text-white hover:bg-[#d44c1b]'
                                  }`}
                                  title={
                                    isPaperRejected 
                                      ? 'Blocked: Paper was rejected by academic reviewer' 
                                      : !isReviewApproved 
                                        ? 'Blocked: Paper must be approved by Academic Reviewer first' 
                                        : `Sign share as ${currentUser.name}`
                                  }
                                >
                                  {share.approved ? 'Revoke' : 'Sign My Share'}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => switchRole(share.holderRole)}
                                  className="px-2 py-1 rounded text-[10px] font-semibold bg-white hover:bg-[#e5e5ea] text-[#4b5563] border border-[#d1d1d6] transition flex items-center space-x-1"
                                  title={`Switch persona to ${share.holderRole} to sign this share`}
                                >
                                  <span>Switch to {share.holderRole === 'EXAMINATION_AUTHORITY' ? 'Exam Auth' : share.holderRole === 'SECURITY_AUTHORITY' ? 'Cyber Sec' : share.holderRole === 'BACKUP_AUTHORITY' ? 'Backup Escrow' : share.holderRole}</span>
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Digital Signature Fingerprint Details */}
                {selectedPaperForApproval.signature && (
                  <div className="p-3 bg-[#fef3ee] rounded-lg border border-[#fde2d4] text-xs">
                    <div className="flex items-center space-x-1.5 text-[#e95d2a] font-bold mb-1">
                      <Fingerprint className="w-4 h-4" />
                      <span>Cryptographic Digital Signature Fingerprint</span>
                    </div>
                    <div className="font-mono text-[10px] text-[#222222] break-all bg-white p-2 rounded border border-[#e5e5ea]">
                      {selectedPaperForApproval.signature}
                    </div>
                    <div className="text-[10px] text-[#6b7280] mt-1">
                      Public Key: <span className="font-mono">{selectedPaperForApproval.signaturePublicKey}</span>
                    </div>
                  </div>
                )}

                {sealFeedback && (
                  <div className="p-3 bg-[#ecfdf5] border border-[#a7f3d0] rounded-lg text-xs text-[#065f46] font-semibold">
                    {sealFeedback}
                  </div>
                )}
              </div>

              {/* Modal Footer - Pinned at Bottom */}
              <div className="px-5 sm:px-6 py-3.5 bg-[#fbfbfb] border-t border-[#e5e5ea] flex items-center justify-end space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedPaperId(null)}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-[#f4f4f6] text-xs font-bold text-[#4b5563] border border-[#e5e5ea] transition"
                >
                  Close
                </button>

                {!selectedPaperForApproval.sealed ? (
                  <button
                    type="button"
                    disabled={sealingInProgress || isPaperRejected || !canSeal || !isQuorumMet}
                    onClick={() => handleSealClick(selectedPaperForApproval)}
                    className="px-4 py-2 rounded-lg bg-[#e95d2a] hover:bg-[#d44c1b] text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    title={
                      isPaperRejected 
                        ? 'Blocked: Cannot seal an academically rejected paper' 
                        : !canSeal 
                          ? 'Blocked: Only ADMIN or EXAMINATION_AUTHORITY can apply digital seal' 
                          : !isQuorumMet 
                            ? 'Blocked: Requires at least 3 of 5 custodian signatures' 
                            : ''
                    }
                  >
                    <Lock className="w-4 h-4" />
                    <span>{sealingInProgress ? 'Sealing...' : 'Apply Digital Seal & Time-Lock'}</span>
                  </button>
                ) : (
                  <div className="text-xs font-bold text-[#e95d2a] flex items-center space-x-1">
                    <Lock className="w-4 h-4" />
                    <span>Immutable Sealed State Active</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
