import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';

export const SetterView: React.FC = () => {
  const { 
    currentUser, 
    switchRole, 
    papers, 
    examinations, 
    createPaper, 
    submitPaper 
  } = useApp();

  const [selectedExamId, setSelectedExamId] = useState(examinations[0]?.id || '');
  const [paperTitle, setPaperTitle] = useState('Advanced Quantum Computing & Cryptography');
  const [subject, setSubject] = useState('Computer Science & Physical Sciences');
  const [fileName, setFileName] = useState('Quantum_Crypto_2026_Final.pdf');
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

  const handleCreateAndEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSetter) {
      alert('Must be in QUESTION_SETTER role to upload papers.');
      return;
    }
    setIsEncrypting(true);
    setCreatedFeedback(null);
    try {
      const paperId = await createPaper(selectedExamId, paperTitle, subject, content, fileName);
      setCreatedFeedback(`Question Paper ${paperId} encrypted via AES-256-GCM and fragmented into Store A, B, and C.`);
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
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) {
          setContent(text);
        }
      };
      // For demo, if text or binary fallback
      try {
        reader.readAsText(file);
      } catch {
        setContent(`[Binary PDF file uploaded: ${file.name} - Size: ${file.size} bytes]`);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Role Notice if not Question Setter */}
      {!isSetter && (
        <div className="bg-[#fffbeb] border border-[#fde68a] p-4 rounded-xl flex items-center justify-between text-xs text-[#92400e]">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-[#d97706] shrink-0" />
            <span>
              You are currently logged in as <strong>{currentUser.name} ({currentUser.role})</strong>.
              To create and upload papers, switch to the Question Setter role.
            </span>
          </div>
          <button
            onClick={() => switchRole('QUESTION_SETTER')}
            className="px-3 py-1.5 rounded-lg bg-[#e95d2a] text-white font-bold hover:bg-[#d44c1b] transition shrink-0"
          >
            Switch to Question Setter
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
            </div>

            {createdFeedback && (
              <div className="p-3 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] text-xs text-[#065f46] flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-[#10b981]" />
                <span className="font-semibold">{createdFeedback}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isEncrypting || !isSetter}
              className="w-full py-2.5 rounded-lg bg-[#e95d2a] hover:bg-[#d44c1b] text-white font-bold text-xs transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isEncrypting ? 'Encrypting & Fragmenting...' : 'Encrypt with AES-256-GCM & Generate Split Storage (Store A, B, C)'}</span>
            </button>

          </form>
        </div>

        {/* Right Column: Cryptographic Architecture Explainer & My Papers (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
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
