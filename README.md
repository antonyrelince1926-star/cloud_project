# 🔐 Zero-Trust Split-Seal

## Secure Cloud-Based Competitive Examination Question Paper Management System

> A security-focused prototype for protecting highly sensitive
> competitive examination question papers from unauthorized access,
> modification, and premature leakage.

------------------------------------------------------------------------

## 📌 Overview

**Zero-Trust Split-Seal** is a secure cloud-based Question Paper
Management System designed to protect competitive examination question
papers throughout their lifecycle.

The system follows a **Zero-Trust security model**: no single user,
role, storage location, or compromised credential is trusted with
complete control over a question paper.

### Secure Lifecycle

``` text
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

------------------------------------------------------------------------

# 🎯 Problem Statement

Government and competitive examination question papers are highly
sensitive documents.

Potential leakage points include:

-   Unauthorized access
-   Insider threats
-   Compromised accounts
-   Insecure storage
-   Database compromise
-   Unauthorized modification
-   Vulnerable communication channels
-   Premature portal access

The proposed system protects the question paper from creation until
authorized examination-time release.

------------------------------------------------------------------------

# 💡 Proposed Solution

The system uses multiple independent security controls rather than
relying on one security mechanism.

It follows:

> **Never trust. Always verify.**

Before release, the backend verifies:

1.  User authentication
2.  MFA
3.  Role authorization
4.  Centre authorization
5.  Paper validity
6.  Approval status
7.  Digital seal
8.  Time-lock status
9.  Storage fragment integrity
10. SHA-256 verification
11. Digital signature
12. 3-of-5 threshold custody
13. Controlled release authorization

If a critical check fails, release is blocked.

------------------------------------------------------------------------

# 🛡️ Key Security Features

## 1. Multi-Factor Authentication

``` text
Password
   +
One-Time Password (OTP)
```

MFA provides an additional authentication factor if a password is
compromised.

## 2. Role-Based Access Control

### Question Setter

**Can:** create, upload, and submit papers for review.

**Cannot:** approve their own paper, release papers, or access protected
keys.

### Reviewer

**Can:** review assigned papers, approve/reject them, and add review
comments.

**Cannot:** release papers or bypass authority approval.

### Admin / Examination Authority

**Can:** manage examinations, users, reviewers, approvals, digital
signatures, seals, schedules, security events, and audit logs.

**Cannot:** independently bypass release security controls.

### Examination Centre

**Can:** view assigned examinations and receive papers after all release
conditions are satisfied.

**Cannot:** access early, access other centres' papers, or modify
papers.

------------------------------------------------------------------------

# 🔐 3. AES-256-GCM Encryption

Question papers are encrypted before secure storage.

``` text
Question Paper
      ↓
AES-256-GCM Encryption
      ↓
Encrypted Data
```

The plaintext paper is not exposed through normal storage access.

------------------------------------------------------------------------

# 🧩 4. Split Storage

Encrypted paper data is divided into multiple fragments.

``` text
Encrypted Paper
      ↓
 ┌────┼────┐
 ↓    ↓    ↓
 A    B    C
```

The prototype simulates isolated storage vaults:

``` text
Vault A
Vault B
Vault C
```

Fragments are reconstructed only during an authorized release operation.

------------------------------------------------------------------------

# 🔑 5. 3-of-5 Threshold Custody

The system demonstrates threshold authorization:

``` text
5 Authorization Shares
        ↓
Minimum 3 Required
        ↓
Release Authorization
```

No single participant should independently control the complete release
process.

------------------------------------------------------------------------

# ✍️ 6. Digital Signature

After review and final approval, the Examination Authority digitally
signs the approved paper fingerprint.

``` text
Approved Paper
      ↓
SHA-256 Hash
      ↓
Private Signing Key
      ↓
Digital Signature
```

The public key verifies the signature.

If the paper changes:

``` text
Modified Paper
      ↓
Signature Verification
      ↓
❌ INVALID
      ↓
RELEASE BLOCKED
```

------------------------------------------------------------------------

# 🔒 7. Digital Seal

After final approval and signing:

``` text
REVIEW APPROVED
       ↓
AUTHORITY APPROVED
       ↓
DIGITALLY SIGNED
       ↓
🔒 SEALED
```

Normal users cannot modify a sealed paper.

------------------------------------------------------------------------

# ⏰ 8. Time-Lock

Question papers remain inaccessible until the authorized release time.

The system uses **server-side time** instead of trusting the user's
browser clock.

``` text
Release Time: 10:00 AM
Current Time: 09:30 AM

❌ TIME LOCK ACTIVE
```

After release time:

``` text
Release Time: 10:00 AM
Current Time: 10:05 AM

✅ RELEASE WINDOW OPEN
```

------------------------------------------------------------------------

# 🧮 9. Integrity Verification

Storage fragments are verified using checksums and SHA-256.

``` text
Stored Checksum
       ≠
Calculated Checksum
       ↓
🚨 INTEGRITY VIOLATION
       ↓
❌ RELEASE BLOCKED
```

A corrupted or tampered paper cannot be released.

------------------------------------------------------------------------

# 🚨 10. Security Monitoring

The system records:

-   Successful and failed logins
-   MFA failures
-   Unauthorized access
-   Early release attempts
-   Uploads and approvals
-   Paper sealing
-   Integrity violations
-   Signature failures
-   Successful releases

Events are categorized as:

``` text
INFO
WARNING
CRITICAL
```

------------------------------------------------------------------------

# 📋 Question Paper Lifecycle

``` text
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

------------------------------------------------------------------------

# 🏗️ System Architecture

``` text
                         USERS
                           │
            ┌──────────────┼──────────────┐
            │              │              │
          Setter         Reviewer        Admin
            │              │              │
            └──────────────┼──────────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │  Next.js Client  │
                 │ React + TypeScript│
                 └────────┬─────────┘
                          │ HTTPS
                          ▼
                 ┌──────────────────┐
                 │   NestJS API     │
                 │ REST + Guards    │
                 └────────┬─────────┘
                          │
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
      Authentication     RBAC       Security
        + MFA + JWT     Guards       Services
            └─────────────┼─────────────┘
                          ▼
                ┌─────────────────────┐
                │ Question Paper      │
                │ Management Service  │
                └──────────┬──────────┘
                           ▼
                  AES-256-GCM Encryption
                           ▼
                    Fragment Storage
                     /      |                          A       B       C
                           │
                           ▼
                  Integrity Verification
                           ▼
                   Digital Signature
                           ▼
                    3-of-5 Custody
                           ▼
                       Time Lock
                           ▼
                   Controlled Release
                           ▼
                  Examination Centre
```

------------------------------------------------------------------------

# 🧰 Technology Stack

  Layer                Technology
  -------------------- ------------------------
  Frontend Language    TypeScript
  UI Framework         React 18
  Frontend Framework   Next.js 14
  Backend Language     TypeScript
  Backend Runtime      Node.js
  Backend Framework    NestJS
  API                  REST
  Database             PostgreSQL 15
  ORM                  Prisma
  Authentication       JWT
  Password Security    bcrypt
  Encryption           AES-256-GCM
  Hashing              SHA-256
  Digital Signature    RSA-based cryptography
  Infrastructure       Docker
  Orchestration        Docker Compose

------------------------------------------------------------------------

# 📁 Project Structure

``` text
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

------------------------------------------------------------------------

# 🚀 Running the Project

## Prerequisites

-   Node.js
-   Docker
-   Docker Compose
-   Git

## 1. Clone

``` bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd secure-question-paper-system
```

## 2. Configure Environment Variables

Create `.env` from `.env.example`.

Required variables include:

``` text
DATABASE_URL
JWT_SECRET
JWT_REFRESH_SECRET
ENCRYPTION_MASTER_SECRET
ROOT_SIGNING_PRIVATE_KEY
ROOT_SIGNING_PUBLIC_KEY
VAULT_A_PATH
VAULT_B_PATH
VAULT_C_PATH
```

**Never commit real secrets to GitHub.**

## 3. Start

``` bash
docker compose up --build
```

This starts the Next.js frontend, NestJS backend, and PostgreSQL
database.

## 4. Database

``` bash
npx prisma migrate dev
```

If a seed script exists:

``` bash
npx prisma db seed
```

------------------------------------------------------------------------

# 🧪 Security Demonstration Scenarios

## Scenario 1 --- Unauthorized Role Access

``` text
Question Setter
      ↓
Attempts Admin Operation
      ↓
403 Forbidden
      ↓
Audit Event
```

## Scenario 2 --- Early Release Attempt

``` text
Centre
   ↓
Requests Paper Before Release Time
   ↓
Time-Lock Check
   ↓
❌ RELEASE BLOCKED
   ↓
Security Event
```

## Scenario 3 --- Storage Tampering

``` text
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

## Scenario 4 --- Digital Signature Failure

``` text
Paper Modified
      ↓
Signature Verification
      ↓
❌ INVALID
      ↓
Release Blocked
```

## Scenario 5 --- Valid Release

``` text
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

------------------------------------------------------------------------

# 🗄️ Database Entities

Main entities include:

-   Users
-   Examinations
-   Question Papers
-   Question Paper Fragments
-   Reviews
-   Approvals
-   Examination Centres
-   Centre Assignments
-   Release Records
-   Audit Logs

------------------------------------------------------------------------

# 🔒 Security Design Principles

### Least Privilege

Users receive only the permissions required for their role.

### Separation of Duties

The person who creates the paper cannot independently approve and
release it.

### Defense in Depth

Multiple security layers protect the question paper.

### Zero Trust

Every sensitive request is authenticated and authorized.

### Fail Secure

If a security verification fails, release is blocked.

### Integrity Before Availability

A potentially modified paper must never be released merely because the
scheduled time has arrived.

------------------------------------------------------------------------

# 👤 Demo Roles

  Role                            Example User
  ------------------------------- -----------------------
  Admin / Examination Authority   Director Marcus Vance
  Question Setter                 Dr. Aris Thorne
  Reviewer                        Prof. Elena Rostova
  Examination Centre 101          Officer J. Martinez
  Examination Centre 102          Officer T. Chen

> These are prototype/demo identities only.

------------------------------------------------------------------------

# 🎬 Demo Flow

``` text
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

------------------------------------------------------------------------

# ⚠️ Prototype Disclaimer

This project is a **security-focused prototype and academic
demonstration**. It should not be considered production-ready government
examination infrastructure.

A real production deployment would additionally require:

-   Hardware Security Modules (HSM)
-   Cloud Key Management Services
-   Isolated cloud storage accounts
-   Hardware-backed identity
-   Network segmentation
-   SIEM integration
-   Security Operations Centre monitoring
-   Penetration testing
-   Independent security audits
-   Disaster recovery
-   High availability
-   Secure key rotation
-   Formal threat modelling
-   Compliance and regulatory controls

The Docker-based split storage in this prototype simulates isolated
storage vaults.

------------------------------------------------------------------------

# 👨‍💻 Project Author

**Antony Relince. P**

Register Number: **2403717610421071**

Email: **2403717610421071@cit.edu.in**

------------------------------------------------------------------------

# 📜 Project Objective

The objective is to demonstrate how modern cybersecurity principles can
protect highly sensitive examination question papers.

The system combines:

> **Authentication + Authorization + Encryption + Fragmentation +
> Multi-Party Custody + Digital Signature + Integrity Verification +
> Time-Lock + Monitoring**

to provide layered protection from question-paper creation to controlled
examination-time release.

## ⭐ Core Security Principle

> **No single person, compromised account, storage fragment, or security
> failure should be sufficient to obtain or release the complete
> question paper before the authorized examination time.**
