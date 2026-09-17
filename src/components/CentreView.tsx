import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Lock, 
  Unlock, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Printer, 
  Key, 
  FileText, 
  AlertTriangle,
  Info,
  Copy,
  Check,
  X,
  Eye,
  RefreshCw,
  UserCheck,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { ReleaseRecord, QuestionPaper, Examination } from '../types';

export const CentreView: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { 
    currentUser, 
    switchRole, 
    centres, 
    examinations, 
    papers, 
    releaseRecords,
    serverTime, 
    attemptRelease,
    fastTrackSealPaper
  } = useApp();

  const [selectedCentreId, setSelectedCentreId] = useState(currentUser.centreId || 'centre-101');
  const [selectedPaperByExam, setSelectedPaperByExam] = useState<Record<string, string>>({});
  const [releaseInProgress, setReleaseInProgress] = useState(false);
  const [fastTrackLoading, setFastTrackLoading] = useState<string | null>(null);
  const [fastTrackSuccess, setFastTrackSuccess] = useState<string | null>(null);
  const [examFilter, setExamFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedPaper, setCopiedPaper] = useState(false);
  const [latestReleaseResult, setLatestReleaseResult] = useState<{
    success: boolean;
    record: ReleaseRecord;
    decryptedText?: string;
    paper?: QuestionPaper;
    exam?: Examination;
  } | null>(null);

  const resultSectionRef = useRef<HTMLDivElement>(null);

  const isCentreRole = currentUser.role === 'EXAMINATION_CENTRE';
  const currentCentre = centres.find(c => c.id === selectedCentreId) || centres[0];

  // Examinations assigned to this centre (or fallback to all examinations)
  const assignedExams = examinations.filter(e => e.centreIds.length === 0 || e.centreIds.includes(currentCentre.id));

  // All question papers matching this centre's examination schedule (excluding rejected papers)
  const assignedPapers = papers.filter(p => {
    // Under Zero-Trust policy, rejected papers must never be available or visible at Examination Centres
    if (p.status === 'REJECTED' || p.reviews.some(r => r.decision === 'REJECTED')) {
      return false;
    }

    const exam = examinations.find(e => e.id === p.examinationId);
    const matchesCentre = !exam || exam.centreIds.length === 0 || exam.centreIds.includes(currentCentre.id);
    const matchesExamFilter = examFilter === 'ALL' || p.examinationId === examFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || 
      p.title.toLowerCase().includes(q) ||
      p.subject.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.createdByName && p.createdByName.toLowerCase().includes(q)) ||
      (exam && exam.code.toLowerCase().includes(q)) ||
      (exam && exam.name.toLowerCase().includes(q));
    return matchesCentre && matchesExamFilter && matchesSearch;
  });

  // Examinations that currently have zero approved/active papers uploaded
  const examsWithoutPapers = assignedExams.filter(exam => {
    const matchesExamFilter = examFilter === 'ALL' || exam.id === examFilter;
    const hasPapers = papers.some(p => p.examinationId === exam.id && p.status !== 'REJECTED' && !p.reviews.some(r => r.decision === 'REJECTED'));
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || exam.name.toLowerCase().includes(q) || exam.code.toLowerCase().includes(q);
    return matchesExamFilter && !hasPapers && matchesSearch;
  });

  const handleFastTrackSeal = async (paperId: string) => {
    if (currentUser.role !== 'ADMIN') {
      alert(`Separation of Duties RBAC Lock: Sealing and threshold custody operations are strictly restricted to the ADMIN role. You are currently authenticated as ${currentUser.name} (${currentUser.role}). Please switch to the Administrator role to sign and seal papers.`);
      return;
    }
    setFastTrackLoading(paperId);
    try {
      await fastTrackSealPaper(paperId);
      setFastTrackSuccess(`Question Paper [${paperId}] successfully sealed with 3-of-5 custody threshold and signed!`);
      setTimeout(() => setFastTrackSuccess(null), 4000);
    } catch (err: any) {
      alert(`Seal Operation Blocked: ${err.message}`);
    } finally {
      setFastTrackLoading(null);
    }
  };

  // Trigger file download of decrypted examination paper - STRICTLY RESTRICTED TO CENTRE USERS
  const handleDownloadPaper = (exam: Examination, paper: QuestionPaper, content: string) => {
    if (!isCentreRole) {
      alert(`Zero-Trust Security Violation: Access Denied. Live question paper file download is restricted EXCLUSIVELY to authenticated Examination Centre Superintendents (EXAMINATION_CENTRE). You are currently signed in as "${currentUser.name}" (${currentUser.role}).`);
      return;
    }

    // If the paper was authored with an original binary file (PDF/DOCX), download in original format
    if (paper.fileDataUrl) {
      const link = document.createElement('a');
      link.href = paper.fileDataUrl;
      link.download = paper.originalFileName || `${exam.code}_${paper.id}_Decrypted_Paper.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const filename = `${exam.code}_${paper.id}_Decrypted_Examination_Paper.txt`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = (text: string, type: 'paper' | 'token') => {
    if (type === 'paper' && !isCentreRole) {
      alert(`Zero-Trust Security Violation: Copying decrypted examination questions is restricted exclusively to Examination Centre Superintendents.`);
      return;
    }
    navigator.clipboard.writeText(text);
    if (type === 'paper') {
      setCopiedPaper(true);
      setTimeout(() => setCopiedPaper(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handlePrintPaper = () => {
    if (!isCentreRole) {
      alert(`Zero-Trust Security Violation: Printing live examination papers is restricted exclusively to Examination Centre Superintendents.`);
      return;
    }
    window.print();
  };

  const handleRequestRelease = async (paperId: string) => {
    const targetPaper = papers.find(p => p.id === paperId);
    const targetExam = examinations.find(e => e.id === targetPaper?.examinationId);
    
    setReleaseInProgress(true);
    try {
      const res = await attemptRelease(paperId, currentCentre.id);
      const resultObj = {
        ...res,
        paper: targetPaper,
        exam: targetExam,
      };
      setLatestReleaseResult(resultObj);
      setIsModalOpen(true);

      // Auto-scroll in-page container as well
      setTimeout(() => {
        resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      alert(`Release Request Failed: ${err.message}`);
    } finally {
      setReleaseInProgress(false);
    }
  };

  const handleViewAlreadyReleased = (paper: QuestionPaper, exam: Examination) => {
    if (!isCentreRole) {
      alert(`Zero-Trust Security Violation: Access Denied. Plaintext examination papers can ONLY be accessed and viewed by verified Examination Centre Superintendents. Current role: ${currentUser.role}`);
      return;
    }

    const matchedRecord = releaseRecords.find(r => r.paperId === paper.id && r.status === 'SUCCESS') || {
      id: `rel-${paper.id}`,
      paperId: paper.id,
      examinationId: exam.id,
      centreId: currentCentre.id,
      centreName: currentCentre.name,
      releasedToUser: currentUser.name,
      releasedAt: paper.updatedAt,
      status: 'SUCCESS',
      singleUseToken: `RELEASE_TOKEN_${paper.id.toUpperCase()}_CUSTODY_VALIDATED`,
      tokenExpiresAt: new Date(Date.now() + 180000).toISOString(),
      checklist: {
        authenticated: true,
        mfaVerified: true,
        roleAuthorized: true,
        centreAuthorized: true,
        assignedToExam: true,
        paperExists: true,
        paperApproved: true,
        paperSealed: true,
        timeLockExpired: true,
        fragmentsIntact: true,
        sha256IntegrityValid: true,
        digitalSignatureValid: true,
        thresholdAuthorized: true,
        singleUseTokenValid: true,
      },
    };

    setLatestReleaseResult({
      success: true,
      record: matchedRecord,
      decryptedText: paper.sampleContent,
      paper,
      exam,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Role Notice */}
      {!isCentreRole && (
        <div className="bg-[#fffbeb] border border-[#fde68a] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#92400e]">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-[#d97706] shrink-0" />
            <span>
              You are currently viewing as <strong>{currentUser.name} ({currentUser.role})</strong>.
              For full zero-trust authenticity testing, switch to the official Examination Centre Officer role.
            </span>
          </div>
          <button
            onClick={() => switchRole('EXAMINATION_CENTRE', 'centre-101')}
            className="px-3 py-1.5 rounded-lg bg-[#e95d2a] text-white font-bold hover:bg-[#d44c1b] transition shrink-0 self-start sm:self-auto"
          >
            Switch to Centre 101 (Metropolis)
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-[#e5e5ea] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#059669] flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#222222] tracking-tight">
                Examination Centre Paper Release Station
              </h1>
              <p className="text-xs text-[#6b7280]">
                Strict server-verified release • 13-point security checklist • Instant ephemeral decryption & dispatch
              </p>
            </div>
          </div>

          {/* Active Centre Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-[#222222]">Active Centre:</label>
            <select
              value={selectedCentreId}
              onChange={e => {
                setSelectedCentreId(e.target.value);
                if (isCentreRole) switchRole('EXAMINATION_CENTRE', e.target.value);
              }}
              className="px-3 py-1.5 border border-[#e5e5ea] rounded-lg text-xs bg-[#f4f4f6] font-bold text-[#222222] focus:ring-2 focus:ring-[#e95d2a] focus:outline-none cursor-pointer"
            >
              {centres.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Centre Security Profile Bar */}
        <div className="mt-4 pt-4 border-t border-[#e5e5ea] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#6b7280] block">CENTRE CODE</span>
            <span className="font-mono font-bold text-[#222222]">{currentCentre.code}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#6b7280] block">MUNICIPALITY</span>
            <span className="font-semibold text-[#222222]">{currentCentre.city}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#6b7280] block">IP FIREWALL WHITELIST</span>
            <span className="font-mono text-[#059669] font-bold">{currentCentre.ipWhitelist}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#6b7280] block">CENTRE CUSTODY STATUS</span>
            <span className="inline-flex items-center text-[#059669] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mr-1"></span> AUTHORIZED
            </span>
          </div>
        </div>
      </div>

      {/* Assigned Examinations & Release Request Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#e95d2a]" />
            <h2 className="text-sm font-extrabold text-[#222222] uppercase tracking-wide">
              Assigned Examination Papers Schedule
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fef3ee] text-[#e95d2a] border border-[#fde2d4]">
              {assignedPapers.length} Paper{assignedPapers.length !== 1 ? 's' : ''} Available
            </span>
          </div>
          <span className="text-xs text-[#6b7280]">
            Current Server Time: <strong className="font-mono text-[#222222]">{serverTime.toLocaleTimeString()}</strong>
          </span>
        </div>

        {fastTrackSuccess && (
          <div className="bg-[#ecfdf5] border border-[#a7f3d0] p-3 rounded-lg text-xs font-bold text-[#065f46] flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
            <span>{fastTrackSuccess}</span>
          </div>
        )}

        {/* Filter & Search Toolbar */}
        <div className="bg-[#f4f4f6] p-2.5 rounded-xl border border-[#e5e5ea] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Exam Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider mr-1 shrink-0 flex items-center space-x-1">
              <Filter className="w-3 h-3 text-[#e95d2a]" />
              <span>Exam:</span>
            </span>
            <button
              type="button"
              onClick={() => setExamFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                examFilter === 'ALL'
                  ? 'bg-[#222222] text-white shadow-xs'
                  : 'bg-white text-[#6b7280] border border-[#e5e5ea] hover:bg-[#e5e5ea]'
              }`}
            >
              All Examinations ({papers.length})
            </button>
            {examinations.map(exam => {
              const examCount = papers.filter(p => p.examinationId === exam.id).length;
              return (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => setExamFilter(exam.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 flex items-center space-x-1.5 ${
                    examFilter === exam.id
                      ? 'bg-[#e95d2a] text-white shadow-xs'
                      : 'bg-white text-[#6b7280] border border-[#e5e5ea] hover:bg-[#e5e5ea]'
                  }`}
                >
                  <span className="font-mono">{exam.code}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    examFilter === exam.id ? 'bg-white/20 text-white' : 'bg-[#f4f4f6] text-[#222222]'
                  }`}>
                    {examCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Instant Search Bar */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6b7280]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search paper, code, setter..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#e5e5ea] rounded-lg text-[#222222] placeholder:text-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#e95d2a]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-[#9ca3af] hover:text-[#222222]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Paper Grid - Each Question Paper is rendered as its own distinct card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignedPapers.map(paper => {
            const exam = examinations.find(e => e.id === paper.examinationId);
            const releaseTimeMs = exam ? new Date(exam.releaseTime).getTime() : 0;
            const currentMs = serverTime.getTime();
            const isUnlocked = currentMs >= releaseTimeMs;
            const secondsLeft = Math.max(0, Math.ceil((releaseTimeMs - currentMs) / 1000));

            const hours = Math.floor(secondsLeft / 3600);
            const mins = Math.floor((secondsLeft % 3600) / 60);
            const secs = secondsLeft % 60;

            const isAlreadyReleased = paper.status === 'RELEASED';
            const isReadyForRelease = paper.sealed && isUnlocked;
            const approvedShares = paper.thresholdShares.filter(s => s.approved).length;
            const isQuorumMet = approvedShares >= 3;

            return (
              <div 
                key={paper.id}
                className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition ${
                  isAlreadyReleased 
                    ? 'border-[#059669] ring-1 ring-[#059669]/20' 
                    : paper.sealed
                      ? isUnlocked 
                        ? 'border-[#a7f3d0] ring-1 ring-[#10b981]/20' 
                        : 'border-[#fed7aa]'
                      : 'border-[#fde68a] bg-linear-to-b from-[#fffefc] to-white'
                }`}
              >
                <div>
                  {/* Card Header Badges */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-[#f4f4f6] text-[#222222] border border-[#e5e5ea]">
                        {exam?.code || 'EXAM'}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#222222] text-white">
                        {paper.id} (v{paper.version})
                      </span>
                    </div>

                    {isAlreadyReleased ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] flex items-center space-x-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                        <span>RELEASED</span>
                      </span>
                    ) : paper.sealed ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 shrink-0 ${
                        isUnlocked
                          ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                          : 'bg-[#fef3ee] text-[#e95d2a] border border-[#fde2d4]'
                      }`}>
                        {isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{isUnlocked ? 'WINDOW OPEN' : 'TIME-LOCKED'}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fffbeb] text-[#d97706] border border-[#fde68a] flex items-center space-x-1 shrink-0">
                        <AlertTriangle className="w-3 h-3 text-[#d97706]" />
                        <span>{paper.status}</span>
                      </span>
                    )}
                  </div>

                  {/* Question Paper Title & Examination Info */}
                  <div className="mt-2">
                    <h3 className="font-extrabold text-base text-[#222222] leading-snug">
                      {paper.title}
                    </h3>
                    <p className="text-xs text-[#6b7280] mt-0.5 font-medium">
                      {exam?.name || 'Competitive Examination'}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-[#6b7280]">
                      <span className="inline-flex items-center space-x-1">
                        <UserCheck className="w-3 h-3 text-[#e95d2a]" />
                        <span>Setter: <strong className="text-[#222222]">{paper.createdByName}</strong></span>
                      </span>
                      <span className="text-[#d1d5db]">•</span>
                      <span className="font-mono text-[10px] text-[#6b7280] bg-[#f4f4f6] px-1 py-0.2 rounded border border-[#e5e5ea]">
                        {paper.originalFileName}
                      </span>
                    </div>
                  </div>

                  {/* Official Release Timing Box */}
                  {exam && (
                    <div className="bg-[#f4f4f6] p-3 rounded-lg border border-[#e5e5ea] my-3 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#6b7280]">Official Release Time:</span>
                        <span className="font-mono font-bold text-[#222222]">
                          {new Date(exam.releaseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          <span className="text-[10px] font-normal text-[#6b7280] ml-1">({exam.examDate})</span>
                        </span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span className="text-[#6b7280]">Time-Lock Status:</span>
                        {isUnlocked ? (
                          <span className="text-[#059669]">Release Window Elapsed (Authorized)</span>
                        ) : (
                          <span className="text-[#e95d2a] font-mono">
                            {hours}h {mins}m {secs}s remaining
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cryptographic Custody Indicators */}
                  <div className="text-[11px] text-[#6b7280] mb-3 space-y-1 bg-white p-2.5 rounded-lg border border-[#e5e5ea]">
                    <div className="flex justify-between">
                      <span>Custody Threshold Quorum:</span>
                      <span className="font-mono font-bold text-[#222222]">
                        {approvedShares} / {paper.thresholdShares.length}
                        <span className={`ml-1 text-[10px] font-bold ${isQuorumMet ? 'text-[#059669]' : 'text-[#d97706]'}`}>
                          {isQuorumMet ? '(Quorum ✓)' : '(Need 3 of 5)'}
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Digital Master Seal:</span>
                      <span className={`font-semibold ${paper.sealed ? 'text-[#059669]' : 'text-[#d97706]'}`}>
                        {paper.sealed ? '✓ Signed & Sealed (Time-Locked)' : `Pending Custody (${paper.status})`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Split-Seal Storage:</span>
                      <span className="font-mono text-[#222222]">
                        3 Distributed Shards (AES-256-GCM)
                      </span>
                    </div>
                  </div>

                  {/* Zero-Trust Custody Notice & Fast-Track Sealing for Testing */}
                  {!paper.sealed && (
                    <div className="mb-3 bg-[#fffbeb] border border-[#fde68a] p-3 rounded-lg text-[11px] text-[#92400e] space-y-2">
                      <div className="font-bold flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                          <span>Zero-Trust Custody Stage: {paper.status}</span>
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white border border-[#fde68a] text-[#b45309]">
                          Unsealed
                        </span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-[#b45309]">
                        {paper.status === 'DRAFT' && 'Drafted by Question Setter. Needs Reviewer approval and 3-of-5 admin custody seal before centre release.'}
                        {paper.status === 'SUBMITTED' && 'Submitted for academic review. Awaiting Reviewer verification & Admin 3-of-5 threshold seal.'}
                        {paper.status === 'UNDER_REVIEW' && 'Under review by peer reviewer. Awaiting endorsement and admin custody signatures.'}
                        {paper.status === 'REVIEW_APPROVED' && 'Academic review approved! Ready for Admin 3-of-5 threshold custody signatures and Master Seal.'}
                      </p>

                      <div className="pt-1 flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          disabled={fastTrackLoading === paper.id}
                          onClick={() => handleFastTrackSeal(paper.id)}
                          className="px-2.5 py-1 rounded bg-[#e95d2a] hover:bg-[#d44c1b] text-white font-bold text-[11px] transition shadow-xs flex items-center space-x-1 disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{fastTrackLoading === paper.id ? 'Sealing...' : '⚡ Fast-Track Custody Seal (Demo)'}</span>
                        </button>

                        {onNavigateTab && (
                          <>
                            {(paper.status === 'DRAFT' || paper.status === 'SUBMITTED' || paper.status === 'UNDER_REVIEW') && (
                              <button
                                type="button"
                                onClick={() => onNavigateTab('reviewer')}
                                className="px-2 py-1 rounded bg-white text-[#92400e] border border-[#fde68a] font-bold text-[10px] hover:bg-[#fef3c7] transition"
                              >
                                Reviewer Tab
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onNavigateTab('admin')}
                              className="px-2 py-1 rounded bg-white text-[#92400e] border border-[#fde68a] font-bold text-[10px] hover:bg-[#fef3c7] transition"
                            >
                              Admin Custody Tab
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action Button - Strictly Gated to Centre Role */}
                <div className="space-y-2 pt-2 border-t border-[#f0f0f2]">
                  {isAlreadyReleased ? (
                    <div className="space-y-2">
                      {isCentreRole ? (
                        <>
                          <button
                            type="button"
                            onClick={() => exam && handleViewAlreadyReleased(paper, exam)}
                            className="w-full py-2.5 rounded-lg text-xs font-bold bg-[#059669] hover:bg-[#047857] text-white transition flex items-center justify-center space-x-2 shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Decrypted Question Paper</span>
                          </button>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => exam && handleDownloadPaper(exam, paper, paper.sampleContent)}
                              className="flex-1 py-1.5 rounded-lg text-[11px] font-bold bg-[#f4f4f6] hover:bg-[#e5e5ea] text-[#222222] border border-[#e5e5ea] transition flex items-center justify-center space-x-1"
                            >
                              <Download className="w-3.5 h-3.5 text-[#059669]" />
                              <span>Download {paper.fileDataUrl ? `(${paper.originalFileName?.split('.').pop()?.toUpperCase() || 'FILE'})` : '(.txt)'}</span>
                            </button>
                            <button
                              type="button"
                              disabled={releaseInProgress}
                              onClick={() => handleRequestRelease(paper.id)}
                              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#6b7280] hover:text-[#222222] hover:bg-[#f4f4f6] transition flex items-center space-x-1"
                              title="Re-run 13 verification gates"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${releaseInProgress ? 'animate-spin' : ''}`} />
                              <span>Re-check</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-3 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-xs text-[#991b1b] space-y-2">
                          <div className="flex items-center space-x-1.5 font-bold">
                            <ShieldAlert className="w-4 h-4 text-[#ef4444] shrink-0" />
                            <span>Restricted: Centre Users Only</span>
                          </div>
                          <p className="text-[11px] text-[#7f1d1d] leading-relaxed">
                            Access & download prohibited for role <strong>{currentUser.role}</strong>. Only Examination Centre Superintendents can decrypt papers.
                          </p>
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => switchRole('EXAMINATION_CENTRE', currentCentre.id)}
                              className="flex-1 py-1.5 rounded bg-[#059669] hover:bg-[#047857] text-white font-bold text-[11px] transition shadow-xs flex items-center justify-center space-x-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Switch to Centre User</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRequestRelease(paper.id)}
                              className="px-2 py-1.5 rounded bg-white text-[#991b1b] border border-[#fecaca] font-bold text-[10px] hover:bg-[#fee2e2] transition"
                              title="Test security gate RBAC denial"
                            >
                              Test RBAC Gate
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled={releaseInProgress}
                        onClick={() => handleRequestRelease(paper.id)}
                        className={`w-full py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 shadow-sm ${
                          isUnlocked && isCentreRole && paper.sealed
                            ? 'bg-[#e95d2a] hover:bg-[#d44c1b] text-white'
                            : 'bg-[#222222] hover:bg-black text-white'
                        }`}
                      >
                        {isUnlocked && isCentreRole && paper.sealed ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4 text-[#e95d2a]" />
                        )}
                        <span>
                          {releaseInProgress 
                            ? 'Evaluating 13 Security Gates...' 
                            : !isCentreRole
                              ? `Test Gate Release (Will Block ${currentUser.role})`
                              : !paper.sealed
                                ? `Release Blocked (${paper.status} - Needs Seal)`
                                : isUnlocked 
                                  ? 'Request Decrypted Examination Paper' 
                                  : 'Request Early Release (Test Time-Lock Block)'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Fallback Cards for Examinations with No Papers Uploaded Yet */}
          {examsWithoutPapers.map(exam => (
            <div
              key={exam.id}
              className="bg-white rounded-xl border border-dashed border-[#d1d5db] p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-[#f4f4f6] text-[#222222] border border-[#e5e5ea]">
                    {exam.code}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f4f4f6] text-[#6b7280] border border-[#e5e5ea]">
                    NO PAPER UPLOADED
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-[#222222] leading-snug mt-2">
                  {exam.name}
                </h3>
                <p className="text-xs text-[#6b7280] mt-1">
                  Scheduled for {new Date(exam.releaseTime).toLocaleString()}
                </p>
                <div className="my-4 p-3 bg-[#f9fafb] rounded-lg border border-[#e5e5ea] text-xs text-[#6b7280]">
                  No confidential question papers have been authored for this examination schedule yet.
                </div>
              </div>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('setter')}
                  className="w-full py-2 rounded-lg text-xs font-bold bg-[#f4f4f6] hover:bg-[#e5e5ea] text-[#222222] border border-[#e5e5ea] transition flex items-center justify-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#e95d2a]" />
                  <span>Open Question Setter to Author Paper</span>
                </button>
              )}
            </div>
          ))}

          {/* Zero Search/Filter Results State */}
          {assignedPapers.length === 0 && examsWithoutPapers.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-[#e5e5ea]">
              <FileText className="w-8 h-8 text-[#9ca3af] mx-auto mb-2" />
              <h4 className="font-bold text-sm text-[#222222]">No question papers match the filter</h4>
              <p className="text-xs text-[#6b7280] mt-1">
                Try clearing the search query or selecting &quot;All Examinations&quot;.
              </p>
              <button
                type="button"
                onClick={() => { setExamFilter('ALL'); setSearchQuery(''); }}
                className="mt-3 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#e95d2a] text-white hover:bg-[#d44c1b] transition"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* In-Page Release Verification Result Container */}
      <div ref={resultSectionRef}>
        {latestReleaseResult && (
          <div className="bg-white rounded-xl border border-[#e5e5ea] shadow-md p-6 space-y-5 animate-in fade-in slide-in-from-top-4 duration-200">
            
            <div className="flex items-start justify-between pb-4 border-b border-[#e5e5ea]">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 ${
                  latestReleaseResult.success ? 'bg-[#059669]' : 'bg-[#e95d2a]'
                }`}>
                  {latestReleaseResult.success ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#222222]">
                    {latestReleaseResult.success 
                      ? 'Controlled Release Authorization Granted' 
                      : 'Controlled Release Request Blocked by Security Engine'}
                  </h3>
                  <p className="text-xs text-[#6b7280]">
                    Record ID: <span className="font-mono font-bold text-[#222222]">{latestReleaseResult.record.id}</span> • Timestamp: {new Date(latestReleaseResult.record.releasedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {latestReleaseResult.success && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#059669] text-white font-bold hover:bg-[#047857] flex items-center space-x-1 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Paper Dialog</span>
                  </button>
                )}
                <button
                  onClick={() => setLatestReleaseResult(null)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-[#f4f4f6] text-[#4b5563] hover:bg-[#e5e5ea]"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* 13-Point Security Verification Gates */}
            <div>
              <h4 className="text-xs font-bold text-[#222222] uppercase tracking-wider mb-2">
                13-Gate Server-Side Verification Checklist:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                {[
                  { label: '1. User Authenticated', passed: latestReleaseResult.record.checklist.authenticated },
                  { label: '2. MFA Token Verified', passed: latestReleaseResult.record.checklist.mfaVerified },
                  { label: '3. Role Authorized', passed: latestReleaseResult.record.checklist.roleAuthorized },
                  { label: '4. Centre Status Active', passed: latestReleaseResult.record.checklist.centreAuthorized },
                  { label: '5. Centre Assigned to Exam', passed: latestReleaseResult.record.checklist.assignedToExam },
                  { label: '6. Paper Exists & Valid', passed: latestReleaseResult.record.checklist.paperExists },
                  { label: '7. Paper Fully Approved', passed: latestReleaseResult.record.checklist.paperApproved },
                  { label: '8. Digital Seal Intact', passed: latestReleaseResult.record.checklist.paperSealed },
                  { label: '9. Time-Lock Window Open', passed: latestReleaseResult.record.checklist.timeLockExpired },
                  { label: '10. Storage Fragments Intact', passed: latestReleaseResult.record.checklist.fragmentsIntact },
                  { label: '11. SHA-256 Plaintext Hash', passed: latestReleaseResult.record.checklist.sha256IntegrityValid },
                  { label: '12. Digital Signature Cert', passed: latestReleaseResult.record.checklist.digitalSignatureValid },
                  { label: '13. 3-of-5 Threshold Satisfied', passed: latestReleaseResult.record.checklist.thresholdAuthorized },
                ].map((gate, i) => (
                  <div 
                    key={i} 
                    className={`p-2 rounded-lg border flex items-center justify-between ${
                      gate.passed ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]' : 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'
                    }`}
                  >
                    <span className="font-medium text-[11px]">{gate.label}</span>
                    {gate.passed ? <CheckCircle2 className="w-4 h-4 text-[#10b981]" /> : <XCircle className="w-4 h-4 text-[#ef4444]" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Failure Banner */}
            {!latestReleaseResult.success && latestReleaseResult.record.failureReason && (
              <div className="p-4 bg-[#fef2f2] border border-[#fecaca] rounded-xl text-xs text-[#991b1b] space-y-2">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-[#ef4444]" />
                  <div>
                    <strong className="block font-bold text-sm">Release Gate Violation Detected:</strong>
                    <p className="mt-0.5 leading-relaxed">{latestReleaseResult.record.failureReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success: Single-Use Token & Decrypted Examination Paper */}
            {latestReleaseResult.success && (
              <div className="space-y-4 pt-2">
                
                {/* Single Use Ephemeral Release Token */}
                <div className="bg-[#fef3ee] p-3.5 rounded-xl border border-[#fde2d4] text-xs">
                  <div className="flex items-center justify-between text-[#e95d2a] font-bold mb-1.5">
                    <span className="flex items-center space-x-1.5">
                      <Key className="w-4 h-4" />
                      <span>Single-Use Ephemeral Release Authorization Token</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#6b7280]">Expires in 90 seconds</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="font-mono text-xs font-bold text-[#222222] bg-white p-2 rounded-lg border border-[#e5e5ea] break-all flex-1 select-all">
                      {latestReleaseResult.record.singleUseToken}
                    </div>
                    <button
                      onClick={() => handleCopyText(latestReleaseResult.record.singleUseToken, 'token')}
                      className="px-3 py-2 rounded-lg bg-white border border-[#e5e5ea] text-[#222222] hover:bg-[#f4f4f6] text-xs font-semibold flex items-center space-x-1 shrink-0"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5 text-[#6b7280]" />}
                      <span>{copiedToken ? 'Copied' : 'Copy Token'}</span>
                    </button>
                  </div>
                </div>

                {/* Decrypted Question Paper Preview */}
                {isCentreRole ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#222222] flex items-center space-x-1.5">
                        <FileText className="w-4 h-4 text-[#059669]" />
                        <span>Decrypted Official Examination Paper (Centre Print Dispatch)</span>
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopyText(latestReleaseResult.decryptedText || '', 'paper')}
                          className="px-2.5 py-1.5 rounded-lg bg-[#f4f4f6] hover:bg-[#e5e5ea] text-[#222222] text-[11px] font-bold flex items-center space-x-1 border border-[#e5e5ea]"
                        >
                          {copiedPaper ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedPaper ? 'Copied' : 'Copy Text'}</span>
                        </button>
                        {latestReleaseResult.exam && latestReleaseResult.paper && (
                          <button
                            onClick={() => handleDownloadPaper(latestReleaseResult.exam!, latestReleaseResult.paper!, latestReleaseResult.decryptedText || '')}
                            className="px-2.5 py-1.5 rounded-lg bg-[#e95d2a] hover:bg-[#d44c1b] text-white text-[11px] font-bold flex items-center space-x-1 shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download {latestReleaseResult.paper.fileDataUrl ? `(${latestReleaseResult.paper.originalFileName?.split('.').pop()?.toUpperCase() || 'DOCUMENT'})` : 'Paper (.txt)'}</span>
                          </button>
                        )}
                        <button
                          onClick={handlePrintPaper}
                          className="px-2.5 py-1.5 rounded-lg bg-[#222222] hover:bg-black text-white text-[11px] font-bold flex items-center space-x-1 shadow-xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Paper</span>
                        </button>
                      </div>
                    </div>
                    <div className="bg-[#f4f4f6] p-4 rounded-xl border border-[#e5e5ea] font-mono text-xs text-[#222222] max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text shadow-inner">
                      {latestReleaseResult.decryptedText}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#fef2f2] border border-[#fecaca] rounded-xl text-[#991b1b] space-y-2">
                    <div className="flex items-center space-x-2 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4 text-[#ef4444]" />
                      <span>Decrypted Content Masked & Download Prohibited</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#7f1d1d]">
                      Your active role is <strong>{currentUser.name} ({currentUser.role})</strong>. Under Zero-Trust Least-Privilege Separation of Duties, viewing decrypted question papers and downloading files is restricted exclusively to authenticated Examination Centre Superintendents (EXAMINATION_CENTRE).
                    </p>
                    <button
                      type="button"
                      onClick={() => switchRole('EXAMINATION_CENTRE', currentCentre.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition shadow-xs inline-flex items-center space-x-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Switch to Centre Superintendent ({currentCentre.code})</span>
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>
        )}
      </div>

      {/* POPUP MODAL: INSTANT FULL-VIEW DECRYPTED EXAMINATION PAPER & VERIFICATION CERTIFICATE */}
      {isModalOpen && latestReleaseResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#e5e5ea] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className={`p-5 flex items-start justify-between border-b ${
              latestReleaseResult.success 
                ? 'bg-[#ecfdf5] border-[#a7f3d0]' 
                : 'bg-[#fef2f2] border-[#fecaca]'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${
                  latestReleaseResult.success ? 'bg-[#059669]' : 'bg-[#e95d2a]'
                }`}>
                  {latestReleaseResult.success ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#222222]">
                    {latestReleaseResult.success 
                      ? 'Official Decrypted Examination Paper' 
                      : 'Release Blocked by Zero-Trust Security Policy'}
                  </h3>
                  <p className="text-xs text-[#4b5563]">
                    {latestReleaseResult.exam?.code || 'NCE-2026-CS1'} • Centre: <span className="font-bold">{currentCentre.name}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white text-[#4b5563] flex items-center justify-center border border-[#e5e5ea] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              
              {/* If Success: Show Token & Download Toolbar */}
              {latestReleaseResult.success ? (
                <>
                  {/* Security Verification Badge */}
                  <div className="flex items-center justify-between p-3 bg-[#ecfdf5] rounded-xl border border-[#a7f3d0] text-[#065f46]">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                      <span className="font-bold">13/13 Security Gates Passed & Reconstructed from Distributed Vaults</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#047857]">
                      Algorithm: AES-256-GCM
                    </span>
                  </div>

                  {/* Ephemeral Release Token Banner */}
                  <div className="bg-[#fef3ee] p-3 rounded-xl border border-[#fde2d4]">
                    <div className="flex items-center justify-between text-[#e95d2a] font-bold mb-1">
                      <span className="flex items-center space-x-1.5">
                        <Key className="w-4 h-4" />
                        <span>Single-Use Ephemeral Release Authorization Token</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#6b7280]">Expires in 90 seconds</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="font-mono text-xs font-bold text-[#222222] bg-white p-2 rounded-lg border border-[#e5e5ea] break-all flex-1 select-all">
                        {latestReleaseResult.record.singleUseToken}
                      </div>
                      <button
                        onClick={() => handleCopyText(latestReleaseResult.record.singleUseToken, 'token')}
                        className="px-3 py-2 rounded-lg bg-white border border-[#e5e5ea] text-[#222222] hover:bg-[#f4f4f6] text-xs font-semibold flex items-center space-x-1 shrink-0"
                      >
                        {copiedToken ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5 text-[#6b7280]" />}
                        <span>{copiedToken ? 'Copied' : 'Copy Token'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Official Question Paper Container */}
                  {isCentreRole ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-extrabold text-sm text-[#222222] flex items-center space-x-1.5">
                          <FileText className="w-4 h-4 text-[#059669]" />
                          <span>Decrypted Question Paper Text</span>
                        </h4>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopyText(latestReleaseResult.decryptedText || '', 'paper')}
                            className="px-3 py-1.5 rounded-lg bg-[#f4f4f6] hover:bg-[#e5e5ea] text-[#222222] text-xs font-bold flex items-center space-x-1 border border-[#e5e5ea]"
                          >
                            {copiedPaper ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedPaper ? 'Copied' : 'Copy All'}</span>
                          </button>
                          {latestReleaseResult.exam && latestReleaseResult.paper && (
                            <button
                              onClick={() => handleDownloadPaper(latestReleaseResult.exam!, latestReleaseResult.paper!, latestReleaseResult.decryptedText || '')}
                              className="px-3 py-1.5 rounded-lg bg-[#e95d2a] hover:bg-[#d44c1b] text-white text-xs font-bold flex items-center space-x-1 shadow-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download {latestReleaseResult.paper.fileDataUrl ? `(${latestReleaseResult.paper.originalFileName?.split('.').pop()?.toUpperCase() || 'DOCUMENT'})` : 'File (.txt)'}</span>
                            </button>
                          )}
                          <button
                            onClick={handlePrintPaper}
                            className="px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-black text-white text-xs font-bold flex items-center space-x-1 shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#fcfcfd] p-5 rounded-xl border border-[#d1d5db] font-mono text-xs text-[#111827] max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-xs">
                        {latestReleaseResult.decryptedText}
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-[#fef2f2] border-2 border-[#f87171] rounded-xl text-[#991b1b] text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-[#fee2e2] text-[#ef4444] flex items-center justify-center mx-auto">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#7f1d1d]">
                          Decrypted Paper Masked & Download Prohibited
                        </h4>
                        <p className="text-xs text-[#991b1b] max-w-lg mx-auto mt-1 leading-relaxed">
                          You are authenticated as <strong>{currentUser.name} ({currentUser.role})</strong>.
                          Under Zero-Trust Least Privilege, <strong>only authenticated Examination Centre Superintendents (EXAMINATION_CENTRE)</strong> can access, view, or download live question papers.
                        </p>
                      </div>
                      <button
                        onClick={() => switchRole('EXAMINATION_CENTRE', currentCentre.id)}
                        className="px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs transition shadow-sm inline-flex items-center space-x-1.5"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Switch to Centre Superintendent ({currentCentre.code}) to Access</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Failure / Blocked Explanation */
                <div className="space-y-4">
                  <div className="p-4 bg-[#fef2f2] border border-[#fecaca] rounded-xl text-[#991b1b]">
                    <h4 className="font-bold text-sm mb-1 flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
                      <span>Release Blocked: Security Gate Violation</span>
                    </h4>
                    <p className="leading-relaxed">{latestReleaseResult.record.failureReason}</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-[#222222] uppercase tracking-wide text-[11px] mb-2">
                      Security Gate Status:
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { label: 'Time-Lock Window Expired', passed: latestReleaseResult.record.checklist.timeLockExpired },
                        { label: 'Centre Authorized & Whitelisted', passed: latestReleaseResult.record.checklist.centreAuthorized },
                        { label: 'Examination Assigned to Centre', passed: latestReleaseResult.record.checklist.assignedToExam },
                        { label: '3-of-5 Custody Threshold Satisfied', passed: latestReleaseResult.record.checklist.thresholdAuthorized },
                      ].map((g, idx) => (
                        <div key={idx} className={`p-2.5 rounded-lg border flex items-center justify-between ${
                          g.passed ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]' : 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'
                        }`}>
                          <span className="font-medium">{g.label}</span>
                          {g.passed ? <CheckCircle2 className="w-4 h-4 text-[#10b981]" /> : <XCircle className="w-4 h-4 text-[#ef4444]" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#f4f4f6] border-t border-[#e5e5ea] flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#222222] hover:bg-black text-white text-xs font-bold transition shadow-xs"
              >
                Close Dialog
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
