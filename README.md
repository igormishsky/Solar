# O.R.I SOLAR - Solar Installation Management System

## Overview

A comprehensive management system for O.R.I SOLAR, specializing in solar panel installations, performance monitoring, and maintenance services for private, business, and institutional clients.

**Developed by:** ASAF SHAMLI CONSULTING LTD

---

## Table of Contents

1. [Background](#background)
2. [System Goals](#system-goals)
3. [System Architecture](#system-architecture)
4. [Core Modules](#core-modules)
5. [Data Models](#data-models)
6. [Installation Process Workflow](#installation-process-workflow)
7. [Forms Management](#forms-management)
8. [Technical Requirements](#technical-requirements)
9. [Security & Permissions](#security--permissions)
10. [Future Roadmap](#future-roadmap)
11. [Getting Started](#getting-started)

---

## Background

O.R.I SOLAR operates in the renewable energy sector, specializing in solar system installations for diverse client segments. The company provides:

- **Installation Services** - Professional solar panel installations
- **Performance Monitoring** - Continuous system performance tracking
- **Maintenance Services** - Routine maintenance, repairs, and upgrades
- **Professional Teams** - Electricians, constructors, installers, and service personnel

This system aims to centralize operations, improve efficiency, and enhance customer service through comprehensive documentation and workflow management.

---

## System Goals

| Goal | Description |
|------|-------------|
| **Centralized Data** | Single secure repository for all customer and project data |
| **Process Management** | Streamlined installation, maintenance, and monitoring workflows |
| **Team Coordination** | Efficient assignment and tracking of field professionals |
| **Project Tracking** | Real-time visibility into project status and milestones |
| **Reporting** | Comprehensive reports for performance, maintenance, and billing |
| **Customer Service** | Complete treatment history and documentation |

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
├──────────────────────────┬──────────────────────────────────────────┤
│     Web Application      │         Mobile Application               │
│    (React/TypeScript)    │        (React Native/PWA)                │
└──────────────────────────┴──────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                    │
│                    (Node.js/Express/REST)                           │
├─────────────────────────────────────────────────────────────────────┤
│  Authentication  │  Authorization  │  Rate Limiting  │  Validation  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                                  │
├───────────┬───────────┬───────────┬───────────┬─────────────────────┤
│    CRM    │  Project  │   Task    │ Monitoring│    Document         │
│  Service  │  Service  │  Service  │  Service  │    Service          │
└───────────┴───────────┴───────────┴───────────┴─────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                    │
├──────────────────────────┬──────────────────────────────────────────┤
│    PostgreSQL Database   │         File Storage (S3/Local)          │
└──────────────────────────┴──────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                             │
├───────────────────┬─────────────────────┬───────────────────────────┤
│  Monitoring APIs  │  IEC (חברת החשמל)   │    Payment Gateway        │
│  (SolarEdge, etc) │   Integration       │                           │
└───────────────────┴─────────────────────┴───────────────────────────┘
```

### Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | React + TypeScript | Type safety, component reusability, large ecosystem |
| **Mobile** | React Native / PWA | Code sharing with web, offline capabilities |
| **Backend** | Node.js + Express | JavaScript ecosystem consistency, async performance |
| **Database** | PostgreSQL | Relational integrity, JSON support, reliability |
| **ORM** | Prisma | Type-safe queries, migrations, excellent DX |
| **Authentication** | JWT + Refresh Tokens | Stateless, secure, scalable |
| **File Storage** | S3-compatible | Scalable document storage |
| **Queue** | Bull/Redis | Background jobs, notifications |
| **i18n** | i18next | Hebrew/English support |

---

## Core Modules

### 3.1 Customer Management (CRM)

The CRM module serves as the central hub for all customer-related data and interactions.

#### Features
- **Customer Profiles** - Complete customer information with contact details
- **Installation History** - Full record of all installations per customer
- **Maintenance History** - Service requests, issues, and resolutions
- **Customer Segmentation** - Classification by type (Private/Business/Institutional)
- **Manager Dashboard** - Real-time overview of:
  - Active installations
  - Monitored systems
  - Customer status
  - Key performance indicators

#### Customer Data Structure
```
Customer
├── Personal Information
│   ├── First Name, Last Name
│   ├── ID Number (ת.ז)
│   ├── Email
│   ├── Primary Phone
│   ├── Secondary Phone
│   └── Billing Method (מסלול התחשבנות)
├── Residential Address
│   ├── City (יישוב)
│   ├── Street (רחוב)
│   ├── Number
│   ├── Apartment
│   └── Postal Code
├── Property Address (Installation Site)
│   ├── City, Street, Number, Apartment, Postal Code
│   ├── Block (גוש)
│   ├── Parcel (חלקה)
│   ├── Sub-parcel (תת חלקה)
│   └── Lot (מגרש)
└── IEC Information (מזהה חח"י)
    ├── Contract Number (מספר חוזה)
    ├── Order Number (מספר הזמנה)
    ├── Meter Number (מספר מונה)
    └── Network Division (אגף רשת)
```

---

### 3.2 Project Management

Manages the full lifecycle of solar installation projects.

#### Features
- **Project Creation** - Initialize new installation projects
- **Professional Assignment** - Assign electricians, constructors, planners
- **Status Tracking** - Monitor project progress through stages
- **Stage Documentation** - Record completion of each installation phase
- **Timeline Management** - Track milestones and deadlines

#### Project Stages
1. Initial Request & Assessment
2. Site Survey
3. System Design
4. Permits & Approvals
5. Equipment Procurement
6. Physical Installation
7. Electrical Connection
8. Testing & Commissioning
9. IEC Synchronization
10. Commercial Activation

---

### 3.3 Installation Process Tracking

Tracks the specific workflow for IEC (Israel Electric Corporation) approval and grid connection.

#### Process Steps

```
┌─────────────────┐
│ 1. Request      │ ──► Initial installation request opened
│    Opening      │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 2. Payment      │ ──► Customer payment processed
└────────┬────────┘
         ▼
┌─────────────────┐
│ 3. Department   │ ──► IEC department response received
│    Response     │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 4. Sync         │ ──► Submit compliance verification request
│    Compliance   │
│    Request      │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 5. Sync         │ ──► Submit synchronization request
│    Request      │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 6. Sync         │ ──► Grid synchronization completed
│    Complete     │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 7. Commercial   │ ──► System commercially activated
│    Activation   │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 8. Standing     │ ──► Standing order form completed
│    Order Form   │
└─────────────────┘
```

---

### 3.4 Task Management & Team Coordination

Enables efficient task assignment and field coordination.

#### Features
- **Task Creation** - Create tasks with descriptions, deadlines, priorities
- **Assignment** - Assign tasks to specific professionals
- **Status Updates** - Track task progress (Pending → In Progress → Completed)
- **Mobile Interface** - Field workers update status from mobile devices
- **Notifications** - Alerts for new assignments, deadlines, status changes

#### Task Properties
- Title & Description
- Priority (Low / Medium / High / Urgent)
- Due Date
- Assigned Professional(s)
- Related Project/Customer
- Status
- Comments/Updates
- Attached Files

---

### 3.5 Performance Monitoring

Integration with solar monitoring systems for real-time performance tracking.

#### Features
- **System Integration** - Connect to monitoring platforms (SolarEdge, Enphase, etc.)
- **Performance Graphs** - Visual display of energy production data
- **Output Data** - Daily, weekly, monthly production statistics
- **Alerts** - Automated notifications for:
  - Production anomalies
  - System errors
  - Maintenance requirements
- **Maintenance Logging** - Document all maintenance activities

#### Monitored Metrics
- Energy Production (kWh)
- System Efficiency (%)
- Inverter Status
- Panel Performance
- Grid Export Data
- Historical Comparisons

---

### 3.6 Reports & Documents

Comprehensive reporting and document management capabilities.

#### Report Types
- **Performance Reports** - System output and efficiency metrics
- **Maintenance Reports** - Service history and upcoming maintenance
- **Financial Reports** - Revenue, billing, payment status
- **Project Status Reports** - Progress across all active projects
- **Compliance Reports** - License validity, certification status

#### Document Features
- **Invoice Generation** - Create and send invoices
- **Quote Generation** - Prepare price quotations
- **Data Export** - Export to Excel, PDF, CSV
- **Document Storage** - Attach and organize files per customer/project
- **Version Control** - Track document revisions

---

## Data Models

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Customer   │───┬───│   Project    │───────│    Task      │
└──────────────┘   │   └──────────────┘       └──────────────┘
                   │          │                      │
                   │          │                      │
                   │          ▼                      ▼
                   │   ┌──────────────┐       ┌──────────────┐
                   │   │Installation  │       │ Professional │
                   │   │   Stage      │       └──────────────┘
                   │   └──────────────┘              │
                   │          │                      │
                   ▼          ▼                      ▼
            ┌──────────────┐                  ┌──────────────┐
            │   Document   │                  │   License    │
            └──────────────┘                  └──────────────┘
                   │
                   ▼
            ┌──────────────┐
            │     Form     │
            └──────────────┘
```

### Professional Types

The system tracks various professional roles involved in installations:

| Professional Type | Hebrew | Key Information |
|-------------------|--------|-----------------|
| **Installing Company** | החברה המקימה | Company Name, Company ID (ח.פ), Authorized Signatory, Phone, Email |
| **Installing Contractor** | הקבלן המתקין | Name, Electrician Status, ID, Phone, Email, License Type & Number |
| **Planner** | המתכנן | Name, ID, Phone, Email, License Type & Number |
| **Inspecting Electrician** | חשמלאי בודק | Name, ID, Phone, Email, License Type & Number |
| **Constructor** | קונסטרוקטור | Name, ID, Phone, Email, License Type & Number |

#### License Tracking
- Store license document images
- Track license expiration dates
- Automated alerts for expiring licenses
- Validation of license validity for assignments

---

## Forms Management

### 7.1 Automatic Form Generation

The system provides intelligent form management:

- **Template Integration** - Merge customer/project data into form templates
- **Version Control** - Maintain form revision history
- **Customer Association** - Link forms to specific customers/projects
- **Status Tracking** - Monitor form completion and submission status

### 7.2 Required Forms Checklist

| # | Form Name (Hebrew) | Form Name (English) | Required Signature |
|---|---------------------|---------------------|-------------------|
| 1 | תוכנית פריסה + הארקה | Layout Plan + Grounding | Electrical Engineer |
| 2 | הסכם PV | PV Agreement | Customer |
| 3 | הצהרת חשמלאי מבצע – תוספת ראשונה | Executing Electrician Declaration - First Addition | Executing Electrician |
| 4 | טופס הגשת מתקן לבדיקה | Installation Submission for Inspection | - |
| 5 | תצהיר כיול מהפכים | Inverter Calibration Affidavit | Importer/Manufacturer |
| 6 | אישור קונסטרוקטור | Constructor Approval | Constructor |
| 7 | תצהיר התקנה לפי תקנה 24 | Installation Declaration per Regulation 24 | Inspecting Electrician |
| 8 | טופס בדיקת מתקן פוטו-וולטאי – תוספת שנייה | PV Installation Inspection Form - Second Addition | - |
| 9 | טופס 1400 | Form 1400 | Installation Owner |
| 10 | דיווח על עבודה פטורה מהיתר | Permit-Exempt Work Report | - |
| 11 | טופס מרכז לעמידה בתנאי סף | Central Form for Threshold Compliance | Supplier, Owner, Installing Company |

### Form Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Draft     │ ──► │   Review    │ ──► │  Signature  │ ──► │  Submitted  │
│             │     │             │     │   Pending   │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                                            ┌─────────────┐
                                                            │  Approved / │
                                                            │  Rejected   │
                                                            └─────────────┘
```

---

## Technical Requirements

### Platform Requirements

| Requirement | Specification |
|-------------|---------------|
| **Web Application** | Responsive design, modern browsers support |
| **Mobile Interface** | Native feel, offline capability, field updates |
| **Language Support** | Hebrew (RTL) and English (LTR) |
| **Browser Support** | Chrome, Firefox, Safari, Edge (latest 2 versions) |

### Performance Requirements

| Metric | Target |
|--------|--------|
| Page Load Time | < 3 seconds |
| API Response Time | < 500ms (95th percentile) |
| Concurrent Users | 100+ simultaneous users |
| Uptime | 99.5% availability |

### Integration Requirements

- **Monitoring Systems** - SolarEdge, Enphase, Fronius APIs
- **Israel Electric Corporation (IEC)** - Form submission, status tracking
- **Payment Gateway** - Credit card processing, standing orders
- **Email/SMS** - Notifications and alerts
- **Cloud Storage** - Document and image storage

---

## Security & Permissions

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **Administrator** | Full system access, user management, settings |
| **Manager** | Dashboard access, reports, project management, customer management |
| **Office Staff** | Customer management, project updates, document handling |
| **Field Technician** | View assigned tasks, update status, upload photos |
| **Viewer** | Read-only access to assigned projects |

### Security Measures

- **Authentication** - JWT-based with refresh tokens
- **Password Policy** - Minimum strength requirements, expiration
- **Data Encryption** - At rest and in transit (TLS 1.3)
- **Audit Logging** - Track all data modifications
- **Session Management** - Automatic timeout, concurrent session limits
- **Input Validation** - Sanitization of all user inputs
- **GDPR Compliance** - Data privacy, right to deletion

---

## Future Roadmap (Phase 2)

The following features are planned for future development:

### Appointment Scheduling
- Customer self-service booking
- Technician calendar management
- Automated scheduling optimization
- SMS/Email reminders

### ERP/BI Integration
- Financial system integration
- Advanced business intelligence
- Custom reporting dashboards
- Data warehousing

### Advanced Analytics
- Predictive maintenance algorithms
- Performance optimization recommendations
- Trend analysis and forecasting
- Machine learning for anomaly detection

### Customer Portal
- Self-service dashboard
- Real-time system monitoring
- Invoice and payment management
- Support ticket submission

---

## Project Structure

```
Solar/
├── README.md                 # This file
├── docs/                     # Additional documentation
│   ├── api/                  # API documentation
│   ├── database/             # Database schemas and migrations
│   └── workflows/            # Process flow diagrams
├── packages/
│   ├── web/                  # React web application
│   │   ├── src/
│   │   │   ├── components/   # Reusable UI components
│   │   │   ├── pages/        # Page components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── services/     # API service layer
│   │   │   ├── store/        # State management
│   │   │   ├── i18n/         # Internationalization
│   │   │   └── utils/        # Utility functions
│   │   └── package.json
│   ├── mobile/               # React Native mobile app
│   │   └── ...
│   ├── api/                  # Node.js backend
│   │   ├── src/
│   │   │   ├── controllers/  # Request handlers
│   │   │   ├── services/     # Business logic
│   │   │   ├── models/       # Database models
│   │   │   ├── middleware/   # Express middleware
│   │   │   ├── routes/       # API routes
│   │   │   ├── utils/        # Utility functions
│   │   │   └── jobs/         # Background jobs
│   │   └── package.json
│   └── shared/               # Shared types and utilities
│       └── ...
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── docker/                   # Docker configurations
├── scripts/                  # Build and deployment scripts
└── package.json              # Root package.json (monorepo)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Solar

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ori_solar

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# External APIs
SOLAREDGE_API_KEY=your-api-key
IEC_API_ENDPOINT=https://api.iec.co.il

# Storage
S3_BUCKET=ori-solar-documents
S3_REGION=il-central-1

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

---

## Contact

**ASAF SHAMLI CONSULTING LTD**
Klil HaHoresh 9, Yoqneam Illit
Email: ASC-GROUP@OUTLOOK.CO.IL
Phone: +972-50-621-2859

---

## License

Proprietary - All rights reserved.

---

*Document Version: 1.0*
*Last Updated: January 2026*
