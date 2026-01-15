# Medium Priority Implementation Items

These are important feature enhancements that improve user experience and business functionality.

---

## 1. Report Export (PDF/Excel)

**Current State:** Reports endpoint exists returning JSON data. No export functionality.

**Priority:** Medium
**Effort:** M

### What Needs To Be Done

#### Backend Changes
- [ ] Install `pdfkit` or `puppeteer` for PDF generation
- [ ] Install `exceljs` for Excel generation
- [ ] Create report templates:
  - Dashboard summary report
  - Project status report
  - Customer portfolio report
  - Task completion report
  - Professional licenses report
- [ ] Add export endpoints returning file streams
- [ ] Implement date range filtering for reports

#### Frontend Changes
- [ ] Add export buttons to report views
- [ ] Create export options modal (format, date range)
- [ ] Show download progress indicator
- [ ] Add scheduled report generation (optional)

#### Files To Create/Modify
```
server/src/services/reports/           # New - Report service
server/src/services/reports/pdf.ts     # PDF generator
server/src/services/reports/excel.ts   # Excel generator
server/src/routes/reports.ts           # Add export endpoints
src/components/Reports/ExportButton.tsx
src/components/Reports/ExportModal.tsx
```

#### Report Templates
| Report | Format | Description |
|--------|--------|-------------|
| dashboard-summary | PDF, XLSX | Overview stats and metrics |
| project-status | PDF, XLSX | All projects with stages |
| customer-portfolio | PDF, XLSX | Customer list with projects |
| task-report | PDF, XLSX | Tasks by status/priority |
| license-report | PDF | Professionals with license status |

---

## 2. Payment Gateway Integration

**Current State:** `billing_method` field exists in customer model. No payment processing.

**Priority:** Medium
**Effort:** L

### What Needs To Be Done

#### Database Changes
- [ ] Create `invoices` table
- [ ] Create `payments` table
- [ ] Create `payment_methods` table (for saved cards)

#### Backend Changes
- [ ] Install Stripe SDK (`stripe`)
- [ ] Create payment service module
- [ ] Implement:
  - Create payment intent
  - Process payment
  - Handle webhooks (payment success/failure)
  - Store payment history
  - Generate invoices
- [ ] Add subscription support (optional)

#### Frontend Changes
- [ ] Add Stripe Elements for card input
- [ ] Create payment form component
- [ ] Create invoice list view
- [ ] Create payment history view
- [ ] Add payment status to project view

#### Files To Create/Modify
```
server/src/services/payment.ts         # New - Stripe service
server/src/routes/payments.ts          # New - Payment endpoints
server/src/routes/invoices.ts          # New - Invoice endpoints
server/src/webhooks/stripe.ts          # New - Webhook handler
src/components/Payments/PaymentForm.tsx
src/components/Payments/InvoiceList.tsx
src/components/Payments/PaymentHistory.tsx
```

#### Environment Variables Needed
```
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## 3. SMS/Push Notifications

**Current State:** `expo-notifications` package installed. No actual push implementation.

**Priority:** Medium
**Effort:** M

### What Needs To Be Done

#### Backend Changes
- [ ] Install Twilio SDK for SMS (`twilio`)
- [ ] Install Firebase Admin SDK for push (`firebase-admin`)
- [ ] Create notification service abstraction
- [ ] Implement notification preferences storage
- [ ] Create notification queue for rate limiting
- [ ] Add notification templates:
  - SMS templates (shorter)
  - Push notification templates

#### Mobile App Changes
- [ ] Configure Firebase for push
- [ ] Request notification permissions
- [ ] Register device tokens with backend
- [ ] Handle incoming notifications
- [ ] Add notification center screen

#### Files To Create/Modify
```
server/src/services/sms.ts             # New - Twilio service
server/src/services/push.ts            # New - Firebase push
server/src/routes/notifications.ts     # Expand
app/notifications.tsx                  # New - Notification center
src/hooks/useNotifications.ts          # Update for real data
```

#### Notification Types
| Event | SMS | Push | Email |
|-------|-----|------|-------|
| Task assigned | Optional | Yes | Yes |
| Task due soon | Optional | Yes | Yes |
| Project status change | No | Yes | Yes |
| Form approved/rejected | No | Yes | Yes |
| License expiring | Yes | Yes | Yes |
| Payment received | Yes | Yes | Yes |

#### Environment Variables Needed
```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
```

---

## 4. Professional License Renewal Workflow

**Current State:** License expiry tracking exists. No renewal workflow or notifications.

**Priority:** Medium
**Effort:** S-M

### What Needs To Be Done

#### Backend Changes
- [ ] Create license renewal request endpoint
- [ ] Add license document upload support
- [ ] Create license verification endpoint
- [ ] Add automated expiry notification job (cron)
- [ ] Track renewal history

#### Frontend Changes
- [ ] Add license renewal form
- [ ] Show license status badges
- [ ] Create license renewal reminder notifications
- [ ] Add license document upload in professional profile
- [ ] Create admin license verification queue

#### Files To Create/Modify
```
server/src/routes/professionals.ts     # Add renewal endpoints
server/src/jobs/license-expiry.ts      # New - Cron job
src/components/Professionals/LicenseRenewal.tsx
src/components/Professionals/LicenseStatus.tsx
```

#### License Workflow
```
┌─────────────────────────────────────────────────────┐
│                    License Lifecycle                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Active ──► 60 days warning ──► 30 days warning     │
│     │                               │                │
│     │                               ▼                │
│     │                         Renewal Required       │
│     │                               │                │
│     │                               ▼                │
│     └──────────────────────► Renewal Submitted       │
│                                     │                │
│                                     ▼                │
│                              Under Review            │
│                                     │                │
│                          ┌──────────┴──────────┐    │
│                          ▼                     ▼    │
│                      Approved              Rejected  │
│                          │                     │    │
│                          ▼                     ▼    │
│                       Active            Needs Resubmit│
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 5. Advanced Analytics & Charting

**Current State:** Basic stats cards on dashboard. No trend analysis or advanced charts.

**Priority:** Medium
**Effort:** M

### What Needs To Be Done

#### Backend Changes
- [ ] Create analytics aggregation endpoints:
  - Project completion trends
  - Revenue over time
  - Task completion rates
  - Customer acquisition trends
  - Seasonal patterns
- [ ] Add data caching for expensive queries
- [ ] Create comparison endpoints (month-over-month, year-over-year)

#### Frontend Changes
- [ ] Install advanced charting library (`recharts` or `victory`)
- [ ] Create analytics dashboard page
- [ ] Build chart components:
  - Line charts (trends over time)
  - Bar charts (comparisons)
  - Pie charts (distributions)
  - Area charts (cumulative data)
- [ ] Add date range picker for filtering
- [ ] Create drill-down functionality

#### Files To Create/Modify
```
server/src/routes/analytics.ts         # New - Analytics API
src/components/Analytics/             # New directory
  ├── TrendChart.tsx
  ├── ComparisonChart.tsx
  ├── DistributionChart.tsx
  └── DateRangePicker.tsx
app/(tabs)/analytics.tsx              # New - Analytics page
```

#### Chart Types Needed
| Chart | Data | Purpose |
|-------|------|---------|
| Projects over time | Monthly project count | Growth tracking |
| Revenue trend | Monthly/quarterly revenue | Financial health |
| Task completion | Weekly completion rate | Team productivity |
| Stage distribution | Current stage counts | Pipeline view |
| Customer by region | Geographic distribution | Market analysis |

---

## 6. Calendar Integration

**Current State:** Tasks have due dates. No calendar view or external calendar sync.

**Priority:** Medium
**Effort:** M

### What Needs To Be Done

#### Backend Changes
- [ ] Create calendar events endpoint
- [ ] Add iCal export functionality
- [ ] Implement Google Calendar sync (optional)
- [ ] Add recurring events support

#### Frontend Changes
- [ ] Install calendar component (`react-big-calendar` or similar)
- [ ] Create calendar view for tasks
- [ ] Show project milestones on calendar
- [ ] Add drag-and-drop rescheduling
- [ ] Create calendar export button

#### Files To Create/Modify
```
server/src/routes/calendar.ts          # New - Calendar API
src/components/Calendar/              # New directory
  ├── CalendarView.tsx
  ├── EventCard.tsx
  └── ExportButton.tsx
app/(tabs)/calendar.tsx               # New - Calendar page
```

---

## Implementation Checklist Summary

| Item | Effort | Dependencies |
|------|--------|--------------|
| Report Export | M | None |
| Payment Gateway | L | Stripe account |
| SMS/Push Notifications | M | Twilio/Firebase accounts |
| License Renewal Workflow | S-M | File upload (HIGH_PRIORITY) |
| Advanced Analytics | M | None |
| Calendar Integration | M | None |

## Recommended Order

1. **Report Export** - High user value, no dependencies
2. **License Renewal Workflow** - Simpler, improves compliance
3. **Advanced Analytics** - Adds significant value
4. **Calendar Integration** - Improves task management
5. **SMS/Push Notifications** - Requires external setup
6. **Payment Gateway** - Complex, requires business decisions
