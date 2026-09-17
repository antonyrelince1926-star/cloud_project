# 🔐 Zero-Trust Split-Seal

## Secure Cloud-Based Competitive Examination Question Paper Management System

> A security-focused prototype for protecting highly sensitive competitive examination question papers from unauthorized access, modification, and premature leakage.

---

## 📌 Overview

**Zero-Trust Split-Seal** is a secure cloud-based Question Paper Management System designed to protect competitive examination question papers throughout their lifecycle.

The system follows a **Zero-Trust security model**: every sensitive request is authenticated and authorized, and no single user, role, storage location, or compromised credential should be sufficient to independently release the complete question paper.

### Secure Lifecycle

```text
Question Creation
       ↓
Authentication + MFA
       ↓
Role-Based Access Control
       ↓
Encrypted Storage
       ↓
Fragmented Storage
       ↓
Reviewer Approval
       ↓
Authority Approval
       ↓
Digital Signature
       ↓
Digital Seal
       ↓
3-of-5 Custody
       ↓
Time Lock
       ↓
Integrity Verification
       ↓
Controlled Release
       ↓
Examination Centre
```

---

## 🎯 Problem Statement

Competitive examination question papers are highly sensitive documents. A leak before the scheduled examination can compromise the fairness and integrity of the examination.

Potential leakage points include:

- Unauthorized access
- Insider threats
- Compromised accounts
- Insecure storage
- Database compromise
- Unauthorized modification
- Vulnerable communication channels
- Premature portal access

The proposed system protects the question paper from creation through controlled examination-time release.

---

## 💡 Proposed Solution

The system uses multiple independent security controls rather than relying on a single security mechanism.

It follows the principle:

> **Never trust. Always verify.**

Before a question paper is released, the system performs multiple security and authorization checks, including:

1. User authentication
2. MFA verification
3. Role authorization
4. Examination-centre authorization
5. Paper validity checks
6. Approval-status verification
7. Digital-seal verification
8. Time-lock verification
9. Storage-fragment integrity verification
10. SHA-256 verification
11. Digital-signature verification
12. 3-of-5 custody verification
13. Controlled-release authorization

If a critical security check fails, the release operation is blocked.

---

# 🛡️ Key Security Features

## 1. Multi-Factor Authentication

The system uses MFA to provide an additional authentication layer beyond the user's password.

```text
Password
   +
One-Time Password (OTP)
   ↓
Authenticated User
```

MFA helps protect accounts if a password is compromised.

---

## 2. Role-Based Access Control

Access is controlled according to the user's assigned role and required responsibilities.

### Question Setter

**Can:**

- Create question papers
- Upload question papers
- Submit papers for review

**Cannot:**

- Approve their own paper
- Release papers
- Access protected release keys

### Reviewer

**Can:**

- Review assigned papers
- Approve or reject papers
- Add review comments

**Cannot:**

- Release papers
- Bypass authority approval

### Admin / Examination Authority

**Can:**

- Manage examinations
- Manage users
- Manage reviewers
- Manage approvals
- Perform authorized digital-signature operations
- Manage seals
- Configure schedules
- Monitor security events
- View audit logs

**Cannot:**

- Independently bypass the release security controls

### Examination Centre

**Can:**

- View assigned examinations
- Receive question papers after all release conditions are satisfied

**Cannot:**

- Access papers before release
- Access papers assigned to other centres
- Modify question papers

---

## 3. AES-256-GCM Encryption

Question-paper data is encrypted before secure storage using AES-256-GCM.

```text
Question Paper
      ↓
AES-256-GCM Encryption
      ↓
Encrypted Data
      ↓
Secure Storage
```

The plaintext question paper is not exposed through normal storage access.

---

## 4. Split Storage

Encrypted question-paper data is divided into multiple fragments.

```text
Encrypted Paper
       ↓
   ┌───┼───┐
   ↓   ↓   ↓
   A   B   C
```

The prototype uses isolated storage vaults:

```text
Vault A
Vault B
Vault C
```

The fragments are reconstructed only during an authorized release operation.

> **Prototype note:** the Docker-based vaults simulate isolated storage locations. A production deployment would use independently isolated storage infrastructure.

---

## 5. 3-of-5 Threshold Custody

The system demonstrates multi-party release authorization using a 3-of-5 custody model.

```text
5 Authorization Shares
          ↓
   Minimum 3 Required
          ↓
 Release Authorization
```

At least three authorized custody participants are required for the release authorization process.

This prevents a single participant from independently controlling the complete release process.

---

## 6. Digital Signature

After review and final approval, the Examination Authority digitally signs the approved paper fingerprint.

```text
Approved Paper
      ↓
   SHA-256 Hash
      ↓
Private Signing Key
      ↓
Digital Signature
```

The corresponding public key is used to verify the signature.

If the signed content is modified:

```text
Modified Paper
      ↓
Signature Verification
      ↓
❌ INVALID
      ↓
RELEASE BLOCKED
```

---

## 7. Digital Seal

After the required approvals and digital signing process are completed, the question paper is sealed.

```text
REVIEW APPROVED
       ↓
AUTHORITY APPROVED
       ↓
DIGITALLY SIGNED
       ↓
🔒 SEALED
```

Normal users cannot modify a sealed question paper through the application workflow.

---

## 8. Time-Lock

Question papers remain inaccessible until their configured release time.

The system uses **server-side time** rather than trusting the user's browser clock.

Example:

```text
Release Time: 10:00 AM
Current Time: 09:30 AM

❌ TIME LOCK ACTIVE
```

After the release time:

```text
Release Time: 10:00 AM
Current Time: 10:05 AM

✅ RELEASE WINDOW OPEN
```

The release process still requires the other authorization and integrity checks to succeed.

---

## 9. Integrity Verification

Stored fragments are verified using checksums and SHA-256-based integrity verification.

```text
Stored Checksum
       ≠
Calculated Checksum
       ↓
🚨 INTEGRITY VIOLATION
       ↓
❌ RELEASE BLOCKED
```

A corrupted or tampered question paper cannot proceed through the normal release process.

---

## 10. Security Monitoring and Audit Logging

The system records security-sensitive events such as:

- Successful login attempts
- Failed login attempts
- MFA failures
- Unauthorized access attempts
- Early release attempts
- Question-paper uploads
- Approval actions
- Paper sealing
- Integrity violations
- Digital-signature failures
- Successful releases

Security events are categorized according to their severity, including:

```text
INFO
WARNING
CRITICAL
```

These records provide traceability for security investigation and accountability.

---

# 📋 Question Paper Lifecycle

A question paper follows a controlled state-based lifecycle:

```text
DRAFT
  ↓
SUBMITTED
  ↓
UNDER REVIEW
  ↓
REVIEW APPROVED
  ↓
AUTHORITY APPROVED
  ↓
SEALED
  ↓
TIME LOCKED
  ↓
RELEASED
```

A paper cannot directly transition from `DRAFT` to `RELEASED`.

---

# 🏗️ System Architecture

```text
                         USERS
                           │
              ┌────────────┼────────────┐
              │            │            │
            Setter       Reviewer      Admin
              │            │            │
              └────────────┼────────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │   Next.js Client   │
                 │ React + TypeScript │
                 └─────────┬──────────┘
                           │
                         HTTPS
                           │
                           ▼
                 ┌────────────────────┐
                 │    NestJS API      │
                 │ REST + Security    │
                 │      Guards        │
                 └─────────┬──────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        Authentication    RBAC      Security
          + MFA + JWT     Guards      Services
              └────────────┼────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Question Paper       │
                │ Management Service   │
                └──────────┬───────────┘
                           │
                           ▼
                   AES-256-GCM
                    Encryption
                           │
                           ▼
                   Fragment Storage
                    /      |      \
                   A       B       C
                    \      |      /
                           │
                           ▼
                 Integrity Verification
                           │
                           ▼
                  Digital Signature
                           │
                           ▼
                    Digital Seal
                           │
                           ▼
                     3-of-5 Custody
                           │
                           ▼
                       Time Lock
                           │
                           ▼
                  Controlled Release
                           │
                           ▼
                 Examination Centre
```

### Security Monitoring Layer

```text
┌──────────────────────────────────────────────┐
│        Security Monitoring & Audit           │
│                                              │
│  Authentication Events                       │
│  Authorization Events                        │
│  MFA Failures                                │
│  Early Release Attempts                      │
│  Approval Events                             │
│  Integrity Violations                        │
│  Signature Failures                          │
│  Release Events                              │
│  Audit Logs                                  │
└──────────────────────────────────────────────┘
```

---

# 🧰 Technology Stack

| Layer | Technology |
|---|---|
| Frontend Language | TypeScript |
| UI Framework | React 18 |
| Frontend Framework | Next.js 14 |
| Frontend Architecture | App Router |
| Backend Language | TypeScript |
| Backend Runtime | Node.js |
| Backend Framework | NestJS |
| API | REST |
| Database | PostgreSQL 15 |
| ORM | Prisma |
| Authentication | JWT |
| Password Security | bcrypt |
| MFA | OTP-based MFA |
| Encryption | AES-256-GCM |
| Hashing | SHA-256 |
| Digital Signature | RSA-based cryptography |
| Containerization | Docker |
| Local Orchestration | Docker Compose |
| Deployment | Vercel |

---

# 📁 Project Structure

```text
secure-question-paper-system/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── types/
│   └── styles/
│
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── examinations/
│   │   ├── question-papers/
│   │   ├── reviews/
│   │   ├── approvals/
│   │   ├── releases/
│   │   ├── security/
│   │   └── audit/
│   │
│   └── prisma/
│       └── schema.prisma
│
├── storage/
│   ├── vault-a/
│   ├── vault-b/
│   └── vault-c/
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# 🚀 Running the Project

## Prerequisites

Install the following:

- Node.js
- Docker
- Docker Compose
- Git
- PostgreSQL (if running the database outside Docker)

---

## 1. Clone the Repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd secure-question-paper-system
```

---

## 2. Configure Environment Variables

Create the required `.env` file using `.env.example`.

The project uses environment variables for database connectivity, authentication secrets, encryption configuration, signing keys, and storage-vault paths.

Example variable names:

```env
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
ENCRYPTION_MASTER_SECRET=
ROOT_SIGNING_PRIVATE_KEY=
ROOT_SIGNING_PUBLIC_KEY=
VAULT_A_PATH=
VAULT_B_PATH=
VAULT_C_PATH=
```

> **Security:** Never commit real passwords, JWT secrets, encryption secrets, private signing keys, OTP secrets, or other production credentials to GitHub.

---

## 3. Start the Application

Using Docker Compose:

```bash
docker compose up --build
```

This starts the required application services and database according to the project's Docker configuration.

---

## 4. Database Setup

Run Prisma migrations when required:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

If the project contains a seed configuration:

```bash
npx prisma db seed
```

---

# 🧪 Security Demonstration Scenarios

## Scenario 1 — Unauthorized Role Access

```text
Question Setter
       ↓
Attempts Restricted Admin Operation
       ↓
403 Forbidden
       ↓
Audit Event
```

---

## Scenario 2 — Early Release Attempt

```text
Examination Centre
       ↓
Requests Paper Before Release Time
       ↓
Time-Lock Check
       ↓
❌ RELEASE BLOCKED
       ↓
Security Event Recorded
```

---

## Scenario 3 — Storage Tampering

```text
Storage Fragment Modified
          ↓
Checksum Verification
          ↓
❌ MISMATCH
          ↓
Integrity Violation
          ↓
❌ RELEASE ABORTED
```

---

## Scenario 4 — Digital Signature Failure

```text
Paper Modified
      ↓
Signature Verification
      ↓
❌ INVALID
      ↓
Release Blocked
```

---

## Scenario 5 — Valid Release

```text
Authentication ✓
MFA ✓
Role ✓
Centre Assignment ✓
Approval ✓
Digital Seal ✓
3-of-5 Custody ✓
Time Lock ✓
Integrity ✓
Digital Signature ✓
        ↓
🟢 RELEASE AUTHORIZED
        ↓
Question Paper Delivered
```

---

# 🗄️ Database Entities

The system manages entities representing the question-paper lifecycle and its security controls, including:

- Users
- Examinations
- Question Papers
- Question Paper Fragments
- Reviews
- Approvals
- Examination Centres
- Centre Assignments
- Release Records
- Audit Logs

---

# 🔒 Security Design Principles

## Least Privilege

Users receive only the permissions required for their assigned role.

## Separation of Duties

The person who creates a question paper cannot independently approve and release that paper.

## Defense in Depth

Multiple security mechanisms protect the question paper instead of relying on a single control.

## Zero Trust

Sensitive requests are authenticated and authorized before access is granted.

## Fail Secure

If a required security verification fails, the release operation is blocked.

## Integrity Before Availability

A question paper that fails integrity or signature verification must not be released merely because its scheduled release time has arrived.

---

# 👤 Prototype Roles

The prototype demonstrates the following roles:

| Role | Responsibility |
|---|---|
| **Admin / Examination Authority** | System administration, examination management, approvals, signing, sealing, security monitoring |
| **Question Setter** | Creates and submits question papers |
| **Reviewer** | Reviews and approves/rejects assigned papers |
| **Examination Centre** | Receives assigned question papers after release conditions are satisfied |

Demo identities, if present in the application, are **prototype/demo identities only** and should not be treated as real government personnel.

---

# 🎬 Recommended Demo Flow

For demonstrating the system:

```text
Login
  ↓
MFA Authentication
  ↓
Create Question Paper
  ↓
Submit for Review
  ↓
Reviewer Approval
  ↓
Authority Approval
  ↓
Digital Signature
  ↓
Digital Seal
  ↓
Encryption + Fragment Storage
  ↓
3-of-5 Custody
  ↓
Time Lock
  ↓
Integrity Verification
  ↓
Controlled Release
  ↓
Centre Views Question Paper
```

---

# 🌐 Live Prototype

The deployed prototype is available at:

**https://cloud-project-woad-eight.vercel.app/**

---

# ⚠️ Prototype Disclaimer

This project is a **security-focused prototype and academic demonstration**. It should not be considered production-ready government examination infrastructure.

The prototype demonstrates the security architecture and controls required for secure question-paper management. Some infrastructure-level controls required for a real government deployment would require dedicated production infrastructure.

A production deployment would additionally require measures such as:

- Hardware Security Modules (HSM)
- Cloud Key Management Services (KMS)
- Independently isolated cloud storage accounts
- Hardware-backed identity
- Network segmentation
- SIEM integration
- Security Operations Centre monitoring
- Professional penetration testing
- Independent security audits
- Disaster recovery
- High availability
- Secure key rotation
- Formal threat modelling
- Compliance and regulatory controls

The Docker-based split-storage implementation is intended to simulate isolated storage vaults within the prototype.

---

# 🎯 Project Objective

The objective of the project is to demonstrate how modern cybersecurity principles can be applied to protect highly sensitive examination question papers.

The system combines:

> **Authentication + MFA + Authorization + Encryption + Fragmentation + Multi-Party Custody + Digital Signature + Digital Seal + Integrity Verification + Time-Lock + Monitoring**

to provide layered protection from question-paper creation through controlled examination-time release.

---

# ⭐ Core Security Principle

> **No single person, compromised account, storage fragment, or individual security failure should be sufficient to obtain or release the complete question paper before the authorized examination time.**

---

## 📜 License

This project is developed as an academic cybersecurity prototype.

Add an appropriate open-source license file if the project is intended to be distributed publicly.
