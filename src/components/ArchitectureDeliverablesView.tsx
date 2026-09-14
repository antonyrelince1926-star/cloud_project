import React, { useState } from 'react';
import { 
  FileCode, 
  Layers, 
  Database, 
  Server, 
  ShieldCheck, 
  Copy, 
  Check, 
  Download,
  Terminal
} from 'lucide-react';

export const ArchitectureDeliverablesView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'prisma' | 'docker' | 'nestjs' | 'env' | 'security'>('prisma');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

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

enum UserStatus {
  ACTIVE
  LOCKED
  SUSPENDED
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

enum SeverityLevel {
  INFO
  WARNING
  CRITICAL
}

enum ActionResult {
  SUCCESS
  BLOCKED
  FAILED
}

model User {
  id                   String              @id @default(uuid())
  name                 String
  email                String              @unique
  passwordHash         String
  role                 UserRole
  status               UserStatus          @default(ACTIVE)
  mfaEnabled           boolean             @default(true)
  mfaSecret            String?
  failedLoginAttempts  Int                 @default(0)
  lastLogin            DateTime?
  centreId             String?
  centre               ExaminationCentre?  @relation(fields: [centreId], references: [id])
  authoredPapers       QuestionPaper[]     @relation("AuthoredPapers")
  reviews              Review[]
  approvals            Approval[]
  auditLogs            AuditLog[]
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt

  @@index([email])
  @@index([role])
}

model Examination {
  id              String              @id @default(uuid())
  name            String
  code            String              @unique
  examDate        DateTime
  releaseTime     DateTime
  durationMinutes Int
  totalMarks      Int
  status          String              @default("SCHEDULED")
  papers          QuestionPaper[]
  centreMaps      CentreAssignment[]
  releaseRecords  ReleaseRecord[]
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  @@index([code])
  @@index([releaseTime])
}

model QuestionPaper {
  id                 String                  @id @default(uuid())
  examinationId      String
  examination        Examination             @relation(fields: [examinationId], references: [id], onDelete: Cascade)
  createdBy          String
  author             User                    @relation("AuthoredPapers", fields: [createdBy], references: [id])
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
  originalFileName   String
  fileSize           Int
  fragments          QuestionPaperFragment[]
  reviews            Review[]
  approvals          Approval[]
  releaseRecords     ReleaseRecord[]
  createdAt          DateTime                @default(now())
  updatedAt          DateTime                @updatedAt

  @@index([examinationId])
  @@index([status])
  @@index([fileHash])
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
  @@index([checksum])
}

model Review {
  id          String        @id @default(uuid())
  paperId     String
  paper       QuestionPaper @relation(fields: [paperId], references: [id], onDelete: Cascade)
  reviewerId  String
  reviewer    User          @relation(fields: [reviewerId], references: [id])
  decision    String        // APPROVED, REJECTED, REQUEST_CHANGES
  comments    String
  reviewedAt  DateTime      @default(now())

  @@index([paperId])
  @@index([reviewerId])
}

model Approval {
  id           String        @id @default(uuid())
  paperId      String
  paper        QuestionPaper @relation(fields: [paperId], references: [id], onDelete: Cascade)
  approverId   String
  approver     User          @relation(fields: [approverId], references: [id])
  approvalType String        // REVIEWER_SHARE, ADMIN_SHARE, AUTHORITY_SHARE
  shareIndex   Int           // 1 to 5 for 3-of-5 threshold custody
  status       String        // SIGNED, REVOKED
  signatureToken String?
  approvedAt   DateTime      @default(now())

  @@unique([paperId, shareIndex])
}

model ExaminationCentre {
  id          String              @id @default(uuid())
  name        String
  code        String              @unique
  city        String
  status      String              @default("AUTHORIZED")
  ipWhitelist String              // CIDR format, e.g. "198.51.100.42/32"
  users       User[]
  assignments CentreAssignment[]
  releases    ReleaseRecord[]
  createdAt   DateTime            @default(now())

  @@index([code])
}

model CentreAssignment {
  id            String            @id @default(uuid())
  examinationId String
  examination   Examination       @relation(fields: [examinationId], references: [id], onDelete: Cascade)
  centreId      String
  centre        ExaminationCentre @relation(fields: [centreId], references: [id], onDelete: Cascade)
  assignedAt    DateTime          @default(now())

  @@unique([examinationId, centreId])
}

model ReleaseRecord {
  id                 String            @id @default(uuid())
  paperId            String
  paper              QuestionPaper     @relation(fields: [paperId], references: [id])
  examinationId      String
  examination        Examination       @relation(fields: [examinationId], references: [id])
  centreId           String
  centre             ExaminationCentre @relation(fields: [centreId], references: [id])
  releasedToUser     String
  releasedAt         DateTime          @default(now())
  status             String            // SUCCESS, BLOCKED_TIME_LOCK, BLOCKED_INTEGRITY
  singleUseToken     String            @unique
  tokenExpiresAt     DateTime
  verificationResult Json              // Complete 13-gate evaluation dump

  @@index([paperId])
  @@index([centreId])
}

model AuditLog {
  id           String        @id @default(uuid())
  timestamp    DateTime      @default(now())
  userId       String?
  user         User?         @relation(fields: [userId], references: [id], onDelete: SetNull)
  userName     String
  role         UserRole
  action       String
  resourceType String
  resourceId   String
  severity     SeverityLevel
  result       ActionResult
  ipAddress    String
  userAgent    String
  metadata     Json?

  @@index([timestamp])
  @@index([action])
  @@index([severity])
  @@index([resourceId])
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
      - ./backend/prisma/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - secure_internal_net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U custody_admin -d exam_custody_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: exam_nestjs_api
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 4000
      DATABASE_URL: postgresql://custody_admin:\${POSTGRES_PASSWORD:-SecOpsPasswd2026!}@postgres:5432/exam_custody_db
      JWT_SECRET: \${JWT_SECRET:-kY8!xR2#vP9$mQ5*zL1^wE4@jT7&sA3}
      JWT_REFRESH_SECRET: \${JWT_REFRESH_SECRET:-hN4*uC8%bF2!yJ6#tV9@pW1^xD5}
      ENCRYPTION_MASTER_SEED: \${ENCRYPTION_MASTER_SEED:-000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f}
      ROOT_SIGNING_PRIVATE_KEY: \${ROOT_SIGNING_PRIVATE_KEY:-ED25519_PRIVATE_ROOT_2026_GOV_SEAL}
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
   POST   /auth/login             -> Validates bcrypt hash, issues MFA challenge OTP
   POST   /auth/mfa/verify        -> Validates cryptographically random OTP, returns JWT tokens
   POST   /auth/refresh           -> Rotates short-lived access token via refresh token
   POST   /auth/logout            -> Revokes active session tokens

2. QuestionPapersModule (/papers)
   POST   /papers                 -> [Roles: SETTER] Validates PDF, executes AES-256-GCM, fragments into Store A/B/C
   GET    /papers                 -> Returns papers filtered by role ownership & assignment
   GET    /papers/:id             -> Returns paper metadata & custody state (No raw plaintext)
   POST   /papers/:id/submit      -> [Roles: SETTER] DRAFT -> SUBMITTED

3. ReviewsModule (/reviews)
   POST   /reviews/:paperId/start -> [Roles: REVIEWER] SUBMITTED -> UNDER_REVIEW
   POST   /reviews/:paperId       -> [Roles: REVIEWER] APPROVE / REJECT, signs Share 1

4. ApprovalsModule (/approvals)
   POST   /approvals/:paperId/authority -> [Roles: ADMIN] Signs Authority Share (Share 2/3)
   POST   /approvals/:paperId/threshold -> [Roles: ADMIN] Evaluates 3-of-5 threshold keyring
   POST   /papers/:paperId/seal         -> [Roles: ADMIN] Immutably seals paper with digital signature

5. ReleasesModule (/releases)
   POST   /releases/:paperId/request    -> [Roles: CENTRE] Executes 13-gate server verification:
                                           1. Time-Lock (Server Time >= Exam Release Time)
                                           2. Fragment A/B/C Checksums
                                           3. Reassembly & SHA-256 Master Digest
                                           4. Digital Signature verification
                                           5. 3-of-5 Threshold check
                                           6. Issues 90-second single-use release token
   GET    /releases/:paperId/status     -> Live status & countdown

6. Security & Audit Module (/admin)
   GET    /admin/audit-logs             -> Immutable append-only audit trail
   GET    /admin/security-events        -> SIEM alert aggregation & anomaly metrics`;

  const ENV_EXAMPLE = `# .env.example
# Zero-Trust Split-Seal Competitive Examination System

# Database Connection (PostgreSQL 15)
DATABASE_URL="postgresql://custody_admin:SecOpsPasswd2026!@localhost:5432/exam_custody_db?schema=public"

# Authentication Secrets (Generate using openssl rand -base64 32)
JWT_SECRET="kY8!xR2#vP9$mQ5*zL1^wE4@jT7&sA3"
JWT_REFRESH_SECRET="hN4*uC8%bF2!yJ6#tV9@pW1^xD5"
JWT_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Cryptographic Master Seeds & KMS Mock Abstraction
ENCRYPTION_MASTER_SEED="000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f"
ROOT_SIGNING_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC51F9waF0+Cn4N...\\n-----END PRIVATE KEY-----"
ROOT_SIGNING_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAudRfcGhdPgp+DZ6aE4mT...\\n-----END PUBLIC KEY-----"

# Split Storage Path Directories
VAULT_A_PATH="/var/sec-storage/vault-alpha"
VAULT_B_PATH="/var/sec-storage/vault-beta"
VAULT_C_PATH="/var/sec-storage/vault-gamma"

# Port & Server Configuration
PORT=4000
FRONTEND_PORT=3000
NODE_ENV="development"`;

  const SECURITY_DOC = `# Zero-Trust Split-Seal Cryptographic Specification

## Central Security Principle:
"No single user, administrator, database, storage location, or compromised credential should be sufficient to access or release the complete question paper before the authorized examination time."

### 1. Authenticated Encryption (AES-256-GCM)
Every paper is encrypted using Galois/Counter Mode (GCM) with a 256-bit ephemeral key and a unique 96-bit Initialization Vector (IV). GCM guarantees confidentiality and ciphertext authenticity via a 128-bit authentication tag, making bit-flipping mathematically detectable.

### 2. Split Storage Fragmentation (Store A, Store B, Store C)
The ciphertext is divided into 3 distinct slices stored across isolated virtual volumes:
- Store A: Encrypted Header Vault (Contains document metadata and leading chunk)
- Store B: Encrypted Core Vault (Contains question payload)
- Store C: Encrypted Tail & Tag Vault (Contains GCM auth tag and trailing chunk)
Each fragment is hashed with SHA-256 on creation. Reassembly requires 100% checksum parity across all three stores.

### 3. 3-of-5 Threshold Authorization Keyring
No single official can order a release. Authorization requires at least 3 of 5 independent cryptographic endorsements:
1. Academic Review Committee
2. Controller of Examinations
3. Examination Authority General
4. Chief Cyber Security Officer
5. Backup Custodian Keyring

### 4. Authoritative Time-Lock Engine
Release requests are evaluated against authoritative server system time. If current_server_time < release_time, the engine blocks release, generates an HTTP 423/403 response, and logs an early release alert.

### 5. Digital Signature & Seal Immutability
Upon reaching 3-of-5 approval, the paper is signed using the Authority Private Key and marked sealed=true. Any further write or delete operations fail at the database and application levels.`;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-[#e5e5ea] shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-[#222222] flex items-center justify-center text-white">
            <FileCode className="w-5 h-5 text-[#e95d2a]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#222222] tracking-tight">
              Engineering Architecture & Deliverables
            </h1>
            <p className="text-xs text-[#6b7280]">
              Full Prisma Schema • Docker Compose • NestJS Modular Spec • .env Configuration • Security Model
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="mt-5 pt-4 border-t border-[#e5e5ea] flex space-x-2 overflow-x-auto">
          {[
            { id: 'prisma', label: 'schema.prisma', icon: Database },
            { id: 'docker', label: 'docker-compose.yml', icon: Server },
            { id: 'nestjs', label: 'NestJS REST API Architecture', icon: Layers },
            { id: 'env', label: '.env.example', icon: Terminal },
            { id: 'security', label: 'Cryptographic Whitepaper', icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
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
      </div>

      {/* Code Container */}
      <div className="bg-[#222222] rounded-xl border border-[#333333] shadow-lg overflow-hidden text-white">
        <div className="p-3.5 bg-[#2d2d30] border-b border-[#3f3f46] flex items-center justify-between text-xs font-mono">
          <span className="text-[#e95d2a] font-bold">
            {activeSubTab === 'prisma' && 'prisma/schema.prisma'}
            {activeSubTab === 'docker' && 'docker-compose.yml'}
            {activeSubTab === 'nestjs' && 'backend/src/architecture_spec.ts'}
            {activeSubTab === 'env' && '.env.example'}
            {activeSubTab === 'security' && 'docs/CRYPTO_SPEC.md'}
          </span>

          <button
            onClick={() => {
              const content = 
                activeSubTab === 'prisma' ? PRISMA_SCHEMA :
                activeSubTab === 'docker' ? DOCKER_COMPOSE :
                activeSubTab === 'nestjs' ? NESTJS_ARCH :
                activeSubTab === 'env' ? ENV_EXAMPLE :
                SECURITY_DOC;
              copyToClipboard(content, activeSubTab);
            }}
            className="px-2.5 py-1 rounded bg-[#3f3f46] hover:bg-[#52525b] text-white text-xs font-sans font-bold flex items-center space-x-1.5 transition"
          >
            {copiedKey === activeSubTab ? (
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
          {activeSubTab === 'prisma' && PRISMA_SCHEMA}
          {activeSubTab === 'docker' && DOCKER_COMPOSE}
          {activeSubTab === 'nestjs' && NESTJS_ARCH}
          {activeSubTab === 'env' && ENV_EXAMPLE}
          {activeSubTab === 'security' && SECURITY_DOC}
        </pre>
      </div>

    </div>
  );
};
