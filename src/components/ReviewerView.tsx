import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QuestionPaper } from '../types';
import { 
  UserCheck, 
  FileCheck2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Info, 
  Eye, 
  Layers,
  Lock,
  MessageSquare,
  Download
} from 'lucide-react';

export const ReviewerView: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { 
    currentUser, 
    switchRole, 
    papers, 
    startReview, 
    submitReview 
  } = useApp();

  const [activePaperId, setActivePaperId] = useState<string | null>(null);
  const activePaper = papers.find(p => p.id === activePaperId) || null;
  const [filterMode, setFilterMode] = useState<'PENDING' | 'ALL'>('PENDING');
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'REQUEST_CHANGES'>('APPROVED');
  const [comments, setComments] = useState('All cryptographic syllabus components and difficulty metrics meet board standards.');
  const [reviewSubmitted, setReviewSubmitted] = useState<string | null>(null);

  const isReviewer = currentUser.role === 'REVIEWER';

  // Papers assigned or available for review
  const reviewablePapers = papers.filter(p => {
    if (filterMode === 'PENDING') {
      return (
        p.status === 'DRAFT' ||
        p.status === 'SUBMITTED' || 
        p.status === 'UNDER_REVIEW'
      );
    }
    return true; // All papers
  });

  const handleStartReview = (paperId: string) => {
    startReview(paperId);
    setActivePaperId(paperId);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaper) return;
    if (!isReviewer) {
      alert(`Separation of Duties Violation: You are currently authenticated as ${currentUser.name} (${currentUser.role}). Only users with the REVIEWER role are authorized to submit academic peer reviews. Administrators and Question Setters cannot submit reviews.`);
      return;
    }

    submitReview(activePaper.id, decision, comments);
    setReviewSubmitted(`Review decision [${decision}] recorded and Share 1 endorsed for ${activePaper.id}.`);
    setTimeout(() => {
      setReviewSubmitted(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Role Notice */}
      {!isReviewer && (
        <div className="bg-[#fffbeb] border border-[#fde68a] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#92400e]">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-[#d97706] shrink-0" />
            <span>
              <strong>Separation of Duties RBAC Lock:</strong> You are currently viewing as <strong>{currentUser.name} ({currentUser.role})</strong>.
              Only users with the <strong>REVIEWER</strong> role are authorized to perform paper reviews and sign custodian Share 1.
            </span>
          </div>
          <button
            onClick={() => switchRole('REVIEWER')}
            className="px-3 py-1.5 rounded-lg bg-[#e95d2a] text-white font-bold hover:bg-[#d44c1b] transition shrink-0 self-start sm:self-auto"
          >
            Switch to Reviewer (Prof. Elena Rostova)
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-[#e5e5ea] shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#4b5563] flex items-center justify-center text-white">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#222222] tracking-tight">
              Academic Reviewer Portal
            </h1>
            <p className="text-xs text-[#6b7280]">
              Independent peer review • Syllabus compliance validation • Share-1 Custodian Signature Endorsement
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Assigned Papers List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-[#e5e5ea] shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5e5ea]">
              <h2 className="font-extrabold text-xs text-[#222222] uppercase tracking-wide flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-[#e95d2a]" />
                <span>Question Papers Queue</span>
              </h2>
              <div className="flex items-center space-x-1 bg-[#f4f4f6] p-0.5 rounded-lg border border-[#e5e5ea]">
                <button
                  type="button"
                  onClick={() => setFilterMode('PENDING')}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                    filterMode === 'PENDING'
                      ? 'bg-white text-[#222222] shadow-xs'
                      : 'text-[#6b7280] hover:text-[#222222]'
                  }`}
                >
                  Action Required
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('ALL')}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                    filterMode === 'ALL'
                      ? 'bg-white text-[#222222] shadow-xs'
                      : 'text-[#6b7280] hover:text-[#222222]'
                  }`}
                >
                  All ({papers.length})
                </button>
              </div>
            </div>

            {reviewablePapers.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#6b7280]">
                {filterMode === 'PENDING' 
                  ? 'No question papers currently awaiting peer review. Switch to "All" to inspect other papers.' 
                  : 'No question papers found.'}
              </div>
            ) : (
              <div className="space-y-3">
                {reviewablePapers.map(paper => {
                  const isSelected = activePaper?.id === paper.id;
                  return (
                    <div
                      key={paper.id}
                      onClick={() => setActivePaperId(paper.id)}
                      className={`p-3.5 rounded-lg border text-xs cursor-pointer transition ${
                        isSelected 
                          ? 'border-[#e95d2a] bg-[#fef3ee]' 
                          : 'border-[#e5e5ea] bg-white hover:bg-[#f4f4f6]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="font-bold text-[#222222]">{paper.title}</div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          paper.status === 'REVIEW_APPROVED' ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]' :
                          paper.status === 'UNDER_REVIEW' ? 'bg-[#fffbeb] text-[#92400e] border border-[#fde68a]' :
                          paper.status === 'DRAFT' ? 'bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]' :
                          paper.status === 'TIME_LOCKED' ? 'bg-[#ede9fe] text-[#5b21b6] border border-[#ddd6fe]' :
                          paper.status === 'RELEASED' ? 'bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]' :
                          'bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe]'
                        }`}>
                          {paper.status === 'DRAFT' ? 'DRAFT (ACTIONABLE)' : paper.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#6b7280] mb-2 font-mono">
                        {paper.examCode} • Author: {paper.createdByName}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#e5e5ea]/60 text-[10px] text-[#6b7280]">
                        <span>Version: {paper.version}</span>
                        <span>{paper.reviews.length} Previous Reviews</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Review & Assessment Workspace (7 Cols) */}
        <div className="lg:col-span-7">
          {activePaper ? (
            <div className="bg-white rounded-xl border border-[#e5e5ea] shadow-xs p-6 space-y-5">
              
              <div className="flex items-start justify-between pb-3 border-b border-[#e5e5ea]">
                <div>
                  <h3 className="font-extrabold text-base text-[#222222]">
                    {activePaper.title}
                  </h3>
                  <p className="text-xs text-[#6b7280] font-mono mt-0.5">
                    {activePaper.examCode} • Master Hash: {activePaper.fileHash.slice(0, 18)}...
                  </p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#f4f4f6] text-[#4b5563] font-mono">
                  {activePaper.id}
                </span>
              </div>

              {/* Secure Content Preview (Simulated Authorized In-Memory Decryption) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#222222]">
                    Confidential Question Paper Preview (Session Authorized)
                  </label>
                  {activePaper.fileDataUrl && (
                    <a
                      href={activePaper.fileDataUrl}
                      download={activePaper.originalFileName || `${activePaper.id}.pdf`}
                      className="text-[11px] font-bold text-[#e95d2a] hover:underline flex items-center space-x-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Original ({activePaper.originalFileName})</span>
                    </a>
                  )}
                </div>
                <div className="bg-[#f4f4f6] p-3 rounded-lg border border-[#e5e5ea] font-mono text-[11px] text-[#222222] max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {activePaper.sampleContent}
                </div>
              </div>

              {/* Reviewer Action Form */}
              <form onSubmit={handleSubmitReview} className="space-y-4 pt-2 border-t border-[#e5e5ea]">
                
                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1.5">
                    Review Decision & Custody Share-1 Endorsement
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDecision('APPROVED')}
                      className={`p-2 rounded-lg border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                        decision === 'APPROVED'
                          ? 'bg-[#ecfdf5] border-[#10b981] text-[#065f46]'
                          : 'bg-white border-[#e5e5ea] text-[#4b5563] hover:bg-[#f4f4f6]'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 text-[#10b981]" />
                      <span>APPROVE</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecision('REQUEST_CHANGES')}
                      className={`p-2 rounded-lg border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                        decision === 'REQUEST_CHANGES'
                          ? 'bg-[#fffbeb] border-[#f59e0b] text-[#92400e]'
                          : 'bg-white border-[#e5e5ea] text-[#4b5563] hover:bg-[#f4f4f6]'
                      }`}
                    >
                      <Clock className="w-4 h-4 text-[#f59e0b]" />
                      <span>CHANGES</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecision('REJECTED')}
                      className={`p-2 rounded-lg border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                        decision === 'REJECTED'
                          ? 'bg-[#fef2f2] border-[#ef4444] text-[#991b1b]'
                          : 'bg-white border-[#e5e5ea] text-[#4b5563] hover:bg-[#f4f4f6]'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-[#ef4444]" />
                      <span>REJECT</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">
                    Academic Reviewer Comments & Notes
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e5e5ea] rounded-lg text-xs focus:ring-2 focus:ring-[#e95d2a] focus:outline-none"
                    placeholder="Enter academic review assessment..."
                  />
                </div>

                {reviewSubmitted && (
                  <div className="p-3.5 bg-[#ecfdf5] border border-[#a7f3d0] rounded-lg text-xs text-[#065f46] space-y-2">
                    <div className="font-bold">{reviewSubmitted}</div>
                    {onNavigateTab && (
                      <div className="flex items-center space-x-2 pt-1 border-t border-[#a7f3d0]/60">
                        <button
                          type="button"
                          onClick={() => onNavigateTab('admin')}
                          className="px-2.5 py-1 rounded bg-[#065f46] hover:bg-[#044e39] text-white font-bold text-[11px] transition"
                        >
                          Go to Admin Custody & Sealing
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigateTab('centre')}
                          className="px-2.5 py-1 rounded bg-white hover:bg-[#f4f4f6] text-[#065f46] border border-[#a7f3d0] font-bold text-[11px] transition"
                        >
                          Go to Centre Release Station
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-[#6b7280]">
                    Approving endorses <strong>Threshold Share #1 (Academic Reviewer)</strong>
                  </div>

                  <button
                    type="submit"
                    disabled={activePaper.sealed || !isReviewer}
                    className="px-5 py-2.5 rounded-lg bg-[#e95d2a] hover:bg-[#d44c1b] text-white font-bold text-xs transition shadow-sm flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    title={!isReviewer ? `Blocked: Only REVIEWER role can submit reviews. Current role: ${currentUser.role}` : activePaper.sealed ? 'Blocked: Paper is sealed' : ''}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>
                      {!isReviewer 
                        ? `Review Blocked (${currentUser.role} Role - Must be REVIEWER)` 
                        : 'Submit Official Review Decision'}
                    </span>
                  </button>
                </div>

              </form>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#e5e5ea] shadow-xs p-12 text-center text-xs text-[#6b7280]">
              <Eye className="w-8 h-8 text-[#9ca3af] mx-auto mb-2" />
              <p className="font-bold text-[#222222]">Select a Question Paper from the left queue</p>
              <p className="text-[11px] mt-1">Review questions, verify syllabus balance, and sign off on custody endorsement.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
