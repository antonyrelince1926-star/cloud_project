import { 
  User, 
  Examination, 
  ExaminationCentre, 
  QuestionPaper, 
  AuditLog, 
  SecurityAlert,
  ApprovalShare
} from '../types';

export const SEED_CENTRES: ExaminationCentre[] = [
  {
    id: 'centre-101',
    name: 'Metro Tech Examination Center - Hall 4A',
    code: 'C-101',
    city: 'Metropolis',
    status: 'AUTHORIZED',
    ipWhitelist: '198.51.100.42/32',
  },
  {
    id: 'centre-102',
    name: 'Apex Federal Academy - Regional Hall',
    code: 'C-102',
    city: 'Capitol District',
    status: 'AUTHORIZED',
    ipWhitelist: '203.0.113.88/32',
  },
  {
    id: 'centre-103',
    name: 'National Cyber Polytechnic - Secure Lab B',
    code: 'C-103',
    city: 'Northern Sector',
    status: 'AUTHORIZED',
    ipWhitelist: '192.0.2.14/32',
  },
];

export const SEED_USERS: User[] = [
  {
    id: 'user-setter',
    name: 'Dr. Aris Thorne',
    email: 'setter@exam-sec.gov.in',
    role: 'QUESTION_SETTER',
    status: 'ACTIVE',
    mfaEnabled: true,
    failedLoginAttempts: 0,
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'user-reviewer',
    name: 'Prof. Elena Rostova',
    email: 'reviewer@exam-sec.gov.in',
    role: 'REVIEWER',
    status: 'ACTIVE',
    mfaEnabled: true,
    failedLoginAttempts: 0,
    lastLogin: new Date(Date.now() - 1800000).toISOString(),
    createdAt: '2026-01-12T09:30:00Z',
  },
  {
    id: 'user-admin',
    name: 'Director Marcus Vance',
    email: 'admin@exam-sec.gov.in',
    role: 'ADMIN',
    status: 'ACTIVE',
    mfaEnabled: true,
    failedLoginAttempts: 0,
    lastLogin: new Date(Date.now() - 600000).toISOString(),
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-exam-auth',
    name: 'Dr. Rajeshwari Sen',
    email: 'exam-authority@exam-sec.gov.in',
    role: 'EXAMINATION_AUTHORITY',
    status: 'ACTIVE',
    mfaEnabled: true,
    failedLoginAttempts: 0,
    lastLogin: new Date(Date.now() - 1200000).toISOString(),
    createdAt: '2026-01-05T08:00:00Z',
  },
  {
    id: 'user-security-auth',
    name: 'Vikram Malhotra',
    email: 'cso@exam-sec.gov.in',
    role: 'SECURITY_AUTHORITY',
    status: 'ACTIVE',
    mfaEnabled: true,
    failedLoginAttempts: 0,
    lastLogin: new Date(Date.now() - 600000).toISOString(),
    createdAt: '2026-01-05T08:00:00Z',
  },
  {
    id: 'user-backup-auth',
    name: 'HSM Escrow Custodian',
    email: 'escrow@exam-sec.gov.in',
    role: 'BACKUP_AUTHORITY',
    status: 'ACTIVE',
    mfaEnabled: true,
    failedLoginAttempts: 0,
    lastLogin: new Date(Date.now() - 300000).toISOString(),
    createdAt: '2026-01-05T08:00:00Z',
  },
  {
    id: 'user-centre-101',
    name: 'Officer J. Martinez (Centre 101)',
    email: 'centre101@exam-sec.gov.in',
    role: 'EXAMINATION_CENTRE',
    status: 'ACTIVE',
    mfaEnabled: true,
    centreId: 'centre-101',
    failedLoginAttempts: 0,
    lastLogin: new Date(Date.now() - 900000).toISOString(),
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'user-centre-102',
    name: 'Officer T. Chen (Centre 102)',
    email: 'centre102@exam-sec.gov.in',
    role: 'EXAMINATION_CENTRE',
    status: 'ACTIVE',
    mfaEnabled: true,
    centreId: 'centre-102',
    failedLoginAttempts: 0,
    lastLogin: new Date(Date.now() - 7200000).toISOString(),
    createdAt: '2026-02-01T10:00:00Z',
  },
];

// Helper for default 5 shares
export function createDefaultThresholdShares(): ApprovalShare[] {
  return [
    {
      shareIndex: 1,
      holderTitle: 'Academic Review Committee',
      holderRole: 'REVIEWER',
      approved: true,
      approvedAt: '2026-09-14T06:00:00Z',
      signatureToken: 'SIG_SHARE_1_ACADEMIC_REV_9841',
    },
    {
      shareIndex: 2,
      holderTitle: 'Controller of Examinations',
      holderRole: 'ADMIN',
      approved: true,
      approvedAt: '2026-09-14T06:15:00Z',
      signatureToken: 'SIG_SHARE_2_EXAM_CTRL_7712',
    },
    {
      shareIndex: 3,
      holderTitle: 'Examination Authority General',
      holderRole: 'EXAMINATION_AUTHORITY',
      approved: true,
      approvedAt: '2026-09-14T06:30:00Z',
      signatureToken: 'SIG_SHARE_3_EXAM_AUTH_4490',
    },
    {
      shareIndex: 4,
      holderTitle: 'Chief Cyber Security Officer',
      holderRole: 'SECURITY_AUTHORITY',
      approved: false,
    },
    {
      shareIndex: 5,
      holderTitle: 'Backup Custodian Keyring',
      holderRole: 'BACKUP_AUTHORITY',
      approved: false,
    },
  ];
}

export const SAMPLE_PAPER_TEXT_READY = `================================================================================
CONFIDENTIAL - GOVERNMENT COMPETITIVE EXAMINATION BOARD
EXAMINATION CODE: NCE-2026-CS1
SUBJECT: ADVANCED CYBER SYSTEMS & CRYPTOGRAPHIC PROTOCOLS
DURATION: 180 MINUTES | TOTAL MARKS: 100
================================================================================

INSTRUCTIONS:
1. All questions in Section A and Section B are compulsory.
2. Maintain strict examination room silence. Electronic devices are strictly prohibited.
3. Verify the cryptographic verification watermark on every page.

--------------------------------------------------------------------------------
SECTION A: CORE CRYPTOGRAPHIC ENGINEERING (50 MARKS)
--------------------------------------------------------------------------------
Q1 (15 Marks):
Explain the mathematical security guarantees of AES-256-GCM authenticated encryption.
How does the Galois Field GF(2^128) polynomial multiplier protect against bit-flipping
and chosen-ciphertext attacks compared to CBC mode without HMAC?

Q2 (15 Marks):
Analyze Shamir's (k, n) Secret Sharing scheme based on polynomial interpolation.
Demonstrate how any (k-1) shares reveal zero information regarding the secret S in GF(p).
Provide the Lagrange interpolation formula to reconstruct S when k shares are provided.

Q3 (20 Marks):
Contrast the security implications of post-quantum lattice-based signature algorithms
(ML-DSA / Dilithium) versus traditional RSA-4096 and ECDSA P-384 under Shor's algorithm.

--------------------------------------------------------------------------------
SECTION B: ZERO-TRUST ARCHITECTURE & DISTRIBUTED SYSTEMS (50 MARKS)
--------------------------------------------------------------------------------
Q4 (25 Marks):
Design an automated time-lock puzzle release mechanism using verifiable delay functions (VDF).
How does this prevent quantum-accelerated decryption prior to the scheduled exam window?

Q5 (25 Marks):
Describe how a 3-of-5 threshold custody protocol with split-seal fragmentation prevents
insider threats and single-point database exfiltration in high-stakes public examinations.
================================================================================`;

export const SAMPLE_PAPER_TEXT_FUTURE = `================================================================================
CONFIDENTIAL - ADVANCED ENGINEERING FELLOWSHIP QUALIFYING EXAM
EXAMINATION CODE: FAEQ-2026-ENG
SUBJECT: ADVANCED THERMODYNAMICS & FLUID DYNAMICS
DURATION: 150 MINUTES | TOTAL MARKS: 100
================================================================================
SECTION A:
1. Derive the Navier-Stokes equations for compressible viscous flow in cylindrical coordinates.
2. Analyze turbulent boundary layer separation over supersonic airfoils at Mach 2.4.
================================================================================`;

export const SEED_EXAMINATIONS: Examination[] = [
  {
    id: 'exam-001',
    name: 'National Competitive Exam - Cyber Systems & Cryptography',
    code: 'NCE-2026-CS1',
    examDate: '2026-09-14',
    // Scheduled for today: 10 minutes ago (READY FOR RELEASE TEST)
    releaseTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    durationMinutes: 180,
    totalMarks: 100,
    status: 'IN_PROGRESS',
    centreIds: ['centre-101', 'centre-102', 'centre-103'],
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'exam-002',
    name: 'Federal Advanced Engineering Qualifying Examination',
    code: 'FAEQ-2026-ENG',
    examDate: '2026-09-14',
    // Scheduled for 2 hours in the future (PERFECT FOR TIME-LOCK BLOCKED TEST)
    releaseTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    durationMinutes: 150,
    totalMarks: 100,
    status: 'SCHEDULED',
    centreIds: ['centre-101', 'centre-102', 'centre-103'],
    createdAt: '2026-08-05T00:00:00Z',
  },
  {
    id: 'exam-003',
    name: 'Central Civil Administration Aptitude Test',
    code: 'CAAT-2026-ADM',
    examDate: '2026-09-20',
    releaseTime: new Date(Date.now() + 5 * 86400 * 1000).toISOString(),
    durationMinutes: 120,
    totalMarks: 200,
    status: 'SCHEDULED',
    centreIds: ['centre-101', 'centre-102', 'centre-103'],
    createdAt: '2026-08-10T00:00:00Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    userId: 'user-setter',
    userName: 'Dr. Aris Thorne',
    role: 'QUESTION_SETTER',
    action: 'PAPER_CREATED',
    resourceType: 'PAPER',
    resourceId: 'qp-001',
    severity: 'INFO',
    result: 'SUCCESS',
    ipAddress: '10.20.4.15',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    metadata: { version: '1.0', examCode: 'NCE-2026-CS1' },
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 7100000).toISOString(),
    userId: 'user-setter',
    userName: 'Dr. Aris Thorne',
    role: 'QUESTION_SETTER',
    action: 'PAPER_ENCRYPTED_AES256_GCM',
    resourceType: 'PAPER',
    resourceId: 'qp-001',
    severity: 'INFO',
    result: 'SUCCESS',
    ipAddress: '10.20.4.15',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    metadata: { fragmentsCreated: 3, algorithm: 'AES-256-GCM' },
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    userId: 'user-reviewer',
    userName: 'Prof. Elena Rostova',
    role: 'REVIEWER',
    action: 'PAPER_APPROVED',
    resourceType: 'PAPER',
    resourceId: 'qp-001',
    severity: 'INFO',
    result: 'SUCCESS',
    ipAddress: '10.20.8.29',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64)',
    metadata: { decision: 'APPROVED', comments: 'Cryptographic questions rigorous and balanced.' },
  },
  {
    id: 'log-004',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: 'user-admin',
    userName: 'Director Marcus Vance',
    role: 'ADMIN',
    action: 'PAPER_SEALED',
    resourceType: 'PAPER',
    resourceId: 'qp-001',
    severity: 'INFO',
    result: 'SUCCESS',
    ipAddress: '10.20.1.2',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)',
    metadata: { sealed: true, thresholdMet: '3-of-5', digitalSignatureCreated: true },
  },
  {
    id: 'log-005',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    userId: 'user-centre-102',
    userName: 'Officer T. Chen',
    role: 'EXAMINATION_CENTRE',
    action: 'EARLY_RELEASE_ATTEMPT',
    resourceType: 'PAPER',
    resourceId: 'qp-002',
    severity: 'WARNING',
    result: 'BLOCKED',
    ipAddress: '203.0.113.88',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    metadata: { reason: 'TIME_LOCK_ACTIVE', timeRemainingSeconds: 7200 },
  },
];

export const INITIAL_ALERTS: SecurityAlert[] = [
  {
    id: 'alert-001',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    severity: 'WARNING',
    title: 'Early Release Request Blocked',
    description: 'Examination Centre 102 attempted to request paper FAEQ-2026-ENG before scheduled release time. Access strictly denied by Time-Lock Engine.',
    paperId: 'qp-002',
    resolved: true,
  },
];
