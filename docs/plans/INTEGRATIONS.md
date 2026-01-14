# External Service Integrations

This document details the external services that need to be integrated and how to implement them.

---

## 1. Solar Monitoring APIs

### SolarEdge API

**Purpose:** Fetch real-time and historical solar production data

**Documentation:** https://www.solaredge.com/sites/default/files/se_monitoring_api.pdf

#### API Details
- **Base URL:** `https://monitoringapi.solaredge.com`
- **Authentication:** API Key (per site)
- **Rate Limits:** 300 requests/day per site

#### Key Endpoints
| Endpoint | Purpose |
|----------|---------|
| `/site/{siteId}/overview` | Current power, daily/monthly energy |
| `/site/{siteId}/power` | Power flow over time range |
| `/site/{siteId}/energy` | Energy production over time range |
| `/site/{siteId}/details` | Site configuration details |
| `/site/{siteId}/envBenefits` | Environmental benefits |

#### Implementation Steps
1. Create SolarEdge service class
2. Store API keys per project in database
3. Implement data fetching with caching (to respect rate limits)
4. Map SolarEdge data to internal monitoring model
5. Set up periodic data sync (hourly recommended)

#### Sample Response
```json
{
  "overview": {
    "lastUpdateTime": "2024-01-15 12:00:00",
    "lifeTimeData": { "energy": 12345.67 },
    "lastYearData": { "energy": 5000.0 },
    "lastMonthData": { "energy": 400.0 },
    "lastDayData": { "energy": 15.5 },
    "currentPower": { "power": 3.2 }
  }
}
```

#### Files To Create
```
server/src/services/monitoring/solaredge.ts
server/src/types/solaredge.ts
```

---

### Enphase API

**Purpose:** Alternative monitoring for Enphase systems

**Documentation:** https://developer.enphase.com/docs

#### API Details
- **Base URL:** `https://api.enphaseenergy.com/api/v4`
- **Authentication:** OAuth 2.0
- **Rate Limits:** Varies by subscription tier

#### Key Endpoints
| Endpoint | Purpose |
|----------|---------|
| `/systems` | List all systems |
| `/systems/{system_id}/summary` | System summary |
| `/systems/{system_id}/energy_lifetime` | Lifetime energy |
| `/systems/{system_id}/production_meter_readings` | Production readings |
| `/systems/{system_id}/rgm_stats` | Revenue grade meter stats |

#### Implementation Steps
1. Register application with Enphase Developer Portal
2. Implement OAuth 2.0 flow for installer authorization
3. Create Enphase service class
4. Map Enphase data to internal monitoring model
5. Handle token refresh

#### Sample Response
```json
{
  "system_id": 123456,
  "total_devices": 20,
  "modules": 20,
  "inverters": 1,
  "size_w": 6000,
  "current_power": 3200,
  "energy_today": 15500,
  "energy_lifetime": 12345670
}
```

#### Files To Create
```
server/src/services/monitoring/enphase.ts
server/src/types/enphase.ts
server/src/services/monitoring/enphase-oauth.ts
```

---

### Monitoring Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Monitoring Service                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐                                       │
│  │ MonitoringService│ ◄── Abstract interface                │
│  └────────┬─────────┘                                       │
│           │                                                  │
│     ┌─────┴─────┬──────────────┐                            │
│     ▼           ▼              ▼                            │
│  ┌──────┐  ┌────────┐    ┌──────────┐                       │
│  │Solar │  │Enphase │    │ Generic  │                       │
│  │Edge  │  │Service │    │ Inverter │                       │
│  │Service│  │        │    │ Service  │                       │
│  └──────┘  └────────┘    └──────────┘                       │
│                                                              │
│  ┌──────────────────────────────────────────┐               │
│  │            Data Cache Layer              │               │
│  │  (Redis or in-memory with TTL)           │               │
│  └──────────────────────────────────────────┘               │
│                                                              │
│  ┌──────────────────────────────────────────┐               │
│  │         Historical Data Storage          │               │
│  │  (PostgreSQL - monitoring_data table)    │               │
│  └──────────────────────────────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Cloud Storage (AWS S3)

**Purpose:** Store uploaded documents and files

**Documentation:** https://docs.aws.amazon.com/AmazonS3/latest/userguide/

#### Setup Steps
1. Create AWS account
2. Create S3 bucket with appropriate region
3. Configure bucket policy for security
4. Set up IAM user with S3 permissions
5. Configure CORS for frontend uploads

#### Bucket Policy (Example)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowServerAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:user/solar-crm-server"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::solar-crm-documents/*"
    }
  ]
}
```

#### Implementation
```typescript
// server/src/lib/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadFile(key: string, body: Buffer, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  return s3Client.send(command);
}

export async function getPresignedUrl(key: string, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}
```

#### Environment Variables
```
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=solar-crm-documents
```

---

## 3. Email Service (SendGrid)

**Purpose:** Send transactional emails

**Documentation:** https://docs.sendgrid.com/

#### Setup Steps
1. Create SendGrid account
2. Verify sender domain (DNS records)
3. Create API key
4. Set up email templates (optional)

#### Implementation
```typescript
// server/src/services/email.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  const msg = {
    to,
    from: {
      email: process.env.EMAIL_FROM,
      name: process.env.EMAIL_FROM_NAME,
    },
    subject,
    html,
  };
  return sgMail.send(msg);
}

export async function sendTemplateEmail(to: string, templateId: string, dynamicData: object) {
  const msg = {
    to,
    from: {
      email: process.env.EMAIL_FROM,
      name: process.env.EMAIL_FROM_NAME,
    },
    templateId,
    dynamicTemplateData: dynamicData,
  };
  return sgMail.send(msg);
}
```

#### Environment Variables
```
SENDGRID_API_KEY=
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Solar CRM
```

---

## 4. SMS Service (Twilio)

**Purpose:** Send SMS notifications

**Documentation:** https://www.twilio.com/docs/sms

#### Setup Steps
1. Create Twilio account
2. Get phone number
3. Verify account (for production)

#### Implementation
```typescript
// server/src/services/sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(to: string, body: string) {
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
}
```

#### Environment Variables
```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 5. Payment Gateway (Stripe)

**Purpose:** Process payments and subscriptions

**Documentation:** https://stripe.com/docs

#### Setup Steps
1. Create Stripe account
2. Get API keys (test and live)
3. Configure webhooks
4. Set up products/prices (optional)

#### Implementation
```typescript
// server/src/services/payment.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createPaymentIntent(amount: number, currency: string, customerId?: string) {
  return stripe.paymentIntents.create({
    amount: amount * 100, // Stripe uses cents
    currency,
    customer: customerId,
    automatic_payment_methods: { enabled: true },
  });
}

export async function createCustomer(email: string, name: string) {
  return stripe.customers.create({ email, name });
}
```

#### Webhook Handler
```typescript
// server/src/webhooks/stripe.ts
import { Router } from 'express';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'payment_intent.succeeded':
      // Handle successful payment
      break;
    case 'payment_intent.payment_failed':
      // Handle failed payment
      break;
  }

  res.json({ received: true });
});
```

#### Environment Variables
```
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## 6. Push Notifications (Firebase)

**Purpose:** Send push notifications to mobile app

**Documentation:** https://firebase.google.com/docs/cloud-messaging

#### Setup Steps
1. Create Firebase project
2. Add Android/iOS apps
3. Download service account JSON
4. Configure Expo for push

#### Implementation
```typescript
// server/src/services/push.ts
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

export async function sendPushNotification(token: string, title: string, body: string, data?: object) {
  return admin.messaging().send({
    token,
    notification: { title, body },
    data: data as { [key: string]: string },
  });
}
```

#### Environment Variables
```
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
```

---

## 7. Error Monitoring (Sentry)

**Purpose:** Track errors and performance

**Documentation:** https://docs.sentry.io/

#### Setup Steps
1. Create Sentry account
2. Create project for backend
3. Create project for frontend
4. Get DSN values

#### Implementation (Backend)
```typescript
// server/src/lib/sentry.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

export { Sentry };
```

#### Implementation (Frontend)
```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

export { Sentry };
```

#### Environment Variables
```
SENTRY_DSN=
SENTRY_ENVIRONMENT=production
```

---

## Integration Checklist

| Service | Priority | Account Needed | Estimated Setup |
|---------|----------|----------------|-----------------|
| SolarEdge | High | Partner account | 2-3 days |
| Enphase | High | Developer account | 3-4 days |
| AWS S3 | High | AWS account | 1 day |
| SendGrid | High | SendGrid account | 1 day |
| Twilio | Medium | Twilio account | 1 day |
| Stripe | Medium | Stripe account | 2-3 days |
| Firebase | Medium | Google account | 1-2 days |
| Sentry | Low | Sentry account | 1 day |

---

## Environment Variables Summary

```bash
# Monitoring APIs
SOLAREDGE_API_KEY=
ENPHASE_CLIENT_ID=
ENPHASE_CLIENT_SECRET=

# AWS S3
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Email (SendGrid)
SENDGRID_API_KEY=
EMAIL_FROM=
EMAIL_FROM_NAME=

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Push Notifications (Firebase)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Error Monitoring (Sentry)
SENTRY_DSN=
SENTRY_ENVIRONMENT=
```

---

## Testing Integrations

### Development/Testing
- **SolarEdge:** Use sandbox/demo site ID
- **Enphase:** Use sandbox environment
- **S3:** Create separate test bucket
- **SendGrid:** Use test mode / sandbox
- **Twilio:** Use test credentials
- **Stripe:** Use test mode API keys
- **Firebase:** Create separate test project
- **Sentry:** Create separate test project

### Recommended Testing Flow
1. Set up test accounts for all services
2. Implement integration in development
3. Test with sandbox/test credentials
4. Switch to production credentials for deployment
