# Database Schema Design

## Overview

This document outlines the database schema for the O.R.I SOLAR management system. The database is designed using PostgreSQL with Prisma ORM.

---

## Entity Relationship Diagram

```
                                    ┌─────────────────┐
                                    │      User       │
                                    │─────────────────│
                                    │ id              │
                                    │ email           │
                                    │ password        │
                                    │ role            │
                                    │ ...             │
                                    └────────┬────────┘
                                             │
                         ┌───────────────────┼───────────────────┐
                         │                   │                   │
                         ▼                   ▼                   ▼
              ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
              │    Customer     │  │   Professional  │  │   AuditLog      │
              │─────────────────│  │─────────────────│  │─────────────────│
              │ id              │  │ id              │  │ id              │
              │ firstName       │  │ type            │  │ action          │
              │ lastName        │  │ name            │  │ userId          │
              │ idNumber        │  │ licenseNumber   │  │ entityType      │
              │ ...             │  │ ...             │  │ ...             │
              └────────┬────────┘  └────────┬────────┘  └─────────────────┘
                       │                    │
         ┌─────────────┴─────────────┐      │
         │                           │      │
         ▼                           ▼      │
┌─────────────────┐       ┌─────────────────┤
│    Address      │       │    Project      │◄───────────────────┐
│─────────────────│       │─────────────────│                    │
│ id              │       │ id              │                    │
│ type            │       │ customerId      │                    │
│ city            │       │ status          │                    │
│ street          │       │ ...             │                    │
│ ...             │       └────────┬────────┘                    │
└─────────────────┘                │                             │
                    ┌──────────────┼──────────────┐              │
                    │              │              │              │
                    ▼              ▼              ▼              │
         ┌─────────────────┐ ┌───────────────┐ ┌─────────────────┤
         │      Task       │ │ Installation  │ │    Document     │
         │─────────────────│ │    Stage      │ │─────────────────│
         │ id              │ │───────────────│ │ id              │
         │ projectId       │ │ id            │ │ projectId       │
         │ assigneeId      │ │ projectId     │ │ customerId      │
         │ status          │ │ stageType     │ │ type            │
         │ ...             │ │ status        │ │ filePath        │
         └─────────────────┘ │ ...           │ │ ...             │
                             └───────────────┘ └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │      Form       │
                                              │─────────────────│
                                              │ id              │
                                              │ documentId      │
                                              │ formType        │
                                              │ status          │
                                              │ ...             │
                                              └─────────────────┘
```

---

## Tables

### Users & Authentication

#### `User`
System users with role-based access.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| passwordHash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| firstName | VARCHAR(100) | NOT NULL | First name |
| lastName | VARCHAR(100) | NOT NULL | Last name |
| phone | VARCHAR(20) | | Phone number |
| role | ENUM | NOT NULL | User role (ADMIN, MANAGER, STAFF, TECHNICIAN, VIEWER) |
| isActive | BOOLEAN | DEFAULT true | Account active status |
| lastLoginAt | TIMESTAMP | | Last login timestamp |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updatedAt | TIMESTAMP | | Last update timestamp |

#### `RefreshToken`
JWT refresh tokens for authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK → User | Associated user |
| token | VARCHAR(500) | UNIQUE | Refresh token |
| expiresAt | TIMESTAMP | NOT NULL | Expiration time |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |

---

### Customer Management

#### `Customer`
Core customer information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| firstName | VARCHAR(100) | NOT NULL | שם פרטי |
| lastName | VARCHAR(100) | NOT NULL | שם משפחה |
| idNumber | VARCHAR(20) | UNIQUE | ת.ז |
| email | VARCHAR(255) | | דוא"ל |
| phonePrimary | VARCHAR(20) | NOT NULL | טלפון ראשי |
| phoneSecondary | VARCHAR(20) | | טלפון משני |
| customerType | ENUM | NOT NULL | PRIVATE, BUSINESS, INSTITUTIONAL |
| billingMethod | VARCHAR(50) | | מסלול התחשבנות |
| contractNumber | VARCHAR(50) | | מספר חוזה (חח"י) |
| orderNumber | VARCHAR(50) | | מספר הזמנה (חח"י) |
| meterNumber | VARCHAR(50) | | מספר מונה |
| networkDivision | VARCHAR(50) | | אגף רשת |
| status | ENUM | DEFAULT 'ACTIVE' | ACTIVE, INACTIVE, SUSPENDED |
| notes | TEXT | | Internal notes |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updatedAt | TIMESTAMP | | Last update timestamp |

#### `Address`
Customer addresses (residential and property).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| customerId | UUID | FK → Customer | Associated customer |
| addressType | ENUM | NOT NULL | RESIDENTIAL, PROPERTY |
| city | VARCHAR(100) | NOT NULL | יישוב |
| street | VARCHAR(100) | NOT NULL | רחוב |
| number | VARCHAR(20) | NOT NULL | מספר |
| apartment | VARCHAR(20) | | דירה |
| postalCode | VARCHAR(10) | | מיקוד |
| block | VARCHAR(20) | | גוש |
| parcel | VARCHAR(20) | | חלקה |
| subParcel | VARCHAR(20) | | תת חלקה |
| lot | VARCHAR(20) | | מגרש |
| latitude | DECIMAL(10,8) | | GPS latitude |
| longitude | DECIMAL(11,8) | | GPS longitude |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updatedAt | TIMESTAMP | | Last update timestamp |

---

### Professional Management

#### `Professional`
Professionals involved in installations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| type | ENUM | NOT NULL | COMPANY, CONTRACTOR, PLANNER, ELECTRICIAN, CONSTRUCTOR |
| name | VARCHAR(200) | NOT NULL | Full name or company name |
| companyId | VARCHAR(20) | | ח.פ (for companies) |
| idNumber | VARCHAR(20) | | ת.ז (for individuals) |
| authorizedSignatory | VARCHAR(200) | | מורשה חתימה |
| phone | VARCHAR(20) | NOT NULL | Phone number |
| email | VARCHAR(255) | | Email address |
| licenseType | VARCHAR(100) | | סוג רישיון |
| licenseNumber | VARCHAR(50) | | מספר רישיון |
| licenseExpiry | DATE | | License expiration date |
| licenseDocumentId | UUID | FK → Document | License document |
| isActive | BOOLEAN | DEFAULT true | Active status |
| notes | TEXT | | Internal notes |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updatedAt | TIMESTAMP | | Last update timestamp |

#### `ProfessionalLicense`
Track multiple licenses per professional.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| professionalId | UUID | FK → Professional | Associated professional |
| licenseType | VARCHAR(100) | NOT NULL | Type of license |
| licenseNumber | VARCHAR(50) | NOT NULL | License number |
| issuedAt | DATE | | Issue date |
| expiresAt | DATE | | Expiration date |
| documentId | UUID | FK → Document | License scan |
| status | ENUM | DEFAULT 'VALID' | VALID, EXPIRED, SUSPENDED |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |

---

### Project Management

#### `Project`
Installation projects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| projectNumber | VARCHAR(50) | UNIQUE | Human-readable project number |
| customerId | UUID | FK → Customer, NOT NULL | Project customer |
| addressId | UUID | FK → Address | Installation address |
| status | ENUM | NOT NULL | Project status (see below) |
| systemSize | DECIMAL(10,2) | | System size in kWp |
| panelCount | INTEGER | | Number of panels |
| inverterModel | VARCHAR(100) | | Inverter model |
| estimatedProduction | DECIMAL(10,2) | | Est. annual production (kWh) |
| startDate | DATE | | Project start date |
| completionDate | DATE | | Project completion date |
| commercialActivationDate | DATE | | Commercial activation date |
| createdById | UUID | FK → User | Created by user |
| notes | TEXT | | Project notes |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updatedAt | TIMESTAMP | | Last update timestamp |

**Project Status Values:**
- `DRAFT` - Initial draft
- `PENDING_APPROVAL` - Awaiting approval
- `APPROVED` - Approved, ready to start
- `IN_PROGRESS` - Work in progress
- `INSTALLATION_COMPLETE` - Physical installation done
- `PENDING_SYNC` - Awaiting IEC synchronization
- `SYNCED` - Grid synchronized
- `COMMERCIALLY_ACTIVE` - Commercially operational
- `ON_HOLD` - Temporarily paused
- `CANCELLED` - Project cancelled
- `COMPLETED` - Project fully completed

#### `ProjectProfessional`
Many-to-many relationship between projects and professionals.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| projectId | UUID | FK → Project | Project reference |
| professionalId | UUID | FK → Professional | Professional reference |
| role | VARCHAR(100) | NOT NULL | Role in project |
| assignedAt | TIMESTAMP | DEFAULT now() | Assignment timestamp |
| assignedById | UUID | FK → User | Assigned by user |

---

### Installation Process Tracking

#### `InstallationStage`
Track progress through IEC process stages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| projectId | UUID | FK → Project | Associated project |
| stageType | ENUM | NOT NULL | Stage type (see below) |
| status | ENUM | DEFAULT 'PENDING' | PENDING, IN_PROGRESS, COMPLETED, BLOCKED |
| startedAt | TIMESTAMP | | Stage start time |
| completedAt | TIMESTAMP | | Stage completion time |
| completedById | UUID | FK → User | Completed by user |
| notes | TEXT | | Stage notes |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updatedAt | TIMESTAMP | | Last update timestamp |

**Stage Types:**
- `REQUEST_OPENING` - פתיחת בקשה
- `PAYMENT` - תשלום
- `DEPARTMENT_RESPONSE` - תשובת מחלק
- `SYNC_COMPLIANCE_REQUEST` - הגשת בקשה לבדיקת עמידה בתנאי סינכרון
- `SYNC_REQUEST` - הגשת בקשה לסינכרון
- `SYNCHRONIZATION` - סינכרון
- `COMMERCIAL_ACTIVATION` - הפעלה מסחרית
- `STANDING_ORDER_FORM` - טופס הוראת קבע

---

### Task Management

#### `Task`
Tasks for team coordination.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| projectId | UUID | FK → Project | Related project |
| customerId | UUID | FK → Customer | Related customer |
| title | VARCHAR(200) | NOT NULL | Task title |
| description | TEXT | | Task description |
| priority | ENUM | DEFAULT 'MEDIUM' | LOW, MEDIUM, HIGH, URGENT |
| status | ENUM | DEFAULT 'PENDING' | PENDING, IN_PROGRESS, COMPLETED, CANCELLED |
| dueDate | DATE | | Due date |
| assigneeId | UUID | FK → User | Assigned user |
| createdById | UUID | FK → User | Created by user |
| completedAt | TIMESTAMP | | Completion timestamp |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updatedAt | TIMESTAMP | | Last update timestamp |

#### `TaskComment`
Comments on tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| taskId | UUID | FK → Task | Associated task |
| userId | UUID | FK → User | Comment author |
| content | TEXT | NOT NULL | Comment content |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |

---

### Document Management

#### `Document`
Stored documents and files.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| projectId | UUID | FK → Project | Related project |
| customerId | UUID | FK → Customer | Related customer |
| documentType | ENUM | NOT NULL | Document type (see below) |
| title | VARCHAR(200) | NOT NULL | Document title |
| fileName | VARCHAR(255) | NOT NULL | Original file name |
| filePath | VARCHAR(500) | NOT NULL | Storage path |
| mimeType | VARCHAR(100) | | MIME type |
| fileSize | INTEGER | | File size in bytes |
| version | INTEGER | DEFAULT 1 | Version number |
| uploadedById | UUID | FK → User | Uploaded by user |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |

**Document Types:**
- `LICENSE` - Professional license
- `CONTRACT` - Customer contract
- `INVOICE` - Invoice
- `QUOTE` - Price quotation
- `FORM` - Official form
- `PHOTO` - Site photo
- `REPORT` - Report
- `OTHER` - Other document

#### `Form`
IEC forms and their status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| projectId | UUID | FK → Project | Associated project |
| documentId | UUID | FK → Document | Generated document |
| formType | ENUM | NOT NULL | Form type (see section 7.2) |
| status | ENUM | DEFAULT 'DRAFT' | DRAFT, PENDING_SIGNATURE, SIGNED, SUBMITTED, APPROVED, REJECTED |
| generatedAt | TIMESTAMP | | Generation timestamp |
| signedAt | TIMESTAMP | | Signature timestamp |
| submittedAt | TIMESTAMP | | Submission timestamp |
| signedById | UUID | FK → User | Signed by |
| notes | TEXT | | Form notes |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updatedAt | TIMESTAMP | | Last update timestamp |

**Form Types:**
- `LAYOUT_PLAN` - תוכנית פריסה + הארקה
- `PV_AGREEMENT` - הסכם PV
- `ELECTRICIAN_DECLARATION_1` - הצהרת חשמלאי מבצע – תוספת ראשונה
- `INSTALLATION_INSPECTION_REQUEST` - טופס הגשת מתקן לבדיקה
- `INVERTER_CALIBRATION` - תצהיר כיול מהפכים
- `CONSTRUCTOR_APPROVAL` - אישור קונסטרוקטור
- `REGULATION_24_DECLARATION` - תצהיר התקנה לפי תקנה 24
- `PV_INSPECTION_2` - טופס בדיקת מתקן פוטו-וולטאי – תוספת שנייה
- `FORM_1400` - טופס 1400
- `PERMIT_EXEMPT_REPORT` - דיווח על עבודה פטורה מהיתר
- `THRESHOLD_COMPLIANCE` - טופס מרכז לעמידה בתנאי סף

---

### Performance Monitoring

#### `MonitoringSystem`
External monitoring system connections.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| projectId | UUID | FK → Project | Associated project |
| provider | ENUM | NOT NULL | SOLAREDGE, ENPHASE, FRONIUS, OTHER |
| systemId | VARCHAR(100) | | External system ID |
| apiKey | VARCHAR(255) | | Encrypted API key |
| isActive | BOOLEAN | DEFAULT true | Active status |
| lastSyncAt | TIMESTAMP | | Last data sync |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |

#### `PerformanceData`
Cached performance metrics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| projectId | UUID | FK → Project | Associated project |
| timestamp | TIMESTAMP | NOT NULL | Measurement time |
| energyProduced | DECIMAL(12,2) | | Energy produced (Wh) |
| powerOutput | DECIMAL(10,2) | | Current power (W) |
| efficiency | DECIMAL(5,2) | | System efficiency (%) |
| temperature | DECIMAL(5,2) | | Panel temperature (°C) |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |

**Index:** `(projectId, timestamp)` for time-series queries

#### `Alert`
System alerts and notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| projectId | UUID | FK → Project | Associated project |
| type | ENUM | NOT NULL | PERFORMANCE, MAINTENANCE, LICENSE_EXPIRY, SYSTEM_ERROR |
| severity | ENUM | NOT NULL | INFO, WARNING, CRITICAL |
| title | VARCHAR(200) | NOT NULL | Alert title |
| message | TEXT | NOT NULL | Alert message |
| isRead | BOOLEAN | DEFAULT false | Read status |
| isResolved | BOOLEAN | DEFAULT false | Resolution status |
| resolvedAt | TIMESTAMP | | Resolution timestamp |
| resolvedById | UUID | FK → User | Resolved by user |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |

---

### Service & Maintenance

#### `ServiceRequest`
Customer service requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| projectId | UUID | FK → Project | Related project |
| customerId | UUID | FK → Customer | Requesting customer |
| requestType | ENUM | NOT NULL | MAINTENANCE, REPAIR, INQUIRY, COMPLAINT |
| priority | ENUM | DEFAULT 'MEDIUM' | LOW, MEDIUM, HIGH, URGENT |
| status | ENUM | DEFAULT 'OPEN' | OPEN, IN_PROGRESS, RESOLVED, CLOSED |
| subject | VARCHAR(200) | NOT NULL | Request subject |
| description | TEXT | | Request details |
| resolution | TEXT | | Resolution description |
| assigneeId | UUID | FK → User | Assigned technician |
| resolvedAt | TIMESTAMP | | Resolution timestamp |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updatedAt | TIMESTAMP | | Last update timestamp |

#### `MaintenanceLog`
Maintenance activity records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| projectId | UUID | FK → Project | Associated project |
| serviceRequestId | UUID | FK → ServiceRequest | Related service request |
| maintenanceType | ENUM | NOT NULL | ROUTINE, CORRECTIVE, PREVENTIVE |
| description | TEXT | NOT NULL | Work performed |
| technicianId | UUID | FK → User | Performing technician |
| performedAt | DATE | NOT NULL | Date performed |
| nextScheduledDate | DATE | | Next maintenance date |
| partsUsed | JSONB | | Parts/materials used |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |

---

### Audit & Logging

#### `AuditLog`
System audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK → User | Acting user |
| action | ENUM | NOT NULL | CREATE, UPDATE, DELETE, VIEW |
| entityType | VARCHAR(50) | NOT NULL | Entity type (Customer, Project, etc.) |
| entityId | UUID | NOT NULL | Entity ID |
| oldValue | JSONB | | Previous value (for updates) |
| newValue | JSONB | | New value |
| ipAddress | VARCHAR(45) | | Client IP address |
| userAgent | VARCHAR(500) | | Client user agent |
| createdAt | TIMESTAMP | DEFAULT now() | Action timestamp |

---

## Indexes

### Performance Indexes

```sql
-- Customer lookups
CREATE INDEX idx_customer_id_number ON Customer(idNumber);
CREATE INDEX idx_customer_type ON Customer(customerType);
CREATE INDEX idx_customer_status ON Customer(status);

-- Project queries
CREATE INDEX idx_project_customer ON Project(customerId);
CREATE INDEX idx_project_status ON Project(status);
CREATE INDEX idx_project_dates ON Project(startDate, completionDate);

-- Task management
CREATE INDEX idx_task_assignee ON Task(assigneeId, status);
CREATE INDEX idx_task_due_date ON Task(dueDate) WHERE status != 'COMPLETED';

-- Performance data time-series
CREATE INDEX idx_performance_time ON PerformanceData(projectId, timestamp DESC);

-- Document retrieval
CREATE INDEX idx_document_project ON Document(projectId);
CREATE INDEX idx_document_customer ON Document(customerId);

-- Alert management
CREATE INDEX idx_alert_unread ON Alert(projectId, isRead) WHERE isRead = false;

-- License expiry tracking
CREATE INDEX idx_license_expiry ON ProfessionalLicense(expiresAt) WHERE status = 'VALID';
```

---

## Database Migrations Strategy

1. Use Prisma Migrate for version-controlled migrations
2. Each migration is timestamped and reversible
3. Production migrations require approval workflow
4. Seed data provided for development environments

---

## Backup & Recovery

- Daily automated backups
- Point-in-time recovery enabled
- 30-day backup retention
- Geographic replication for disaster recovery
