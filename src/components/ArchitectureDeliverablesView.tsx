import React, { useState } from 'react';
import { 
  FileCode, 
  Layers, 
  Database, 
  Server, 
  ShieldCheck, 
  Copy, 
  Check, 
  Terminal,
  Lock,
  Key,
  Clock,
  ArrowDown,
  ArrowRight,
  ShieldAlert,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  Users,
  Activity,
  Cpu,
  Building2,
  FileCheck,
  Search,
  ExternalLink,
  Zap
} from 'lucide-react';

interface ArchitectureDeliverablesViewProps {
  onNavigateTab?: (tabId: string) => void;
}

export const ArchitectureDeliverablesView: React.FC<ArchitectureDeliverablesViewProps> = ({ onNavigateTab }) => {
  const [mainTab, setMainTab] = useState<'architecture' | 'methodology' | 'security_table' | 'code'>('architecture');
  const [activeCodeTab, setActiveCodeTab] = useState<'prisma' | 'docker' | 'nestjs' | 'env' | 'security'>('prisma');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('split_fragment');
  const [tableFilter, setTableFilter] = useState<string>('');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // The exact ASCII flow from Section 5
  const ASCII_ARCHITECTURE = `Question Setter
      ↓
Secure Portal + MFA
      ↓
API Gateway
      ↓
Zero-Trust + RBAC
      ↓
Question Paper Service
      ↓
AES-256 Encryption
      ↓
 ┌───────────────┐
 │ Split/Fragment│
 └───────┬───────┘
         ↓
Encrypted Cloud Storage
         +
KMS/HSM + Split Keys
         ↓
Multi-Level Approval
         ↓
Hash + Digital Signature
         ↓
Digital Seal
         ↓
Time-Lock
         ↓
Identity + Time + Centre Verification
         ↓
Controlled Decryption
         ↓
Authorized Examination Centre


   ┌──────────────────────────────┐
   │ Security Monitoring & SIEM   │
   │ Audit Logs + Alerts +        │
   │ Anomaly Detection            │
   └──────────────────────────────┘`;

  // 15 Architecture Nodes in exact order
  const ARCHITECTURE_NODES = [
    {
      id: 'setter',
      label: 'Question Setter',
      category: 'HUMAN_ROLE',
      icon: Users,
      desc: 'Authorized academic question setter commissioned to draft the competitive examination paper.',
      leakageRole: 'Cannot leak paper without detection; session is bound to strict identity and MFA audit.',
      moduleTarget: 'setter'
    },
    {
      id: 'portal_mfa',
      label: 'Secure Portal + MFA',
      category: 'IDENTITY',
      icon: Fingerprint,
      desc: 'Enforces Time-based One-Time Password (TOTP) / hardware token multi-factor authentication before session issue.',
      leakageRole: 'Prevents access using stolen credentials or brute-force password guessing.',
      moduleTarget: 'setter'
    },
    {
      id: 'api_gateway',
      label: 'API Gateway',
      category: 'NETWORK',
      icon: Server,
      desc: 'TLS 1.3 terminated ingress reverse proxy with rate limiting, geo-fencing, and IP address validation.',
      leakageRole: 'Blocks unauthorized egress/ingress traffic and neutralizes wiretapping attempts.',
      moduleTarget: 'admin'
    },
    {
      id: 'rbac',
      label: 'Zero-Trust + RBAC',
      category: 'ACCESS_CONTROL',
      icon: ShieldCheck,
      desc: 'Least-privilege authorization engine. Every single request is authenticated, authorized, and scoped by role.',
      leakageRole: 'Ensures question setters, reviewers, and centres cannot perform operations outside their role.',
      moduleTarget: 'admin'
    },
    {
      id: 'qp_service',
      label: 'Question Paper Service',
      category: 'SERVICE',
      icon: Cpu,
      desc: 'Core microservice orchestrating paper lifecycle, question ingestion, and cryptographic pipelines.',
      leakageRole: 'Processes payloads strictly in volatile memory without writing unencrypted files to disk.',
      moduleTarget: 'setter'
    },
    {
      id: 'aes256',
      label: 'AES-256 Encryption',
      category: 'CRYPTOGRAPHY',
      icon: Lock,
      desc: 'Galois/Counter Mode (AES-256-GCM) with 256-bit ephemeral key, 96-bit unique IV, and 128-bit integrity auth tag.',
      leakageRole: 'Renders plaintext inaccessible even if physical storage volumes or DB backups are compromised.',
      moduleTarget: 'vault'
    },
    {
      id: 'split_fragment',
      label: 'Split/Fragment Engine',
      category: 'SPLIT_STORAGE',
      icon: Layers,
      isHighlighted: true,
      desc: 'Partitions encrypted ciphertext into 3 physically isolated slices: Store A (Head), Store B (Body), Store C (Tail & Tag).',
      leakageRole: 'Prevents any single storage node compromise from yielding a decryptable paper.',
      moduleTarget: 'vault'
    },
    {
      id: 'cloud_storage_kms',
      label: 'Encrypted Cloud Storage + KMS/HSM + Split Keys',
      category: 'STORAGE_KMS',
      icon: Database,
      desc: 'Distributed cloud vaults with FIPS 140-2 Level 3 HSM master key protection and threshold Shamir key shares.',
      leakageRole: 'No single cloud provider, sysadmin, or database operator can reconstruct keys or data.',
      moduleTarget: 'vault'
    },
    {
      id: 'approval',
      label: 'Multi-Level Approval',
      category: 'GOVERNANCE',
      icon: CheckCircle2,
      desc: 'Requires multi-custodian sign-off (Academic Reviewer, Examination Controller, Authority General).',
      leakageRole: 'Prevents rogue individuals from unilaterally approving or modifying examination contents.',
      moduleTarget: 'reviewer'
    },
    {
      id: 'hash_signature',
      label: 'Hash + Digital Signature',
      category: 'CRYPTOGRAPHY',
      icon: Key,
      desc: 'SHA-256 cryptographic master digest combined with RSA-2048 / Ed25519 digital signature of the authoritative envelope.',
      leakageRole: 'Detects any tampering or byte alteration; mathematical verification fails if 1 bit changes.',
      moduleTarget: 'admin'
    },
    {
      id: 'digital_seal',
      label: 'Digital Seal',
      category: 'IMMUTABILITY',
      icon: ShieldCheck,
      desc: 'Cryptographic lock transitioning paper to immutable state (sealed = true). Write/Delete operations strictly blocked.',
      leakageRole: 'Guarantees the question paper cannot be replaced, substituted, or manipulated post-approval.',
      moduleTarget: 'admin'
    },
    {
      id: 'time_lock',
      label: 'Time-Lock',
      category: 'TIME_ENGINE',
      icon: Clock,
      desc: 'Authoritative server clock enforcement. Blocks release until server_time >= examination_release_time.',
      leakageRole: 'Eliminates pre-exam leakage window. Early requests are immediately rejected.',
      moduleTarget: 'centre'
    },
    {
      id: 'verification',
      label: 'Identity + Time + Centre Verification',
      category: 'GATE_ENGINE',
      icon: Zap,
      desc: 'Zero-trust 13-gate release engine verifying centre IP whitelist, biometric/MFA token, schedule, and shard health.',
      leakageRole: 'Stops unauthorized centres or impersonators from obtaining examination papers.',
      moduleTarget: 'centre'
    },
    {
      id: 'controlled_decryption',
      label: 'Controlled Decryption',
      category: 'DECRYPTION',
      icon: Activity,
      desc: 'Combines threshold key shares and intact storage fragments in volatile memory just-in-time for authorized release.',
      leakageRole: 'Ephemeral decryption only occurs at authorized centre stations upon passing all verification gates.',
      moduleTarget: 'centre'
    },
    {
      id: 'centre',
      label: 'Authorized Examination Centre',
      category: 'ENDPOINT',
      icon: Building2,
      desc: 'Secure centre terminal equipped with single-use release tokens and dynamic watermarking for physical security.',
      leakageRole: 'Confines paper availability to the physical examination hall strictly for the exam window.',
      moduleTarget: 'centre'
    }
  ];

  // Section 3: 10-Step Methodology data
  const METHODOLOGY_STEPS = [
    {
      step: 1,
      title: 'Secure Creation',
      summary: 'Question setters access the system using MFA and create the paper in a secure portal.',
      details: 'Question setters must complete multi-factor authentication (MFA) with TOTP / hardware token before accessing the draft studio. All drafting occurs within a sanitized, sandboxed portal with automated input validation and zero external clipboard exposure.',
      codeSnippet: 'User.findUnique() -> requireMFA() -> SetterStudio -> DraftPayload',
      prevention: 'Eliminates credential-stuffing and unauthorized paper creation through stolen passwords alone.',
      tabLink: 'setter'
    },
    {
      step: 2,
      title: 'Encryption',
      summary: 'The paper is immediately encrypted using AES-256.',
      details: 'As soon as the question setter finalizes the draft or uploads the paper, the system immediately applies Galois/Counter Mode (AES-256-GCM) authenticated encryption with a cryptographically secure 256-bit ephemeral key and a 96-bit unique IV.',
      codeSnippet: 'crypto.createCipheriv("aes-256-gcm", paperKey, iv) -> Ciphertext + 128-bit Auth Tag',
      prevention: 'Plaintext is never persisted to disk or relational databases. Raw paper is completely unreadable without the ephemeral key.',
      tabLink: 'vault'
    },
    {
      step: 3,
      title: 'Fragmentation',
      summary: 'The encrypted paper is divided into multiple fragments and stored separately.',
      details: 'The AES-256 ciphertext is sliced into three separate physical fragments: Store A (Header + metadata), Store B (Core encrypted payload), and Store C (Tail + GCM authentication tag), each distributed to isolated storage vaults.',
      codeSnippet: 'sliceCiphertext(ciphertext) -> [Store A (Alpha), Store B (Beta), Store C (Gamma)]',
      prevention: 'Breaching any single storage bucket, volume, or server yields only meaningless fragment slices that cannot be decrypted.',
      tabLink: 'vault'
    },
    {
      step: 4,
      title: 'Split-Key Protection',
      summary: 'The encryption key is divided among multiple authorized authorities using threshold secret sharing.',
      details: 'The AES-256 master key is split into 5 Shamir threshold key shares (k = 3 of n = 5). Distinct custody shares are provisioned to Academic Reviewer, Controller of Examinations, Examination Authority General, Chief Cybersecurity Officer, and Backup Vault.',
      codeSnippet: 'shamirSplit(masterKey, n=5, k=3) -> Shares [S1, S2, S3, S4, S5]',
      prevention: 'Prevents any individual official, system administrator, or compromised executive account from unilaterally decrypting the paper.',
      tabLink: 'vault'
    },
    {
      step: 5,
      title: 'Approval',
      summary: 'Multiple authorized officials must review and digitally approve the paper.',
      details: 'Independent academic reviewers and examination authorities examine the syllabus coverage, marks distribution, and custody state. Each approver signs their individual threshold key share with cryptographic tokens.',
      codeSnippet: 'Reviewer.approve() + Controller.signShare() + Authority.signShare() -> Quorum Check (>= 3)',
      prevention: 'Prevents rogue insiders from quietly modifying or releasing unvetted question paper revisions.',
      tabLink: 'reviewer'
    },
    {
      step: 6,
      title: 'Digital Seal',
      summary: 'A cryptographic hash and digital signature are generated to detect any modification.',
      details: 'A SHA-256 master digest of the canonical plaintext is computed and digitally signed using the Examination Authority’s RSA-2048 / Ed25519 private root key. The envelope status is permanently marked as SEALED.',
      codeSnippet: 'digest = sha256(plaintext); signature = sign(digest, authorityPrivateKey); sealed = true',
      prevention: 'Any unauthorized byte alteration or tampering with questions invalidates the cryptographic signature, preventing fraudulent substitutions.',
      tabLink: 'admin'
    },
    {
      step: 7,
      title: 'Monitoring',
      summary: 'All access attempts are continuously monitored and recorded in an immutable audit log.',
      details: 'Every API request, login event, fragment checksum read, key share signature, and test scenario is captured with millisecond timestamps, actor identity, role, IP address, user-agent, and SHA-256 audit chaining.',
      codeSnippet: 'SIEM.recordEvent({ action, actor, resource, severity, ip, prevLogHash })',
      prevention: 'Enables instant detection of reconnaissance probes, brute force attempts, or insider privilege abuse in real-time.',
      tabLink: 'audit'
    },
    {
      step: 8,
      title: 'Time-Lock',
      summary: 'The paper remains inaccessible until the predefined examination time.',
      details: 'The decryption microservice enforces an authoritative server clock boundary. Even if valid credentials or threshold approvals exist, all release endpoints categorically reject requests prior to the scheduled examination release timestamp.',
      codeSnippet: 'if (serverTime < examination.releaseTime) return HTTP_423_LOCKED("Time-Lock Active")',
      prevention: 'Eliminates the vulnerability window prior to examination start, preventing advance leaks to coaching centers or unauthorized parties.',
      tabLink: 'centre'
    },
    {
      step: 9,
      title: 'Controlled Release',
      summary: 'At release time, the system verifies identity, authorization, time, examination centre, and paper integrity before allowing decryption.',
      details: 'When the scheduled time arrives, the centre official initiates release. The system conducts a 13-point zero-trust gate check: verifies centre identity, IP whitelisting, time-lock expiration, fragment checksums (Store A/B/C), digital seal signature, and 3-of-5 threshold quorum before ephemeral decryption in RAM.',
      codeSnippet: 'verifyGates([Time, IP, Centre, Quorum, Checksums, Signature]) -> EphemeralReassembly()',
      prevention: 'Guarantees that decryption is mathematically impossible unless every single security criteria is simultaneously satisfied.',
      tabLink: 'centre'
    },
    {
      step: 10,
      title: 'Audit',
      summary: 'All release and access activities are permanently recorded for investigation.',
      details: 'Upon successful release, a single-use delivery record is generated containing the exact recipient details, dynamic watermarks, timestamp, and verification scorecard. The audit log is frozen and ready for forensic investigation.',
      codeSnippet: 'ReleaseRecord.create({ singleUseToken, centreId, verificationResult, releasedAt })',
      prevention: 'Provides undeniable, non-repudiable legal and forensic proof of custody and exact point of dissemination.',
      tabLink: 'audit'
    }
  ];

  // Section 4: Security Mechanisms Table
  const SECURITY_MECHANISMS = [
    {
      mechanism: 'MFA',
      purpose: 'Prevents access using stolen passwords alone.',
      category: 'Authentication',
      howItPreventsLeakage: 'Requires a secondary cryptographic time-based token (TOTP) or hardware token. Even if an attacker steals an admin, setter, or reviewer password via phishing or database breach, they cannot authenticate without the second factor.',
      status: 'Enforced in Login & Studio'
    },
    {
      mechanism: 'RBAC + Least Privilege',
      purpose: 'Gives users only the permissions required for their role.',
      category: 'Authorization',
      howItPreventsLeakage: 'Question setters cannot view other subjects; reviewers cannot modify text without consensus; examination centres cannot view paper contents before scheduled release; admins cannot bypass cryptographic locks.',
      status: 'Active on all API endpoints'
    },
    {
      mechanism: 'AES-256 Encryption',
      purpose: 'Protects papers even if storage is compromised.',
      category: 'Confidentiality',
      howItPreventsLeakage: 'Questions are never written to disk in plaintext. The Galois/Counter Mode (GCM) cipher provides unbreakable mathematical confidentiality against offline disk theft or database dumps.',
      status: 'AES-256-GCM + 96-bit IV'
    },
    {
      mechanism: 'Fragmented Storage',
      purpose: 'Prevents one storage breach from exposing the complete paper.',
      category: 'Storage Architecture',
      howItPreventsLeakage: 'The encrypted file is chopped into Store A (Head), Store B (Body), and Store C (Tail & Tag) located across physically separate storage enclaves. Gaining root access to one storage node yields only unusable slice fragments.',
      status: '3 Isolated Storage Vaults'
    },
    {
      mechanism: 'Threshold Key Sharing',
      purpose: 'Prevents one person from reconstructing the encryption key.',
      category: 'Key Management',
      howItPreventsLeakage: 'The master key is split into 5 Shamir shares requiring a minimum of 3 independent custodians to sign off. No single corrupt administrator or coerced official can leak the paper alone.',
      status: '3-of-5 Quorum Enforced'
    },
    {
      mechanism: 'Digital Signature + Hash',
      purpose: 'Detects unauthorized modification and verifies authenticity.',
      category: 'Integrity',
      howItPreventsLeakage: 'A SHA-256 hash digest of the paper is signed using the Examination Authority private key. Any injected question, altered option, or bit manipulation breaks the signature and triggers an immediate tampering alarm.',
      status: 'RSA-2048 / Ed25519 Signed'
    },
    {
      mechanism: 'Multi-Level Approval',
      purpose: 'Prevents one person from independently releasing the paper.',
      category: 'Governance',
      howItPreventsLeakage: 'Enforces a multi-stage approval hierarchy (Setter -> Academic Reviewer -> Controller of Examinations -> Authority General). No single individual possesses unilateral clearance.',
      status: 'Sequential Custody Workflow'
    },
    {
      mechanism: 'Time-Lock',
      purpose: 'Blocks access before the scheduled examination time.',
      category: 'Access Timing',
      howItPreventsLeakage: 'API endpoints compare authoritative server time against the scheduled release timestamp. All decryption calls before the exam start are strictly rejected with HTTP 423 Locked.',
      status: 'Authoritative Server Clock'
    },
    {
      mechanism: 'Immutable Audit Logs',
      purpose: 'Records every important action for investigation.',
      category: 'Forensics & Audit',
      howItPreventsLeakage: 'Every login, fragment access, key signature, approval, and release attempt is logged with cryptographic hash chaining in an append-only store, preventing insider log tampering or cover-ups.',
      status: 'Append-Only Cryptographic Log'
    },
    {
      mechanism: 'Anomaly Monitoring',
      purpose: 'Detects unusual access and possible insider attacks.',
      category: 'Detection & SIEM',
      howItPreventsLeakage: 'SIEM heuristics detect abnormal activity including out-of-schedule requests, repeated failed releases, IP subnet shifts, and fragment checksum mismatches, generating instant alerts.',
      status: 'Live SIEM Detection Rules'
    },
    {
      mechanism: 'KMS/HSM',
      purpose: 'Securely protects encryption keys from direct administrator access.',
      category: 'Hardware Security',
      howItPreventsLeakage: 'Root signing keys and master key encryption keys (KEKs) reside inside FIPS 140-2 Level 3 Hardware Security Modules. Keys cannot be exported in plaintext even by root system administrators.',
      status: 'HSM Cryptographic Isolation'
    },
    {
      mechanism: 'TLS',
      purpose: 'Protects data while being transmitted.',
      category: 'Transport Security',
      howItPreventsLeakage: 'All communication between Question Setters, API Gateway, Cloud Microservices, and Centre Stations is secured with TLS 1.3 and Perfect Forward Secrecy, neutralizing network eavesdropping and MITM attacks.',
      status: 'TLS 1.3 Transport Ingress'
    }
  ];

  // Filtered mechanisms
  const filteredMechanisms = SECURITY_MECHANISMS.filter(item => {
    if (!tableFilter) return true;
    const query = tableFilter.toLowerCase();
    return (
      item.mechanism.toLowerCase().includes(query) ||
      item.purpose.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.howItPreventsLeakage.toLowerCase().includes(query)
    );
  });

  // Prisma Schema code
  const PRISMA_SCHEMA = `// prisma/schema.prisma
// Zero-Trust Split-Seal Competitive Examination Question Paper Custody System

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  QUESTION_SETTER
  REVIEWER
  ADMIN
  EXAMINATION_CENTRE
}

enum PaperStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  REVIEW_APPROVED
  AUTHORITY_APPROVED
  SEALED
  TIME_LOCKED
  RELEASED
  REJECTED
}

model QuestionPaper {
  id                 String                  @id @default(uuid())
  examinationId      String
  createdBy          String
  title              String
  subject            String
  version            String                  @default("1.0")
  status             PaperStatus             @default(DRAFT)
  sealed             Boolean                 @default(false)
  sealedAt           DateTime?
  fileHash           String                  // SHA-256 Plaintext Digest
  signature          String                  // Digital Seal Signature
  signaturePublicKey String                  // Authority Public Cert
  encryptionIv       String                  // 96-bit AES-GCM IV
  authTag            String                  // 128-bit AES-GCM Auth Tag
  fragments          QuestionPaperFragment[]
  reviews            Review[]
  approvals          Approval[]
  releaseRecords     ReleaseRecord[]
  createdAt          DateTime                @default(now())
  updatedAt          DateTime                @updatedAt
}

model QuestionPaperFragment {
  id               String        @id @default(uuid())
  paperId          String
  paper            QuestionPaper @relation(fields: [paperId], references: [id], onDelete: Cascade)
  fragmentNumber   Int           // 1 = Store A, 2 = Store B, 3 = Store C
  storageName      String        // e.g. "Store A (Encrypted Head Vault)"
  storagePath      String        // e.g. "/var/sec-storage/vault-alpha/frag_1.enc"
  checksum         String        // SHA-256 of fragment ciphertext
  createdAt        DateTime      @default(now())

  @@unique([paperId, fragmentNumber])
}

model Approval {
  id           String        @id @default(uuid())
  paperId      String
  paper        QuestionPaper @relation(fields: [paperId], references: [id], onDelete: Cascade)
  approverId   String
  approvalType String        // REVIEWER_SHARE, ADMIN_SHARE, AUTHORITY_SHARE
  shareIndex   Int           // 1 to 5 for 3-of-5 threshold custody
  status       String        // SIGNED, REVOKED
  signatureToken String?
  approvedAt   DateTime      @default(now())

  @@unique([paperId, shareIndex])
}

model ReleaseRecord {
  id                 String            @id @default(uuid())
  paperId            String
  examinationId      String
  centreId           String
  releasedToUser     String
  releasedAt         DateTime          @default(now())
  status             String            // SUCCESS, BLOCKED_TIME_LOCK, BLOCKED_INTEGRITY
  singleUseToken     String            @unique
  tokenExpiresAt     DateTime
  verificationResult Json              // Complete 13-gate evaluation dump
}

model AuditLog {
  id           String        @id @default(uuid())
  timestamp    DateTime      @default(now())
  userId       String?
  userName     String
  role         UserRole
  action       String
  resourceType String
  resourceId   String
  severity     String
  result       String
  ipAddress    String
  metadata     Json?
}`;

  const DOCKER_COMPOSE = `# docker-compose.yml
# Zero-Trust Split-Seal Competitive Examination System

version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: exam_postgres_sec
    restart: unless-stopped
    environment:
      POSTGRES_DB: exam_custody_db
      POSTGRES_USER: custody_admin
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-SecOpsPasswd2026!}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - secure_internal_net

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: exam_nestjs_api
    restart: unless-stopped
    depends_on:
      - postgres
    environment:
      NODE_ENV: production
      PORT: 4000
      DATABASE_URL: postgresql://custody_admin:\${POSTGRES_PASSWORD:-SecOpsPasswd2026!}@postgres:5432/exam_custody_db
      JWT_SECRET: \${JWT_SECRET:-kY8!xR2#vP9$mQ5*zL1^wE4@jT7&sA3}
      ENCRYPTION_MASTER_SEED: \${ENCRYPTION_MASTER_SEED:-000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f}
      VAULT_A_PATH: /var/sec-storage/vault-alpha
      VAULT_B_PATH: /var/sec-storage/vault-beta
      VAULT_C_PATH: /var/sec-storage/vault-gamma
    volumes:
      - vault_store_a:/var/sec-storage/vault-alpha
      - vault_store_b:/var/sec-storage/vault-beta
      - vault_store_c:/var/sec-storage/vault-gamma
    networks:
      - secure_internal_net
    ports:
      - "4000:4000"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: exam_nextjs_frontend
    restart: unless-stopped
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
    ports:
      - "3000:3000"
    networks:
      - secure_internal_net

networks:
  secure_internal_net:
    driver: bridge

volumes:
  postgres_data:
  vault_store_a:
  vault_store_b:
  vault_store_c:`;

  const NESTJS_ARCH = `// NestJS API Architecture Overview & Route Map
// Modular Zero-Trust Micro-Architecture with Strict RBAC Guards

1. AuthModule (/auth)
   POST   /auth/login             -> Validates credentials, issues MFA challenge OTP
   POST   /auth/mfa/verify        -> Validates TOTP token, returns JWT session
   POST   /auth/refresh           -> Rotates short-lived access token

2. QuestionPapersModule (/papers)
   POST   /papers                 -> [Roles: SETTER] Ingests paper, executes AES-256-GCM, fragments into Store A/B/C
   GET    /papers                 -> Returns papers filtered by role ownership
   POST   /papers/:id/submit      -> [Roles: SETTER] DRAFT -> SUBMITTED

3. ReviewsModule (/reviews)
   POST   /reviews/:paperId       -> [Roles: REVIEWER] APPROVE / REJECT, signs Share 1

4. ApprovalsModule (/approvals)
   POST   /approvals/:paperId/sign -> [Roles: ADMIN, AUTHORITY] Signs Threshold Shares 2-5
   POST   /papers/:paperId/seal    -> [Roles: ADMIN] Immutably seals paper once k=3 quorum is satisfied

5. ReleasesModule (/releases)
   POST   /releases/:paperId/request -> [Roles: CENTRE] Executes 13-gate server verification:
                                         1. Authoritative Server Time >= Exam Release Time
                                         2. Centre IP whitelist match
                                         3. Fragment A/B/C Checksum parity
                                         4. Reassembly & SHA-256 Master Digest check
                                         5. Digital Seal signature verification
                                         6. 3-of-5 Threshold quorum check
                                         -> Ephemeral decryption & issues single-use token

6. Security & SIEM Module (/admin)
   GET    /admin/audit-logs          -> Immutable append-only audit trail
   GET    /admin/security-events     -> Real-time anomaly alerts`;

  const ENV_EXAMPLE = `# .env.example
# Zero-Trust Split-Seal Competitive Examination System

# Database Connection (PostgreSQL 15)
DATABASE_URL="postgresql://custody_admin:SecOpsPasswd2026!@localhost:5432/exam_custody_db?schema=public"

# Authentication Secrets
JWT_SECRET="kY8!xR2#vP9$mQ5*zL1^wE4@jT7&sA3"
JWT_EXPIRY="15m"

# Cryptographic Master Seeds & KMS Mock Abstraction
ENCRYPTION_MASTER_SEED="000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f"
ROOT_SIGNING_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC51F9waF0+Cn4N...\\n-----END PRIVATE KEY-----"

# Split Storage Vault Directories
VAULT_A_PATH="/var/sec-storage/vault-alpha"
VAULT_B_PATH="/var/sec-storage/vault-beta"
VAULT_C_PATH="/var/sec-storage/vault-gamma"

PORT=4000
NODE_ENV="development"`;

  const SECURITY_DOC = `# Zero-Trust Split-Seal Cryptographic Specification

## Main Idea:
"No single point of compromise can reveal the complete question paper."

## Core Principle:
"A single compromised account or storage system should never be sufficient to obtain the complete question paper."

### 1. Authenticated Encryption (AES-256-GCM)
Every paper is encrypted using Galois/Counter Mode (GCM) with a 256-bit ephemeral key and a unique 96-bit Initialization Vector (IV).

### 2. Split Storage Fragmentation (Store A, Store B, Store C)
The ciphertext is divided into 3 distinct slices stored across isolated virtual volumes:
- Store A: Encrypted Header Vault
- Store B: Encrypted Core Vault
- Store C: Encrypted Tail & Tag Vault
Each fragment is hashed with SHA-256 on creation.

### 3. 3-of-5 Threshold Authorization Keyring
No single official can order a release. Authorization requires at least 3 of 5 independent cryptographic endorsements.

### 4. Authoritative Time-Lock Engine
Release requests are evaluated against authoritative server system time. If server_time < release_time, the engine strictly blocks decryption.`;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-[#e5e5ea] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-[#222222] flex items-center justify-center text-white shadow-sm border border-[#333333]">
              <Layers className="w-6 h-6 text-[#e95d2a]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold text-[#222222] tracking-tight">
                  Zero-Trust Split-Seal Architecture & Methodology
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#fef3ee] text-[#e95d2a] border border-[#fde2d4]">
                  SECTIONS 3, 4 & 5
                </span>
              </div>
              <p className="text-xs text-[#6b7280] mt-0.5">
                Complete system specification, 10-step lifecycle methodology, 12-layer security mitigation table, and verified architecture pipeline.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyToClipboard(ASCII_ARCHITECTURE, 'ascii')}
              className="px-3 py-2 rounded-lg bg-[#f4f4f6] hover:bg-[#e5e5ea] text-[#222222] text-xs font-bold transition flex items-center space-x-1.5 border border-[#e5e5ea]"
            >
              {copiedKey === 'ascii' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#059669]" />
                  <span>ASCII Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#e95d2a]" />
                  <span>Copy Flow Diagram</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Central Core Principle & Main Idea Banner */}
        <div className="mt-5 p-4 rounded-xl bg-[#222222] text-white border border-[#333333] shadow-inner grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-b md:border-b-0 md:border-r border-[#444444] pb-3 md:pb-0 md:pr-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#e95d2a] block">
              Main Idea
            </span>
            <p className="text-sm font-black text-white mt-1 leading-snug">
              “No single point of compromise can reveal the complete question paper.”
            </p>
            <p className="text-[11px] text-[#9ca3af] mt-1">
              Architecture guarantees zero single-point failure across human roles, servers, databases, and physical storage.
            </p>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#10b981] block">
              Core Principle
            </span>
            <p className="text-sm font-black text-white mt-1 leading-snug">
              “A single compromised account or storage system should never be sufficient to obtain the complete question paper.”
            </p>
            <p className="text-[11px] text-[#9ca3af] mt-1">
              Enforced through AES-256-GCM, fragmented split vaults, 3-of-5 threshold shares, and mathematical time-locks.
            </p>
          </div>
        </div>

        {/* Primary View Navigation */}
        <div className="mt-5 pt-4 border-t border-[#e5e5ea] flex space-x-2 overflow-x-auto">
          {[
            { id: 'architecture', label: 'Architecture & System Flow (Sec 5)', icon: Layers },
            { id: 'methodology', label: '10-Step Methodology (Sec 3)', icon: Activity },
            { id: 'security_table', label: 'Security Mechanisms Table (Sec 4)', icon: ShieldCheck },
            { id: 'code', label: 'Engineering Deliverables & Code', icon: FileCode },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = mainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#e95d2a] text-white shadow-2xs'
                    : 'bg-[#f4f4f6] text-[#4b5563] hover:bg-[#e5e5ea]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: SECTION 5 - ARCHITECTURE & FLOW DIAGRAM */}
      {mainTab === 'architecture' && (
        <div className="space-y-6">
          
          {/* Main Flow Section */}
          <div className="bg-white rounded-xl border border-[#e5e5ea] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#e5e5ea]">
              <div>
                <h2 className="text-base font-extrabold text-[#222222] flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[#e95d2a]" />
                  <span>Proposed Solution Architecture Pipeline</span>
                </h2>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Visual mapping of the exact end-to-end data flow from Question Setter creation to authorized Centre release.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#6b7280]">
                15 Sequential Stages + Continuous SIEM Monitoring
              </span>
            </div>

            {/* Split Grid: Left Graphical Pipeline, Right Interactive Stage Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left: Graphical Flow Nodes */}
              <div className="lg:col-span-7 space-y-2">
                {ARCHITECTURE_NODES.map((node, index) => {
                  const Icon = node.icon;
                  const isSelected = selectedNodeId === node.id;
                  const isLast = index === ARCHITECTURE_NODES.length - 1;

                  return (
                    <React.Fragment key={node.id}>
                      <div
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#fef3ee] border-[#e95d2a] shadow-xs'
                            : node.isHighlighted
                              ? 'bg-[#fffbf8] border-[#fed7aa] hover:border-[#e95d2a]'
                              : 'bg-[#fcfcfd] border-[#e5e5ea] hover:bg-white hover:border-[#d1d5db]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-[#e95d2a] text-white'
                              : 'bg-[#f4f4f6] text-[#222222]'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono text-[#9ca3af] font-bold">
                                {(index + 1).toString().padStart(2, '0')}
                              </span>
                              <span className={`text-xs font-extrabold ${
                                isSelected ? 'text-[#e95d2a]' : 'text-[#222222]'
                              }`}>
                                {node.label}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#6b7280] line-clamp-1">
                              {node.desc}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#e5e5ea] text-[#6b7280]">
                            {node.category}
                          </span>
                        </div>
                      </div>

                      {/* Directional Connector Arrow */}
                      {!isLast && (
                        <div className="flex justify-center py-0.5 text-[#9ca3af]">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* SIEM Monitoring Box */}
                <div className="mt-6 p-4 rounded-xl bg-[#222222] text-white border border-[#333333]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4 text-[#e95d2a]" />
                      <span className="text-xs font-extrabold">
                        Security Monitoring & SIEM
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#333333] text-[#10b981]">
                      ACTIVE SURVEILLANCE
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                    Continuous cross-cutting surveillance: Audit Logs + Real-time Security Alerts + Anomaly Detection engine ingest telemetry across every single stage of the flow.
                  </p>
                </div>
              </div>

              {/* Right: Selected Node Details & Inspection */}
              <div className="lg:col-span-5 space-y-4">
                {(() => {
                  const node = ARCHITECTURE_NODES.find(n => n.id === selectedNodeId) || ARCHITECTURE_NODES[6];
                  const Icon = node.icon;
                  const stepIndex = ARCHITECTURE_NODES.findIndex(n => n.id === node.id) + 1;

                  return (
                    <div className="bg-[#fcfcfd] rounded-xl border border-[#e5e5ea] p-5 sticky top-24 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea]">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-9 h-9 rounded-lg bg-[#222222] text-[#e95d2a] flex items-center justify-center">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-[#6b7280] block font-bold">
                              STAGE {stepIndex} OF 15
                            </span>
                            <h3 className="text-sm font-extrabold text-[#222222]">
                              {node.label}
                            </h3>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                          VERIFIED
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider block mb-1">
                          Role & Description
                        </span>
                        <p className="text-xs text-[#222222] leading-relaxed">
                          {node.desc}
                        </p>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-[#e5e5ea]">
                        <span className="text-[11px] font-bold text-[#e95d2a] uppercase tracking-wider block mb-1">
                          How it Prevents Leakage
                        </span>
                        <p className="text-xs text-[#4b5563] leading-relaxed">
                          {node.leakageRole}
                        </p>
                      </div>

                      {/* Jump to Live Project Module */}
                      {onNavigateTab && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => onNavigateTab(node.moduleTarget)}
                            className="w-full py-2 rounded-lg bg-[#222222] hover:bg-black text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs"
                          >
                            <span>Open Live Module in App</span>
                            <ExternalLink className="w-3.5 h-3.5 text-[#e95d2a]" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ASCII Box Reference */}
                <div className="bg-[#222222] text-white p-4 rounded-xl border border-[#333333]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-[#e95d2a]">
                      Text Flow Reference (Section 5)
                    </span>
                    <button
                      onClick={() => copyToClipboard(ASCII_ARCHITECTURE, 'mini_ascii')}
                      className="text-[10px] text-[#9ca3af] hover:text-white flex items-center space-x-1 font-mono"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === 'mini_ascii' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="font-mono text-[10px] text-[#d4d4d8] leading-tight overflow-x-auto max-h-56">
                    {ASCII_ARCHITECTURE}
                  </pre>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SECTION 3 - STEP-BY-STEP METHODOLOGY */}
      {mainTab === 'methodology' && (
        <div className="space-y-6">
          
          <div className="bg-white rounded-xl border border-[#e5e5ea] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#e5e5ea]">
              <div>
                <h2 className="text-base font-extrabold text-[#222222] flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-[#e95d2a]" />
                  <span>Proposed System Methodology: 10-Step Lifecycle</span>
                </h2>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Step-by-step breakdown of the Zero-Trust Split-Seal Question Paper Management System.
                </p>
              </div>

              <span className="text-xs font-bold text-[#059669] bg-[#ecfdf5] px-2.5 py-1 rounded-full border border-[#a7f3d0]">
                All 10 Steps Implemented
              </span>
            </div>

            {/* Core Principle Callout */}
            <div className="p-4 rounded-xl bg-[#fef3ee] border border-[#fde2d4] flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-[#e95d2a] shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-black text-[#e95d2a] uppercase tracking-wider block">
                  Core Principle
                </strong>
                <p className="text-xs text-[#222222] font-semibold mt-0.5">
                  A single compromised account or storage system should never be sufficient to obtain the complete question paper.
                </p>
              </div>
            </div>

            {/* 10 Step Cards */}
            <div className="space-y-4">
              {METHODOLOGY_STEPS.map((s) => (
                <div 
                  key={s.step}
                  className="p-4 rounded-xl border border-[#e5e5ea] bg-[#fcfcfd] hover:bg-white transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-lg bg-[#222222] text-[#e95d2a] text-xs font-mono font-black flex items-center justify-center shrink-0">
                        {s.step}
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#222222]">
                          {s.title}
                        </h3>
                        <p className="text-xs font-medium text-[#4b5563]">
                          {s.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                        ✓ Active in Project
                      </span>
                      {onNavigateTab && (
                        <button
                          type="button"
                          onClick={() => onNavigateTab(s.tabLink)}
                          className="px-2.5 py-1 rounded bg-white hover:bg-[#f4f4f6] border border-[#e5e5ea] text-xs font-bold text-[#222222] flex items-center space-x-1"
                        >
                          <span>Test</span>
                          <ArrowRight className="w-3 h-3 text-[#e95d2a]" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-[#f0f0f2]">
                    <div>
                      <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider block mb-0.5">
                        Technical Execution
                      </span>
                      <p className="text-[#4b5563] leading-relaxed">
                        {s.details}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#e95d2a] uppercase tracking-wider block mb-0.5">
                        Leakage Prevention Mechanism
                      </span>
                      <p className="text-[#4b5563] leading-relaxed">
                        {s.prevention}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#222222] text-[#d4d4d8] px-3 py-1.5 rounded-lg text-[11px] font-mono flex items-center justify-between">
                    <span className="truncate">{s.codeSnippet}</span>
                    <span className="text-[10px] text-[#9ca3af] shrink-0 ml-2">Enforced</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: SECTION 4 - SECURITY MECHANISMS TABLE */}
      {mainTab === 'security_table' && (
        <div className="space-y-6">
          
          <div className="bg-white rounded-xl border border-[#e5e5ea] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e5ea]">
              <div>
                <h2 className="text-base font-extrabold text-[#222222] flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#e95d2a]" />
                  <span>Security Mechanisms & Leakage Prevention Matrix</span>
                </h2>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Comprehensive explanation of how each selected security mechanism prevents or detects question-paper leakage.
                </p>
              </div>

              {/* Search filter */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9ca3af]" />
                <input
                  type="text"
                  placeholder="Filter mechanisms..."
                  value={tableFilter}
                  onChange={e => setTableFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#e5e5ea] text-xs bg-[#fcfcfd] focus:outline-none focus:ring-2 focus:ring-[#e95d2a]"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#e5e5ea] bg-[#f9f9fb] text-[11px] uppercase tracking-wider text-[#6b7280]">
                    <th className="py-3 px-4 font-bold">Security Mechanism</th>
                    <th className="py-3 px-4 font-bold">Category</th>
                    <th className="py-3 px-4 font-bold">Purpose (Section 4)</th>
                    <th className="py-3 px-4 font-bold">How it Prevents / Detects Leakage</th>
                    <th className="py-3 px-4 font-bold">Project State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5ea]">
                  {filteredMechanisms.map((mech, idx) => (
                    <tr key={idx} className="hover:bg-[#fcfcfd] transition">
                      <td className="py-3.5 px-4 font-bold text-[#222222] whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-[#e95d2a]"></span>
                          <span>{mech.mechanism}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#6b7280]">
                        {mech.category}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#222222]">
                        {mech.purpose}
                      </td>
                      <td className="py-3.5 px-4 text-[#4b5563] leading-relaxed max-w-md">
                        {mech.howItPreventsLeakage}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                          {mech.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-[#e5e5ea] text-xs text-[#6b7280] flex items-center justify-between">
              <span>Showing {filteredMechanisms.length} of {SECURITY_MECHANISMS.length} security mechanisms</span>
              <span className="font-bold text-[#222222]">100% Implemented & Verified in Prototype</span>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: ENGINEERING DELIVERABLES & CODE ARTIFACTS */}
      {mainTab === 'code' && (
        <div className="space-y-6">
          
          {/* Sub-tabs */}
          <div className="bg-white rounded-xl p-4 border border-[#e5e5ea] flex space-x-2 overflow-x-auto">
            {[
              { id: 'prisma', label: 'schema.prisma', icon: Database },
              { id: 'docker', label: 'docker-compose.yml', icon: Server },
              { id: 'nestjs', label: 'NestJS REST API Architecture', icon: Layers },
              { id: 'env', label: '.env.example', icon: Terminal },
              { id: 'security', label: 'Cryptographic Whitepaper', icon: ShieldCheck },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeCodeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCodeTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#e95d2a] text-white shadow-2xs'
                      : 'bg-[#f4f4f6] text-[#4b5563] hover:bg-[#e5e5ea]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Code Container */}
          <div className="bg-[#222222] rounded-xl border border-[#333333] shadow-lg overflow-hidden text-white">
            <div className="p-3.5 bg-[#2d2d30] border-b border-[#3f3f46] flex items-center justify-between text-xs font-mono">
              <span className="text-[#e95d2a] font-bold">
                {activeCodeTab === 'prisma' && 'prisma/schema.prisma'}
                {activeCodeTab === 'docker' && 'docker-compose.yml'}
                {activeCodeTab === 'nestjs' && 'backend/src/architecture_spec.ts'}
                {activeCodeTab === 'env' && '.env.example'}
                {activeCodeTab === 'security' && 'docs/CRYPTO_SPEC.md'}
              </span>

              <button
                onClick={() => {
                  const content = 
                    activeCodeTab === 'prisma' ? PRISMA_SCHEMA :
                    activeCodeTab === 'docker' ? DOCKER_COMPOSE :
                    activeCodeTab === 'nestjs' ? NESTJS_ARCH :
                    activeCodeTab === 'env' ? ENV_EXAMPLE :
                    SECURITY_DOC;
                  copyToClipboard(content, activeCodeTab);
                }}
                className="px-2.5 py-1 rounded bg-[#3f3f46] hover:bg-[#52525b] text-white text-xs font-sans font-bold flex items-center space-x-1.5 transition"
              >
                {copiedKey === activeCodeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#e95d2a]" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-5 font-mono text-xs text-[#d4d4d8] leading-relaxed overflow-x-auto max-h-[580px]">
              {activeCodeTab === 'prisma' && PRISMA_SCHEMA}
              {activeCodeTab === 'docker' && DOCKER_COMPOSE}
              {activeCodeTab === 'nestjs' && NESTJS_ARCH}
              {activeCodeTab === 'env' && ENV_EXAMPLE}
              {activeCodeTab === 'security' && SECURITY_DOC}
            </pre>
          </div>

        </div>
      )}

    </div>
  );
};
