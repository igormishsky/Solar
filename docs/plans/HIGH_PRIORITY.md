# High Priority Implementation Items

These items are critical for production readiness and core functionality.

---

## 1. File Upload/Storage System

**Current State:** Document management only stores metadata (file_url, file_type, file_size). No actual file upload functionality exists.

**Priority:** Critical
**Effort:** M-L

### What Needs To Be Done

#### Backend Changes
- [ ] Install `multer` for multipart file handling
- [ ] Install AWS SDK (`@aws-sdk/client-s3`)
- [ ] Create S3 bucket configuration
- [ ] Implement file upload endpoint with:
  - File type validation (pdf, jpg, png, docx)
  - File size limits (configurable, suggest 10MB)
  - Virus scanning (optional, via ClamAV or S3 integration)
- [ ] Implement secure file download endpoint
- [ ] Add file deletion from S3 when document deleted
- [ ] Handle upload progress tracking

#### Frontend Changes
- [ ] Create `FileUpload` component with drag-and-drop
- [ ] Add upload progress indicator
- [ ] Display file previews (images, PDF thumbnails)
- [ ] Add file type/size validation feedback
- [ ] Update document list to show actual files

#### Files To Modify
```
server/src/routes/documents.ts      # Add multipart handling
server/src/lib/s3.ts               # New file - S3 client
server/src/middleware/upload.ts     # New file - Multer config
src/components/FileUpload.tsx       # New component
src/components/DocumentList.tsx     # Update to show files
```

#### Environment Variables Needed
```
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
MAX_FILE_SIZE=10485760  # 10MB
```

---

## 2. Email Notification System

**Current State:** `useNotificationStore` exists but no backend email service. Users receive no email notifications.

**Priority:** Critical
**Effort:** M

### What Needs To Be Done

#### Backend Changes
- [ ] Choose email service (SendGrid recommended for ease)
- [ ] Install SDK (`@sendgrid/mail` or `nodemailer`)
- [ ] Create email service module
- [ ] Create email templates:
  - Welcome email (on registration)
  - Password reset
  - Task assigned notification
  - Project status change
  - License expiry warning
  - Form approval/rejection
- [ ] Create notification queue (optional, for high volume)
- [ ] Add notification preferences to user model

#### Frontend Changes
- [ ] Add notification preferences in settings
- [ ] Add "send notification" option on relevant actions

#### Files To Create/Modify
```
server/src/services/email.ts           # New - Email service
server/src/services/email-templates/   # New - Email templates
server/src/routes/notifications.ts     # New - Notification API
src/components/Settings/NotificationPreferences.tsx  # New
```

#### Email Templates Needed
| Template | Trigger |
|----------|---------|
| welcome | User registration |
| password-reset | Password reset request |
| task-assigned | Task assigned to user |
| project-status | Project status change |
| license-expiry | Professional license expiring |
| form-approved | Form approved |
| form-rejected | Form rejected |

#### Environment Variables Needed
```
SENDGRID_API_KEY=
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Solar CRM
```

---

## 3. Form Data Entry Workflow

**Current State:** Forms can be created with status management (draft/submitted/approved), but there's no UI for actually filling out form data.

**Priority:** Critical
**Effort:** L

### What Needs To Be Done

#### Backend Changes
- [ ] Add `form_data` JSONB column to forms table (or create form_fields table)
- [ ] Create form field schemas for each of the 11 form types
- [ ] Add validation for each form type
- [ ] Implement form versioning (to track changes)
- [ ] Add digital signature storage

#### Frontend Changes
- [ ] Create dynamic form renderer component
- [ ] Build form schemas for each form type:
  - Customer declaration form
  - Request to IEC
  - Sketch form
  - Agreement for IEC
  - Proxy request
  - Single line diagram
  - IEC request number
  - IEC approval number
  - Inverter notification
  - Installation declaration
  - Standing order form
- [ ] Add form preview/print functionality
- [ ] Implement form submission workflow UI
- [ ] Add digital signature capture component

#### Files To Create/Modify
```
server/src/lib/form-schemas/           # New - Form type schemas
server/src/routes/forms.ts             # Add data handling
src/components/Forms/FormRenderer.tsx  # New - Dynamic renderer
src/components/Forms/FormField.tsx     # New - Field components
src/components/Forms/Signature.tsx     # New - Signature capture
src/lib/form-definitions/              # New - Form field definitions
```

#### Form Types Reference (Hebrew Solar Forms)
| Form ID | Hebrew Name | English |
|---------|-------------|---------|
| customer_declaration | טופס הצהרת לקוח | Customer Declaration |
| iec_request | בקשה לחברת חשמל | IEC Request |
| sketch | סקיצה | Installation Sketch |
| iec_agreement | הסכם לחברת חשמל | IEC Agreement |
| proxy | בקשת יפוי כוח | Power of Attorney |
| single_line_diagram | תרשים חד קווי | Single Line Diagram |
| iec_request_number | מספר בקשה מחח"י | IEC Request Number |
| iec_approval_number | מספר אישור מחח"י | IEC Approval Number |
| inverter_notification | הודעת ממיר | Inverter Notification |
| installation_declaration | הצהרת מתקין | Installer Declaration |
| standing_order | הוראת קבע | Standing Order Form |

---

## 4. Audit Logging System

**Current State:** No audit trail exists. User actions are not logged for compliance or debugging.

**Priority:** High
**Effort:** M

### What Needs To Be Done

#### Database Changes
- [ ] Create `audit_logs` table:
  ```sql
  CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

#### Backend Changes
- [ ] Create audit logging middleware
- [ ] Add audit logging to all mutation endpoints:
  - CREATE operations
  - UPDATE operations
  - DELETE operations
  - Status changes
- [ ] Create audit log query endpoint
- [ ] Add audit log retention policy (optional)

#### Frontend Changes
- [ ] Create audit log viewer (admin only)
- [ ] Add "View History" button on entities
- [ ] Show change diffs in readable format

#### Files To Create/Modify
```
server/src/middleware/audit.ts         # New - Audit middleware
server/src/routes/audit.ts             # New - Audit API
server/src/lib/audit-logger.ts         # New - Logging utility
src/components/Admin/AuditLog.tsx      # New - Log viewer
src/components/EntityHistory.tsx       # New - Entity history
```

#### Actions To Log
| Action | Entity Types |
|--------|--------------|
| CREATE | customer, project, task, professional, form, document |
| UPDATE | customer, project, task, professional, form |
| DELETE | customer, project, task, professional, form, document |
| STATUS_CHANGE | project, task, form |
| LOGIN | user |
| LOGOUT | user |
| PERMISSION_CHANGE | user |

---

## 5. Real Monitoring Data Integration

**Current State:** Monitoring UI is complete but all data is simulated. See `/src/hooks/useMonitoring.ts` lines 61-62.

**Priority:** High
**Effort:** L-XL

### What Needs To Be Done

#### Backend Changes
- [ ] Create monitoring service abstraction layer
- [ ] Implement SolarEdge API client
- [ ] Implement Enphase API client
- [ ] Create monitoring data polling/caching system
- [ ] Add webhook handlers for real-time alerts
- [ ] Store historical monitoring data
- [ ] Create anomaly detection for alerts

#### Frontend Changes
- [ ] Update hooks to use real API endpoints
- [ ] Add monitoring system configuration UI
- [ ] Display real-time alerts
- [ ] Show historical trends from real data

#### Files To Create/Modify
```
server/src/services/monitoring/            # New - Monitoring service
server/src/services/monitoring/solaredge.ts
server/src/services/monitoring/enphase.ts
server/src/routes/monitoring.ts            # Expand existing
src/hooks/useMonitoring.ts                 # Update to use real API
```

#### API Integration Details
See [INTEGRATIONS.md](./INTEGRATIONS.md) for detailed API documentation.

---

## Implementation Checklist Summary

| Item | Effort | Dependencies |
|------|--------|--------------|
| File Upload/Storage | M-L | S3 account |
| Email Notifications | M | SendGrid/Mailgun account |
| Form Data Entry | L | None |
| Audit Logging | M | None |
| Monitoring Integration | L-XL | API credentials |

## Recommended Order

1. **Audit Logging** - No external dependencies, improves debugging
2. **File Upload/Storage** - Core functionality, many features depend on it
3. **Email Notifications** - Critical for user engagement
4. **Form Data Entry** - Core business functionality
5. **Monitoring Integration** - Complex, can be phased
