/**
 * Zero-Trust Split-Seal Competitive Examination Question Paper Management System
 * Core Data Models & Typings
 */

export type UserRole = 
  | 'QUESTION_SETTER'
  | 'REVIEWER'
  | 'ADMIN'
  | 'EXAMINATION_CENTRE'
  | 'EXAMINATION_AUTHORITY'
  | 'SECURITY_AUTHORITY'
  | 'BACKUP_AUTHORITY';

export type PaperStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVIEW_APPROVED'
  | 'AUTHORITY_APPROVED'
  | 'SEALED'
  | 'TIME_LOCKED'
  | 'RELEASED'
  | 'REJECTED';

export type SeverityLevel = 'INFO' | 'WARNING' | 'CRITICAL';
export type ActionResult = 'SUCCESS' | 'BLOCKED' | 'FAILED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'LOCKED' | 'SUSPENDED';
  mfaEnabled: boolean;
  mfaSecret?: string;
  centreId?: string; // For EXAMINATION_CENTRE
  failedLoginAttempts: number;
  lastLogin?: string;
  createdAt: string;
}

export interface Examination {
  id: string;
  name: string;
  code: string;
  examDate: string; // YYYY-MM-DD
  releaseTime: string; // ISO timestamp
  durationMinutes: number;
  totalMarks: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  centreIds: string[];
  createdAt: string;
}

export interface QuestionPaperFragment {
  id: string;
  paperId: string;
  fragmentNumber: number; // 1, 2, 3
  storageName: string; // "Store A (Encrypted Head)", "Store B (Encrypted Body)", "Store C (Encrypted Tail & Auth Tag)"
  storagePath: string; // e.g., /storage/vault-alpha/frag_1.bin
  checksum: string; // SHA-256 of this fragment
  originalChecksum: string;
  dataBase64: string; // Actual AES ciphertext segment
  isCorrupted: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  paperId: string;
  reviewerId: string;
  reviewerName: string;
  decision: 'APPROVED' | 'REJECTED' | 'REQUEST_CHANGES';
  comments: string;
  reviewedAt: string;
}

export interface ApprovalShare {
  shareIndex: number;
  holderTitle: string;
  holderRole: string;
  approved: boolean;
  approvedAt?: string;
  signatureToken?: string;
}

export interface QuestionPaper {
  id: string;
  examinationId: string;
  examinationName: string;
  examCode: string;
  title: string;
  subject: string;
  createdBy: string;
  createdByName: string;
  version: string;
  status: PaperStatus;
  sealed: boolean;
  sealedAt?: string;
  fileHash: string; // SHA-256 of the original plain document
  signature: string; // Digital signature of the metadata/hash
  signaturePublicKey: string; // Public key for signature verification
  encryptionIv: string; // Initialization Vector (96-bit base64)
  authTag: string; // AES-GCM Auth tag
  originalFileName: string;
  fileSize: number; // in bytes
  fileMimeType?: string; // MIME type of original document
  fileDataUrl?: string; // Original file data URL for exact 1:1 file downloads
  sampleContent: string; // Sample decrypted questions preview for authorized release
  fragments: QuestionPaperFragment[];
  reviews: Review[];
  thresholdShares: ApprovalShare[]; // 3-of-5 model
  createdAt: string;
  updatedAt: string;
}

export interface ExaminationCentre {
  id: string;
  name: string;
  code: string;
  city: string;
  status: 'AUTHORIZED' | 'SUSPENDED';
  ipWhitelist: string;
}

export interface ReleaseChecklist {
  authenticated: boolean;
  mfaVerified: boolean;
  roleAuthorized: boolean;
  centreAuthorized: boolean;
  assignedToExam: boolean;
  paperExists: boolean;
  paperApproved: boolean;
  paperSealed: boolean;
  timeLockExpired: boolean;
  fragmentsIntact: boolean;
  sha256IntegrityValid: boolean;
  digitalSignatureValid: boolean;
  thresholdAuthorized: boolean;
  singleUseTokenValid: boolean;
}

export interface ReleaseRecord {
  id: string;
  paperId: string;
  examinationId: string;
  centreId: string;
  centreName: string;
  releasedToUser: string;
  releasedAt: string;
  status: 'SUCCESS' | 'BLOCKED_TIME_LOCK' | 'BLOCKED_INTEGRITY' | 'BLOCKED_UNAUTHORIZED';
  singleUseToken: string;
  tokenExpiresAt: string;
  checklist: ReleaseChecklist;
  failureReason?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  resourceType: 'PAPER' | 'EXAMINATION' | 'AUTH' | 'FRAGMENT' | 'CENTRE' | 'SYSTEM';
  resourceId: string;
  severity: SeverityLevel;
  result: ActionResult;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  paperId?: string;
  resolved: boolean;
}
