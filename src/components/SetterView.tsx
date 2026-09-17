import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Upload, 
  ShieldCheck, 
  Lock, 
  CheckCircle, 
  Send, 
  Layers, 
  Cpu, 
  Database,
  ArrowRight,
  Info,
  AlertCircle,
  ExternalLink,
  Clock,
  Calendar,
  Sparkles,
  Timer
} from 'lucide-react';

export const SetterView: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { 
    currentUser, 
    switchRole, 
    papers, 
    examinations, 
    createPaper, 
    updateExamSchedule,
    submitPaper,
    serverTime
  } = useApp();

  const [selectedExamId, setSelectedExamId] = useState(examinations[0]?.id || '');
  const [paperTitle, setPaperTitle] = useState('Advanced Quantum Computing & Cryptography');
  const [subject, setSubject] = useState('Computer Science & Physical Sciences');
  const [fileName, setFileName] = useState('Quantum_Crypto_2026_Final.pdf');
  const [fileMimeType, setFileMimeType] = useState('application/pdf');
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [autoSubmitForReview, setAutoSubmitForReview] = useState(true);
  const [createdPaperId, setCreatedPaperId] = useState<string | null>(null);
  const [content, setContent] = useState(`================================================================================
CONFIDENTIAL COMPETITIVE EXAMINATION QUESTION PAPER
SUBJECT: ADVANCED QUANTUM COMPUTING & POST-QUANTUM CRYPTOGRAPHY
================================================================================
SECTION A (50 MARKS):
1. Derive Shor's quantum period-finding algorithm for factoring integers N in polynomial time.
2. Analyze the lattice-based Learning With Errors (LWE) hardness reduction.
3. Compare CRYSTALS-Kyber vs Classic McEliece key sizes and decapsulation throughput.
================================================================================`);

  const [isEncrypting, setIsEncrypting] = useState(false);
  const [createdFeedback, setCreatedFeedback] = useState<string | null>(null);

  const isSetter = currentUser.role === 'QUESTION_SETTER';

  const myPapers = papers.filter(p => p.createdBy === 'user-setter' || p.createdBy === currentUser.id);

  // Helper to format ISO to datetime-local string (YYYY-MM-DDTHH:mm)
  const formatDateTimeLocal = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  const selectedExam = examinations.find(e => e.id === selectedExamId) || examinations[0];

  const [scheduleDate, setScheduleDate] = useState(selectedExam?.examDate || '2026-09-16');
  const [scheduleReleaseTime, setScheduleReleaseTime] = useState(
    selectedExam ? formatDateTimeLocal(selectedExam.releaseTime) : ''
  );
  const [scheduleDuration, setScheduleDuration] = useState(selectedExam?.durationMinutes || 180);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState<string | null>(null);

  // Synchronize release schedule fields when selected examination changes
  useEffect(() => {
    if (selectedExam) {
      setScheduleDate(selectedExam.examDate);
      setScheduleReleaseTime(formatDateTimeLocal(selectedExam.releaseTime));
      setScheduleDuration(selectedExam.durationMinutes);
    }
  }, [selectedExamId, selectedExam?.releaseTime]);

  const currentExamReleaseTimeMs = selectedExam ? new Date(selectedExam.releaseTime).getTime() : 0;
  const isTimeUnlocked = serverTime.getTime() >= currentExamReleaseTimeMs;
  const secondsRemaining = Math.max(0, Math.ceil((currentExamReleaseTimeMs - serverTime.getTime()) / 1000));
  const remHours = Math.floor(secondsRemaining / 3600);
  const remMins = Math.floor((secondsRemaining % 3600) / 60);
  const remSecs = secondsRemaining % 60;

  const handleSaveSchedule = () => {
    if (!selectedExamId) return;
    const releaseTimeIso = new Date(scheduleReleaseTime).toISOString();
    updateExamSchedule(selectedExamId, {
      examDate: scheduleDate,
      releaseTime: releaseTimeIso,
      durationMinutes: Number(scheduleDuration),
    });
    setScheduleSuccessMsg(`Release schedule for ${selectedExam?.code} updated to ${new Date(releaseTimeIso).toLocaleString()}!`);
    setTimeout(() => setScheduleSuccessMsg(null), 4000);
  };

  const applyTimingPreset = (preset: 'OPEN_NOW' | 'IN_15M' | 'IN_1H' | 'TOMORROW') => {
    let targetDate = new Date(serverTime.getTime());
    if (preset === 'OPEN_NOW') {
      targetDate = new Date(serverTime.getTime() - 2 * 60 * 1000); // 2 mins in the past: immediately open
    } else if (preset === 'IN_15M') {
      targetDate = new Date(serverTime.getTime() + 15 * 60 * 1000);
    } else if (preset === 'IN_1H') {
      targetDate = new Date(serverTime.getTime() + 60 * 60 * 1000);
    } else if (preset === 'TOMORROW') {
      targetDate = new Date(serverTime.getTime() + 24 * 60 * 60 * 1000);
      targetDate.setHours(9, 0, 0, 0);
    }
    const dtLocal = formatDateTimeLocal(targetDate.toISOString());
    setScheduleReleaseTime(dtLocal);
    const dateStr = targetDate.toISOString().slice(0, 10);
    setScheduleDate(dateStr);

    if (selectedExamId) {
      updateExamSchedule(selectedExamId, {
        examDate: dateStr,
        releaseTime: targetDate.toISOString(),
        durationMinutes: Number(scheduleDuration),
      });
      setScheduleSuccessMsg(`Release schedule configured to ${preset === 'OPEN_NOW' ? 'Open Window (Immediate Release)' : targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`);
      setTimeout(() => setScheduleSuccessMsg(null), 4000);
    }
  };

  const handleCreateAndEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSetter) {
      alert(`Separation of Duties Violation: You are currently authenticated as ${currentUser.name} (${currentUser.role}). Administrators and Reviewers are strictly forbidden from setting or authoring question papers. Switch to the Question Setter persona to author papers.`);
      return;
    }
    setIsEncrypting(true);
    setCreatedFeedback(null);
    setCreatedPaperId(null);
    try {
      const releaseIso = scheduleReleaseTime ? new Date(scheduleReleaseTime).toISOString() : undefined;
      const paperId = await createPaper(
        selectedExamId, 
        paperTitle, 
        subject, 
        content, 
        fileName,
        {
          examDate: scheduleDate,
          releaseTime: releaseIso,
          durationMinutes: Number(scheduleDuration)
        },
        autoSubmitForReview,
        fileDataUrl,
        fileMimeType
      );
      setCreatedPaperId(paperId);

      if (autoSubmitForReview) {
        setCreatedFeedback(`Question Paper [${paperId}] encrypted (AES-256-GCM), locked to release schedule (${new Date(releaseIso || '').toLocaleTimeString()}), and successfully SUBMITTED for Academic Review!`);
      } else {
        setCreatedFeedback(`Question Paper [${paperId}] encrypted via AES-256-GCM and fragmented into Store A, B, and C as a DRAFT.`);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileMimeType(file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'text/plain'));

      // 1. Read as Data URL so original binary document (PDF, Word, etc.) is preserved for 1:1 download upon release
      const urlReader = new FileReader();
      urlReader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) {
          setFileDataUrl(dataUrl);
        }
      };
      urlReader.readAsDataURL(file);

      // 2. Read as Text / extract readable preview for reviewer & printing
      const isPdf = file.name.toLowerCase().endsWith('.pdf');
      const isDoc = file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc');

      if (isPdf || isDoc) {
        const textReader = new FileReader();
        textReader.onload = (ev) => {
          const raw = ev.target?.result as string;
          if (raw) {
            // Attempt to extract readable text strings from PDF syntax: (text) Tj
            const matches: string[] = [];
            const regex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
            let match;
            while ((match = regex.exec(raw)) !== null) {
              const cleaned = match[1].replace(/\\([()\\])/g, '$1').trim();
              if (cleaned.length > 2 && !cleaned.startsWith('Font') && !cleaned.startsWith('ProcSet') && !cleaned.startsWith('Identity')) {
                matches.push(cleaned);
              }
            }

            if (matches.length > 2) {
              setContent(`================================================================================\nCONFIDENTIAL EXAMINATION QUESTION PAPER\nATTACHMENT: ${file.name} (${(file.size / 1024).toFixed(1)} KB)\n================================================================================\n${matches.join('\n')}\n================================================================================`);
            } else {
              setContent(`================================================================================\nCONFIDENTIAL COMPETITIVE EXAMINATION QUESTION PAPER\nORIGINAL DOCUMENT: ${file.name} (${(file.size / 1024).toFixed(1)} KB)\n================================================================================\n[Binary document attached and cryptographically secured: ${file.name}]\n\nSECTION A - EXAMINATION QUESTIONS:\n1. Question text uploaded from ${file.name}.\n2. Answer all questions within the prescribed exam duration.\n================================================================================\n(The original ${file.name} is stored in full binary fidelity and will be downloaded in original ${file.name.split('.').pop()?.toUpperCase()} format upon centre release)`);
            }
          }
        };
        try {
          textReader.readAsText(file);
        } catch {
          setContent(`[Confidential Question Paper: ${file.name} - Size: ${(file.size / 1024).toFixed(1)} KB]\nReady for encryption and threshold fragmentation.`);
        }
      } else {
        // Plain text, Markdown, CSV, etc.
        const textReader = new FileReader();
        textReader.onload = (ev) => {
          const raw = ev.target?.result as string;
          if (raw) {
            setContent(raw);
          }
        };
        textReader.readAsText(file);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Role Notice if not Question Setter */}
      {!isSetter && (
        <div className="bg-[#fffbeb] border border-[#fde68a] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#92400e]">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-[#d97706] shrink-0" />
            <span>
              <strong>Separation of Duties RBAC Lock:</strong> You are currently authenticated as <strong>{currentUser.name} ({currentUser.role})</strong>.
              Administrators and Reviewers are strictly barred from setting or authoring question papers. Only users with the <strong>QUESTION_SETTER</strong> role can encrypt and upload papers.
            </span>
          </div>
          <button
            onClick={() => switchRole('QUESTION_SETTER')}
            className="px-3 py-1.5 rounded-lg bg-[#e95d2a] text-white font-bold hover:bg-[#d44c1b] transition shrink-0 self-start sm:self-auto"
          >
            Switch to Question Setter (Dr. Aris Thorne)
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-[#e5e5ea] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#e95d2a] flex items-center justify-center text-white">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-[#222222] tracking-tight">
                  Question Setter Studio
                </h1>
                <p className="text-xs text-[#6b7280]">
                  Client-side pre-flight validation • Zero-plaintext storage policy • AES-256-GCM fragmented pipeline
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-[#f4f4f6] border border-[#e5e5ea] text-[#4b5563] font-medium">
              Zero-Plaintext Policy: <strong>ACTIVE</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Upload & Encrypt Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#e5e5ea] shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea]">
            <h2 className="font-extrabold text-sm text-[#222222] tracking-tight flex items-center space-x-2">
              <Upload className="w-4 h-4 text-[#e95d2a]" />
              <span>Create & Encrypt Question Paper</span>
            </h2>
            <span className="text-[11px] font-mono text-[#6b7280]">Draft Stage</span>
          </div>

          <form onSubmit={handleCreateAndEncrypt} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                Target Competitive Examination
              </label>
              <select
                value={selectedExamId}
                onChange={e => setSelectedExamId(e.target.value)}
                className="w-full px-3 py-2 border border-[#e5e5ea] rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#e95d2a] focus:outline-none"
              >
                {examinations.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.code} - {exam.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Examination Release Schedule & Time-Lock Policy */}
            <div className="p-4 rounded-xl border border-[#e5e5ea] bg-[#fafafa] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#222222] flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-[#e95d2a]" />
                  <span>Release Schedule & Time-Lock Policy</span>
                </label>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 ${
                  isTimeUnlocked 
                    ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]' 
                    : 'bg-[#fef3ee] text-[#e95d2a] border border-[#fde2d4]'
                }`}>
                  {isTimeUnlocked ? <CheckCircle className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span>
                    {isTimeUnlocked 
                      ? 'WINDOW OPEN / ELAPSED' 
                      : `TIME-LOCKED: ${remHours}h ${remMins}m ${remSecs}s`}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#4b5563] mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#d1d5db] rounded-lg text-xs bg-white focus:ring-1 focus:ring-[#e95d2a]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#4b5563] mb-1 flex items-center justify-between">
                    <span>Decryption Release Window</span>
                    <span className="text-[10px] text-[#6b7280] font-normal font-mono">
                      Current Server: {serverTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleReleaseTime}
                    onChange={e => setScheduleReleaseTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#d1d5db] rounded-lg text-xs bg-white font-mono focus:ring-1 focus:ring-[#e95d2a]"
                  />
                </div>
              </div>

              {/* Quick Timing Presets */}
              <div>
                <div className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wide mb-1.5 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-[#e95d2a]" />
                  <span>Release Timing Presets:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyTimingPreset('OPEN_NOW')}
                    className="px-2 py-1 rounded bg-white hover:bg-[#ecfdf5] border border-[#d1d5db] hover:border-[#a7f3d0] text-[10px] font-bold text-[#059669] transition shadow-2xs"
                  >
                    ⚡ Open Window (Immediate Testing)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTimingPreset('IN_15M')}
                    className="px-2 py-1 rounded bg-white hover:bg-[#fef3ee] border border-[#d1d5db] hover:border-[#fde2d4] text-[10px] font-bold text-[#e95d2a] transition shadow-2xs"
                  >
                    ⏱️ +15m Pre-Exam Staging
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTimingPreset('IN_1H')}
                    className="px-2 py-1 rounded bg-white hover:bg-[#f4f4f6] border border-[#d1d5db] text-[10px] font-medium text-[#222222] transition shadow-2xs"
                  >
                    🔒 +1h Time-Lock
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTimingPreset('TOMORROW')}
                    className="px-2 py-1 rounded bg-white hover:bg-[#f4f4f6] border border-[#d1d5db] text-[10px] font-medium text-[#222222] transition shadow-2xs"
                  >
                    📅 Tomorrow 09:00 AM
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#e5e5ea] text-[11px]">
                <span className="text-[#6b7280]">
                  Paper payload is cryptographically locked until this timestamp.
                </span>
                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  className="px-2.5 py-1 rounded bg-[#222222] hover:bg-black text-white text-[11px] font-bold transition flex items-center space-x-1"
                >
                  <Clock className="w-3 h-3 text-[#e95d2a]" />
                  <span>Update Schedule</span>
                </button>
              </div>

              {scheduleSuccessMsg && (
                <div className="p-2 rounded bg-[#ecfdf5] border border-[#a7f3d0] text-[11px] font-semibold text-[#065f46] flex items-center space-x-1.5 animate-in fade-in">
                  <CheckCircle className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                  <span>{scheduleSuccessMsg}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">
                  Paper Title
                </label>
                <input
                  type="text"
                  required
                  value={paperTitle}
                  onChange={e => setPaperTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e5ea] rounded-lg text-xs focus:ring-2 focus:ring-[#e95d2a] focus:outline-none"
                  placeholder="e.g. Advanced Cryptography Set A"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">
                  Subject / Discipline
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e5ea] rounded-lg text-xs focus:ring-2 focus:ring-[#e95d2a] focus:outline-none"
                  placeholder="e.g. Computer Science"
                />
              </div>
            </div>

            {/* File Upload Zone */}
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                Question Paper Document (PDF / Confidential Text)
              </label>
              <div className="border-2 border-dashed border-[#e5e5ea] hover:border-[#e95d2a] transition rounded-lg p-4 bg-[#f4f4f6]/40 text-center">
                <input 
                  type="file" 
                  accept=".pdf,.txt,.docx" 
                  onChange={handleFileUploadSim}
                  className="hidden" 
                  id="pdf-upload-input" 
                />
                <label htmlFor="pdf-upload-input" className="cursor-pointer">
                  <Upload className="w-6 h-6 text-[#e95d2a] mx-auto mb-1.5" />
                  <span className="text-xs font-bold text-[#222222] block">
                    Click to select Question Paper PDF or drag & drop
                  </span>
                  <span className="text-[11px] text-[#6b7280]">
                    Current attachment: <span className="font-mono font-semibold text-[#e95d2a]">{fileName}</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Questions Text Editor preview */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#222222]">
                  Raw Question Content (To be encrypted with AES-256-GCM)
                </label>
                <span className="text-[10px] text-[#6b7280] font-mono">
                  {new Blob([content]).size} bytes
                </span>
              </div>
              <textarea
                rows={7}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-[#e5e5ea] rounded-lg text-xs font-mono bg-[#f4f4f6]/30 focus:ring-2 focus:ring-[#e95d2a] focus:outline-none leading-relaxed"
              />
              <p className="mt-1 text-[11px] text-[#6b7280]">
                <strong>Note on Content Fidelity:</strong> The text in this editor represents the exact plaintext that will be encrypted with AES-256-GCM. Once encrypted, the plaintext is purged from memory under Zero-Trust policy; only authorized Examination Centres can decrypt it during the exam window.
              </p>
            </div>

            {/* Auto-Submit for Academic Review Checkbox */}
            <div className="p-3 bg-[#f4f4f6] rounded-lg border border-[#e5e5ea] flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoSubmitForReview}
                  onChange={e => setAutoSubmitForReview(e.target.checked)}
                  className="rounded border-[#d1d5db] text-[#e95d2a] focus:ring-[#e95d2a] w-4 h-4"
                />
                <span className="font-bold text-[#222222]">
                  Automatically Submit for Academic Review upon encryption
                </span>
              </label>
              <span className="text-[11px] text-[#6b7280]">
                {autoSubmitForReview ? 'Status: SUBMITTED' : 'Status: DRAFT'}
              </span>
            </div>

            {createdFeedback && (
              <div className="p-3.5 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] text-xs text-[#065f46] space-y-2.5">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-[#10b981]" />
                  <span className="font-bold">{createdFeedback}</span>
                </div>

                {onNavigateTab && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#a7f3d0]/60">
                    <button
                      type="button"
                      onClick={() => onNavigateTab('reviewer')}
                      className="px-2.5 py-1 rounded bg-[#065f46] hover:bg-[#044e39] text-white font-bold text-[11px] transition flex items-center space-x-1"
                    >
                      <span>Go to Reviewer Station</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('admin')}
                      className="px-2.5 py-1 rounded bg-white hover:bg-[#f4f4f6] text-[#065f46] border border-[#a7f3d0] font-bold text-[11px] transition flex items-center space-x-1"
                    >
                      <span>Admin Custody & Seal</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('centre')}
                      className="px-2.5 py-1 rounded bg-white hover:bg-[#f4f4f6] text-[#065f46] border border-[#a7f3d0] font-bold text-[11px] transition flex items-center space-x-1"
                    >
                      <span>Centre Release Station</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isEncrypting || !isSetter}
              className="w-full py-2.5 rounded-lg bg-[#e95d2a] hover:bg-[#d44c1b] text-white font-bold text-xs transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
              title={!isSetter ? `Action Blocked: Only QUESTION_SETTER role can create papers. Current role: ${currentUser.role}` : ''}
            >
              <Lock className="w-4 h-4" />
              <span>
                {!isSetter
                  ? `Authoring Blocked (${currentUser.role} Role - Must be QUESTION_SETTER)`
                  : isEncrypting 
                    ? 'Encrypting & Fragmenting...' 
                    : autoSubmitForReview 
                      ? 'Encrypt AES-256-GCM, Fragment & Submit for Review' 
                      : 'Encrypt AES-256-GCM & Save as Draft'}
              </span>
            </button>

          </form>
        </div>

        {/* Right Column: Cryptographic Architecture Explainer, Release Schedules & My Papers (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Master Examination Release Schedules Card */}
          <div className="bg-white rounded-xl border border-[#e5e5ea] shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5e5ea]">
              <h3 className="font-extrabold text-xs text-[#222222] uppercase tracking-wide flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#e95d2a]" />
                <span>Examination Release Schedules ({examinations.length})</span>
              </h3>
              <span className="text-[10px] font-mono text-[#6b7280]">
                Server: {serverTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <p className="text-xs text-[#6b7280]">
              Decryption keys and 13-gate release authorization are strictly locked until scheduled release time.
            </p>

            <div className="space-y-2.5">
              {examinations.map(exam => {
                const isSelected = exam.id === selectedExamId;
                const examPapers = papers.filter(p => p.examinationId === exam.id);
                const examReleaseMs = new Date(exam.releaseTime).getTime();
                const isExamOpen = serverTime.getTime() >= examReleaseMs;
                const examSecsLeft = Math.max(0, Math.ceil((examReleaseMs - serverTime.getTime()) / 1000));
                const eHours = Math.floor(examSecsLeft / 3600);
                const eMins = Math.floor((examSecsLeft % 3600) / 60);
                const eSecs = examSecsLeft % 60;

                return (
                  <div
                    key={exam.id}
                    onClick={() => setSelectedExamId(exam.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition space-y-2 ${
                      isSelected 
                        ? 'bg-[#fef3ee]/60 border-[#e95d2a] ring-1 ring-[#e95d2a]/30' 
                        : 'bg-[#fafafa] hover:bg-[#f4f4f6] border-[#e5e5ea]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-[#222222] flex items-center space-x-1.5">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#e5e5ea] text-[#e95d2a]">
                            {exam.code}
                          </span>
                          <span>{exam.name}</span>
                        </div>
                        <div className="text-[10px] text-[#6b7280] mt-0.5">
                          Exam Date: <strong>{exam.examDate}</strong> • Window: <strong>{new Date(exam.releaseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 flex items-center space-x-1 ${
                        isExamOpen 
                          ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]' 
                          : 'bg-[#fef3ee] text-[#e95d2a] border border-[#fde2d4]'
                      }`}>
                        {isExamOpen ? <CheckCircle className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>
                          {isExamOpen 
                            ? 'OPEN' 
                            : `${eHours}h ${eMins}m ${eSecs}s`}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#e5e5ea]/80">
                      <span className="text-[#6b7280]">
                        {examPapers.length === 0 ? 'No papers assigned' : (
                          <span className="font-medium text-[#222222]">
                            {examPapers.length} {examPapers.length === 1 ? 'Paper' : 'Papers'} • {examPapers.filter(p => p.sealed).length} Sealed
                          </span>
                        )}
                      </span>
                      {isSelected ? (
                        <span className="text-[10px] font-bold text-[#e95d2a]">
                          Selected Exam ✓
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#6b7280] hover:text-[#222222]">
                          Click to manage schedule →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zero-Trust Encryption Pipeline Card */}
          <div className="bg-[#222222] text-white rounded-xl p-5 border border-[#333333] shadow-xs space-y-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#e95d2a]" />
              <h3 className="font-extrabold text-xs tracking-tight uppercase">
                Zero-Trust Split-Seal Pipeline
              </h3>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-start space-x-2 bg-[#2d2d30] p-2 rounded border border-[#3f3f46]">
                <div className="w-5 h-5 rounded-full bg-[#e95d2a] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                <div>
                  <div className="font-bold">AES-256-GCM Encryption</div>
                  <div className="text-[10px] text-[#9ca3af]">256-bit random key, 96-bit IV, 128-bit authentication tag.</div>
                </div>
              </div>

              <div className="flex items-start space-x-2 bg-[#2d2d30] p-2 rounded border border-[#3f3f46]">
                <div className="w-5 h-5 rounded-full bg-[#e95d2a] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                <div>
                  <div className="font-bold">Split-Seal Storage Fragmentation</div>
                  <div className="text-[10px] text-[#9ca3af]">Encrypted payload sliced into Store A, Store B, and Store C with independent SHA-256 checksums.</div>
                </div>
              </div>

              <div className="flex items-start space-x-2 bg-[#2d2d30] p-2 rounded border border-[#3f3f46]">
                <div className="w-5 h-5 rounded-full bg-[#e95d2a] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                <div>
                  <div className="font-bold">Zero-Plaintext Deletion</div>
                  <div className="text-[10px] text-[#9ca3af]">Unencrypted file is immediately expunged from memory. No single vault can reconstruct the document.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Setter's Papers */}
          <div className="bg-white rounded-xl border border-[#e5e5ea] shadow-xs p-5 space-y-3">
            <h3 className="font-extrabold text-xs text-[#222222] uppercase tracking-wide flex items-center space-x-2 pb-2 border-b border-[#e5e5ea]">
              <Database className="w-4 h-4 text-[#e95d2a]" />
              <span>Authored Papers ({myPapers.length})</span>
            </h3>

            {myPapers.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#6b7280]">
                No question papers authored yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {myPapers.map(paper => (
                  <div 
                    key={paper.id}
                    className="p-3 rounded-lg border border-[#e5e5ea] bg-[#f4f4f6]/30 text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-[#222222]">{paper.title}</div>
                        <div className="text-[10px] text-[#6b7280] font-mono">{paper.examCode} • {paper.id}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        paper.status === 'DRAFT' ? 'bg-[#f4f4f6] text-[#4b5563] border border-[#e5e5ea]' :
                        paper.status === 'SUBMITTED' ? 'bg-[#fffbeb] text-[#92400e] border border-[#fde68a]' :
                        'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                      }`}>
                        {paper.status}
                      </span>
                    </div>

                    {/* Fragments summary */}
                    <div className="grid grid-cols-3 gap-1 text-[9px] font-mono">
                      {paper.fragments.map(f => (
                        <div key={f.id} className="p-1 rounded bg-white border border-[#e5e5ea] text-center">
                          <span className="text-[#e95d2a] font-bold block">Frag {f.fragmentNumber}</span>
                          <span className="text-[#6b7280] truncate block">{f.checksum.slice(0, 8)}...</span>
                        </div>
                      ))}
                    </div>

                    {paper.status === 'DRAFT' && isSetter && (
                      <button
                        onClick={() => submitPaper(paper.id)}
                        className="w-full py-1.5 rounded bg-[#222222] hover:bg-black text-white text-[11px] font-bold transition flex items-center justify-center space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5 text-[#e95d2a]" />
                        <span>Submit for Academic Review</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
