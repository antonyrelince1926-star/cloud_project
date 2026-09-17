# Zero-Trust Split-Seal

## Secure Cloud-Based Competitive Examination Question Paper Management System

## 1. Project Description

**Zero-Trust Split-Seal** is a security-focused prototype for managing
highly sensitive competitive examination question papers in a controlled
cloud-based environment.

The system is designed to protect question papers against:

-   Unauthorized access
-   Insider threats
-   Compromised user accounts
-   Unauthorized modification
-   Premature disclosure or leakage
-   Storage tampering
-   Unauthorized release

The system follows a **Zero-Trust security model**, where no single
user, role, storage location, or compromised credential is trusted with
complete control over a question paper.

### Secure Question Paper Lifecycle

``` text
Question Creation
       ↓
Authentication + MFA
       ↓
Role-Based Access Control
       ↓
AES-256-GCM Encryption
       ↓
Fragmented Storage
       ↓
Reviewer Approval
       ↓
Authority Approval
       ↓
SHA-256 Hash + Digital Signature
       ↓
Digital Seal
       ↓
3-of-5 Custody Verification
       ↓
Time Lock
       ↓
Integrity Verification
       ↓
Controlled Release
       ↓
Authorized Examination Centre
```

------------------------------------------------------------------------

## 2. Key Features

### Authentication and MFA

The system uses secure authentication with:

-   JWT-based authentication
-   Password hashing using bcrypt
-   Multi-Factor Authentication (MFA)
-   OTP-based second-factor verification
-   Access and refresh tokens

MFA requires more than just a password before sensitive operations can
be performed.

### Role-Based Access Control

The system applies RBAC and least-privilege principles.

  -----------------------------------------------------------------------
  Role                    Main Responsibilities   Restrictions
  ----------------------- ----------------------- -----------------------
  **Question Setter**     Create, upload, and     Cannot approve own
                          submit question papers  paper, release papers,
                                                  or access protected
                                                  keys

  **Reviewer**            Review assigned papers, Cannot release papers
                          approve/reject papers,  or bypass authority
                          add comments            approval

  **Admin / Examination   Manage examinations,    Cannot independently
  Authority**             users, reviewers,       bypass release controls
                          approvals, signatures,  
                          seals, schedules,       
                          security events, and    
                          audit logs              

  **Examination Centre**  View assigned           Cannot access papers
                          examinations and        early, access other
                          receive papers after    centres' papers, or
                          authorization           modify papers
  -----------------------------------------------------------------------

### AES-256-GCM Encryption

Question papers are encrypted using **AES-256-GCM** before secure
storage.

The system is designed so that normal storage access does not expose the
plaintext question paper.

### Fragmented Storage

After encryption, the encrypted paper is divided into multiple
fragments.

The prototype simulates isolated storage vaults:

``` text
Encrypted Question Paper
          ↓
      Fragmentation
       ↙    ↓    ↘
 Vault A  Vault B  Vault C
```

The fragments are reconstructed only during an authorized release
process.

> **Prototype note:** The isolated vaults are simulated using separate
> storage locations in the Docker-based prototype. Production deployment
> would use properly isolated cloud storage or storage accounts.

### 3-of-5 Threshold Custody

The release authorization process uses a **3-of-5 custody model**.

Five authorization shares are maintained, and at least three are
required for release authorization.

``` text
5 Authorization Shares
        ↓
Minimum 3 Required
        ↓
Release Authorization
```

This reduces dependence on a single authority or compromised credential.

### Digital Signature

After review and final authority approval, the approved paper
fingerprint is digitally signed.

The process is:

``` text
Approved Paper
      ↓
SHA-256 Hash
      ↓
Private Signing Key
      ↓
Digital Signature
```

The corresponding public key is used for verification.

If the paper is modified after signing, the signature verification fails
and release is blocked.

### Digital Seal

A paper becomes sealed after:

1.  Reviewer approval
2.  Authority approval
3.  Digital signature

A sealed paper cannot be normally modified by users.

### Time-Lock

Question papers remain inaccessible until their configured release time.

The release decision is based on **server-side time**, rather than the
browser's local clock.

Example:

``` text
Configured Release Time: 10:00 AM

Current Server Time: 09:30 AM
Result: RELEASE BLOCKED

Current Server Time: 10:05 AM
Result: Release window available
```

### Integrity Verification

The system verifies stored fragments and the complete paper using
checksums and SHA-256 hashing.

If a storage fragment is modified or corrupted:

``` text
Checksum Mismatch
       ↓
Integrity Violation
       ↓
Release Aborted
```

### Security Monitoring and Audit Logging

Security-sensitive events are recorded in audit logs.

Examples include:

-   Successful login
-   Failed login
-   MFA failure
-   Unauthorized access attempts
-   Early release attempts
-   Question paper uploads
-   Review and approval events
-   Paper sealing
-   Integrity violations
-   Signature verification failures
-   Successful releases

Events can be categorized as:

-   `INFO`
-   `WARNING`
-   `CRITICAL`

------------------------------------------------------------------------

## 3. Problem Statement

Competitive examination question papers contain highly sensitive
information and require strict confidentiality and integrity controls.

Traditional systems can be exposed to risks such as:

-   Unauthorized user access
-   Insider threats
-   Compromised accounts
-   Insecure storage
-   Database compromise
-   Unauthorized modification
-   Vulnerable communication channels
-   Premature access through examination portals

A compromise of a single account or storage system should not be
sufficient to obtain or release the complete question paper.

------------------------------------------------------------------------

## 4. Proposed Solution

The proposed **Zero-Trust Split-Seal** system applies multiple security
layers throughout the question paper lifecycle.

Before a question paper can be released, the backend verifies:

1.  User authentication
2.  MFA verification
3.  Role authorization
4.  Examination centre authorization
5.  Question paper validity
6.  Review and approval status
7.  Digital seal
8.  Time-lock status
9.  Storage fragment integrity
10. SHA-256 verification
11. Digital signature
12. 3-of-5 threshold custody
13. Controlled release authorization

If any critical security check fails, the release operation is blocked.

### Core Principle

> **Never Trust. Always Verify.**

No single person, compromised account, storage fragment, or security
failure should be sufficient to obtain or release a complete question
paper before the authorized time.

------------------------------------------------------------------------

## 5. Security Mechanisms

  -----------------------------------------------------------------------
  Security Mechanism                  Purpose
  ----------------------------------- -----------------------------------
  **MFA**                             Provides an additional
                                      authentication factor using OTP

  **RBAC**                            Restricts actions according to user
                                      role

  **Least Privilege**                 Gives users only the permissions
                                      required for their responsibilities

  **AES-256-GCM**                     Encrypts question papers before
                                      storage

  **Fragmented Storage**              Prevents one storage location from
                                      containing the complete protected
                                      paper

  **3-of-5 Custody**                  Requires multiple authorization
                                      shares for controlled release

  **SHA-256**                         Detects changes to protected data

  **Digital Signature**               Verifies authenticity and integrity
                                      of the approved paper

  **Digital Seal**                    Prevents normal modification after
                                      final approval

  **Time-Lock**                       Prevents release before the
                                      configured release time

  **Audit Logs**                      Records security-sensitive
                                      activities

  **Anomaly Monitoring**              Helps identify suspicious or
                                      abnormal activities

  **TLS/HTTPS**                       Protects data during network
                                      communication

  **KMS/HSM**                         Recommended for secure key
                                      management in production
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 6. Question Paper Lifecycle

The system enforces a controlled lifecycle:

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

A paper cannot directly move from:

``` text
DRAFT → RELEASED
```

The required approval and security stages must be completed first.

------------------------------------------------------------------------

## 7. System Architecture

``` text
                         USERS
                           │
                           ▼
              ┌─────────────────────────┐
              │ Next.js Client          │
              │ React + TypeScript      │
              └────────────┬────────────┘
                           │ HTTPS
                           ▼
              ┌─────────────────────────┐
              │ NestJS REST API         │
              │ Guards + Services       │
              └────────────┬────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   Authentication      RBAC Guards     Security Services
       + MFA
          │                │                │
          └────────────────┼────────────────┘
                           ▼
              ┌─────────────────────────┐
              │ Question Paper         │
              │ Management Service      │
              └────────────┬────────────┘
                           ▼
              ┌─────────────────────────┐
              │ AES-256-GCM Encryption  │
              └────────────┬────────────┘
                           ▼
                   Fragment Storage
                    ↙     ↓      ↘
                 Vault A Vault B Vault C
                           │
                           ▼
              ┌─────────────────────────┐
              │ Integrity Verification  │
              └────────────┬────────────┘
                           ▼
              ┌─────────────────────────┐
              │ Digital Signature       │
              └────────────┬────────────┘
                           ▼
              ┌─────────────────────────┐
              │ 3-of-5 Custody          │
              └────────────┬────────────┘
                           ▼
              ┌─────────────────────────┐
              │ Time-Lock Verification  │
              └────────────┬────────────┘
                           ▼
              ┌─────────────────────────┐
              │ Controlled Release      │
              └────────────┬────────────┘
                           ▼
                 Examination Centre
```

### Security Monitoring Layer

Security events are recorded throughout the system:

``` text
Authentication Events
Authorization Events
MFA Failures
Early Release Attempts
Approval Events
Integrity Violations
Signature Failures
Release Events
        ↓
   Audit Logs
```

------------------------------------------------------------------------

## 8. Technologies and Tools Used

### Frontend

  Technology       Purpose
  ---------------- -----------------------------------
  **TypeScript**   Type-safe application development
  **React 18**     Frontend UI
  **Next.js 14**   Frontend framework and App Router

### Backend

  Technology       Purpose
  ---------------- -----------------------------------
  **TypeScript**   Backend development
  **Node.js**      Server-side runtime
  **NestJS**       REST API and backend architecture

### Database

  Technology          Purpose
  ------------------- ---------------------------------------
  **PostgreSQL 15**   Relational database
  **Prisma ORM**      Database access and schema management

### Security

  Technology             Purpose
  ---------------------- -----------------------------------
  **JWT**                Authentication and session tokens
  **bcrypt**             Password hashing
  **AES-256-GCM**        Question paper encryption
  **SHA-256**            Integrity hashing
  **RSA Cryptography**   Digital signatures
  **MFA / OTP**          Multi-factor authentication

### Infrastructure and Tools

  Tool                 Purpose
  -------------------- --------------------------------------------
  **Docker**           Containerization
  **Docker Compose**   Running application services
  **Git / GitHub**     Version control and source-code management
  **Prisma Migrate**   Database migrations

------------------------------------------------------------------------

## 9. Project Structure

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

### Module Purpose

  -----------------------------------------------------------------------
  Module                              Purpose
  ----------------------------------- -----------------------------------
  `auth`                              Authentication, JWT, MFA, and
                                      access control

  `users`                             User and role management

  `examinations`                      Examination creation and management

  `question-papers`                   Question paper creation, upload,
                                      and lifecycle management

  `reviews`                           Reviewer assignment and review
                                      operations

  `approvals`                         Authority approval and approval
                                      workflow

  `releases`                          Time-lock and controlled release
                                      operations

  `security`                          Encryption, signatures, integrity,
                                      custody, and security controls

  `audit`                             Security event and audit-log
                                      management

  `prisma`                            Database schema and migrations

  `vault-a/b/c`                       Simulated isolated encrypted
                                      storage locations
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 10. Database Entities

The main database entities are:

-   **Users**
-   **Examinations**
-   **Question Papers**
-   **Question Paper Fragments**
-   **Reviews**
-   **Approvals**
-   **Examination Centres**
-   **Centre Assignments**
-   **Release Records**
-   **Audit Logs**

These entities support the question paper lifecycle, authorization
workflow, centre assignment, release tracking, and security monitoring.

------------------------------------------------------------------------

## 11. Installation and Setup

### Prerequisites

Install the following before running the project:

-   Node.js
-   Docker
-   Docker Compose
-   Git
-   npm

### Step 1: Clone the Repository

``` bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd secure-question-paper-system
```

Replace `<YOUR-GITHUB-REPOSITORY-URL>` with the URL of this GitHub
repository.

### Step 2: Configure Environment Variables

Create the environment file from the example:

``` bash
cp .env.example .env
```

Configure the required variables:

``` env
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

Do not commit real secrets, private keys, or production credentials to
GitHub.

### Step 3: Start the Application

Build and start the Docker services:

``` bash
docker compose up --build
```

### Step 4: Run Database Migrations

Run the Prisma migration command:

``` bash
npx prisma migrate dev
```

### Step 5: Seed the Database (Optional)

If seed data is configured:

``` bash
npx prisma db seed
```

### Step 6: Access the Application

Open the frontend using the local URL provided by the application after
startup.

For the deployed prototype, the live demo is:

**https://cloud-project-woad-eight.vercel.app/**

------------------------------------------------------------------------

## 12. Sample Input and Output

### Sample Input: Valid Question Paper Submission

Example input:

``` text
Examination:
Government Competitive Examination 2026

Paper:
General Studies

Role:
Question Setter

Exam Centre:
Centre 101

Release Time:
10:00 AM

Question Paper:
Encrypted question paper file
```

### Processing

The system processes the paper through:

``` text
Question Paper Submitted
        ↓
MFA Verification
        ↓
Role Authorization
        ↓
AES-256-GCM Encryption
        ↓
Fragmented Storage
        ↓
Reviewer Approval
        ↓
Authority Approval
        ↓
SHA-256 Hash Generation
        ↓
Digital Signature
        ↓
Digital Seal
        ↓
3-of-5 Custody Verification
        ↓
Time-Lock Verification
        ↓
Integrity Verification
        ↓
Controlled Release
```

### Sample Output: Successful Release

``` text
Release Status: AUTHORIZED

Authentication: PASSED
MFA: PASSED
Role Authorization: PASSED
Centre Authorization: PASSED
Approval Status: PASSED
Digital Seal: VALID
Time Lock: PASSED
Fragment Integrity: VALID
SHA-256 Verification: PASSED
Digital Signature: VALID
3-of-5 Custody: VERIFIED

Result:
Question Paper Released Successfully
```

### Sample Security Failure: Early Release

#### Input

An authorized examination centre attempts to access the question paper
before the configured release time.

``` text
Configured Release Time: 10:00 AM
Current Server Time: 09:30 AM
```

#### Output

``` text
Release Status: BLOCKED

Reason:
Time-Lock Active

Security Event:
Early Release Attempt

Audit Log:
Event Recorded

Result:
Question Paper Not Released
```

### Sample Security Failure: Storage Tampering

#### Input

A stored question paper fragment is modified.

#### Output

``` text
Fragment Integrity: FAILED
Checksum: MISMATCH
Integrity Status: INVALID

Release Status: BLOCKED

Security Event:
Integrity Violation

Result:
Release Aborted
```

### Sample Security Failure: Invalid Digital Signature

``` text
Digital Signature: INVALID
Paper Integrity: FAILED

Release Status: BLOCKED

Result:
Question Paper Not Released
```

------------------------------------------------------------------------

## 13. Security Demonstration Scenarios

### Scenario 1: Unauthorized Role Access

``` text
Unauthorized User
       ↓
Protected API Request
       ↓
RBAC Check
       ↓
403 Forbidden
       ↓
Audit Event Recorded
```

### Scenario 2: Early Release Attempt

``` text
Release Request
       ↓
Time-Lock Check
       ↓
Release Time Not Reached
       ↓
Release Blocked
       ↓
Security Event Recorded
```

### Scenario 3: Storage Tampering

``` text
Stored Fragment
       ↓
Integrity Verification
       ↓
Checksum Mismatch
       ↓
Integrity Violation
       ↓
Release Aborted
```

### Scenario 4: Signature Failure

``` text
Question Paper
       ↓
Digital Signature Verification
       ↓
Invalid Signature
       ↓
Release Blocked
```

### Scenario 5: Valid Release

``` text
Authentication              ✓
MFA                         ✓
Role Authorization          ✓
Centre Assignment           ✓
Approval                    ✓
Digital Seal                ✓
3-of-5 Custody              ✓
Time Lock                   ✓
Integrity Verification      ✓
Digital Signature           ✓
                            ↓
                    Release Authorized
                            ↓
                  Paper Delivered to Centre
```

------------------------------------------------------------------------

## 14. Design Principles

The system follows these security principles:

### Least Privilege

Users receive only the permissions necessary for their assigned
responsibilities.

### Separation of Duties

Question creation, review, authority approval, and release are separated
to reduce the risk of a single compromised account controlling the
entire process.

### Zero Trust

Every sensitive request is authenticated and authorized instead of being
automatically trusted.

### Defense in Depth

Multiple security controls protect the question paper:

``` text
Authentication
      +
MFA
      +
RBAC
      +
Encryption
      +
Fragmentation
      +
Approval
      +
Digital Signature
      +
Integrity Verification
      +
Threshold Custody
      +
Time Lock
      +
Audit Logging
```

### Fail Secure

If a critical verification fails, the system blocks the release instead
of allowing access.

### Integrity Before Availability

The system prioritizes verifying that the question paper has not been
modified before allowing release.

------------------------------------------------------------------------

## 15. End-to-End Demo Flow

A typical secure workflow is:

``` text
1. Question Setter logs in
2. MFA is verified
3. Question paper is created/uploaded
4. Paper is encrypted using AES-256-GCM
5. Encrypted paper is fragmented
6. Fragments are stored in separate vaults
7. Reviewer reviews the paper
8. Reviewer approves the paper
9. Examination Authority performs final approval
10. SHA-256 fingerprint is generated
11. Authority digitally signs the paper
12. Digital seal is applied
13. Paper enters the time-lock stage
14. Release request is submitted
15. Authentication is verified
16. MFA is verified
17. Role authorization is checked
18. Centre assignment is checked
19. Approval and seal status are checked
20. 3-of-5 custody is verified
21. Release time is verified using server time
22. Storage fragment integrity is verified
23. SHA-256 and digital signature are verified
24. Controlled decryption/reconstruction is performed
25. Paper is released to the authorized examination centre
26. Release activity is recorded in the audit log
```

------------------------------------------------------------------------

## 16. Demo Roles

The prototype can be demonstrated using the following role categories:

-   **Admin / Examination Authority**
-   **Question Setter**
-   **Reviewer**
-   **Examination Centre**

These identities and roles are intended for prototype demonstration and
should be replaced with properly managed identities in a real
deployment.

------------------------------------------------------------------------

## 17. Production Considerations

This repository is a **security-focused prototype / academic
demonstration** and should not be considered production-ready government
infrastructure.

A production deployment would additionally require controls such as:

-   Hardware Security Modules (HSM)
-   Cloud Key Management Service (KMS)
-   Properly isolated cloud storage accounts
-   Hardware-backed identity
-   Network segmentation
-   SIEM integration
-   SOC monitoring
-   Penetration testing
-   Independent security audits
-   Disaster recovery
-   High availability
-   Key rotation and lifecycle management
-   Formal threat modelling
-   Security incident response procedures
-   Compliance and regulatory controls
-   Secure deployment and infrastructure hardening

The Docker-based storage vaults in this prototype simulate isolated
storage locations and are not a replacement for production-grade cloud
isolation.

------------------------------------------------------------------------

## 18. Project Objective

The main objective of the project is to combine:

``` text
Authentication
      +
Authorization
      +
Encryption
      +
Fragmentation
      +
Multi-Party Custody
      +
Digital Signature
      +
Integrity Verification
      +
Time-Lock
      +
Security Monitoring
```

to create a controlled question paper management system in which no
single user, compromised account, storage fragment, or security failure
should be sufficient to obtain or release the complete question paper
before the authorized examination time.

------------------------------------------------------------------------

## 19. Live Prototype

The deployed prototype can be accessed at:

**https://cloud-project-woad-eight.vercel.app/**

The live deployment demonstrates the application's security-focused
workflow and user interface.

------------------------------------------------------------------------

## 20. License

This project is intended for academic, educational, and prototype
demonstration purposes.
