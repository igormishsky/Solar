# API Documentation

## Overview

The O.R.I SOLAR API is a RESTful API built with Node.js and Express. It provides endpoints for managing customers, projects, tasks, documents, and system monitoring.

---

## Base URL

```
Production:  https://api.ori-solar.com/v1
Development: http://localhost:3000/api/v1
```

---

## Authentication

### JWT Authentication

All API requests (except login/register) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Endpoints

#### POST `/auth/login`
Authenticate user and receive tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "MANAGER"
  }
}
```

#### POST `/auth/refresh`
Refresh access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST `/auth/logout`
Invalidate refresh token.

---

## API Conventions

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-09T12:00:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  },
  "meta": {
    "timestamp": "2026-01-09T12:00:00Z"
  }
}
```

### Pagination

List endpoints support pagination:

```
GET /customers?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Filtering

Use query parameters for filtering:

```
GET /customers?customerType=PRIVATE&status=ACTIVE
GET /projects?status=IN_PROGRESS,PENDING_SYNC
GET /tasks?assigneeId=uuid&priority=HIGH
```

---

## Customers API

### GET `/customers`
List all customers with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| search | string | Search in name, email, phone |
| customerType | enum | PRIVATE, BUSINESS, INSTITUTIONAL |
| status | enum | ACTIVE, INACTIVE, SUSPENDED |
| sortBy | string | Field to sort by |
| sortOrder | string | asc or desc |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "ישראל",
      "lastName": "ישראלי",
      "idNumber": "123456789",
      "email": "israel@example.com",
      "phonePrimary": "050-1234567",
      "customerType": "PRIVATE",
      "status": "ACTIVE",
      "projectCount": 2,
      "createdAt": "2026-01-09T12:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### GET `/customers/:id`
Get customer details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "ישראל",
    "lastName": "ישראלי",
    "idNumber": "123456789",
    "email": "israel@example.com",
    "phonePrimary": "050-1234567",
    "phoneSecondary": "03-1234567",
    "customerType": "PRIVATE",
    "billingMethod": "NET_METERING",
    "contractNumber": "12345",
    "orderNumber": "67890",
    "meterNumber": "M12345",
    "networkDivision": "מרכז",
    "status": "ACTIVE",
    "addresses": [
      {
        "id": "uuid",
        "addressType": "RESIDENTIAL",
        "city": "תל אביב",
        "street": "רוטשילד",
        "number": "1",
        "apartment": "5",
        "postalCode": "6688101"
      },
      {
        "id": "uuid",
        "addressType": "PROPERTY",
        "city": "תל אביב",
        "street": "רוטשילד",
        "number": "1",
        "block": "1234",
        "parcel": "56",
        "subParcel": "1"
      }
    ],
    "projects": [...],
    "createdAt": "2026-01-09T12:00:00Z",
    "updatedAt": "2026-01-09T12:00:00Z"
  }
}
```

### POST `/customers`
Create a new customer.

**Request:**
```json
{
  "firstName": "ישראל",
  "lastName": "ישראלי",
  "idNumber": "123456789",
  "email": "israel@example.com",
  "phonePrimary": "050-1234567",
  "phoneSecondary": "03-1234567",
  "customerType": "PRIVATE",
  "billingMethod": "NET_METERING",
  "addresses": [
    {
      "addressType": "RESIDENTIAL",
      "city": "תל אביב",
      "street": "רוטשילד",
      "number": "1",
      "apartment": "5",
      "postalCode": "6688101"
    }
  ]
}
```

### PUT `/customers/:id`
Update customer information.

### DELETE `/customers/:id`
Soft delete a customer (sets status to INACTIVE).

---

## Projects API

### GET `/projects`
List all projects.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| customerId | uuid | Filter by customer |
| status | enum | Filter by status (comma-separated for multiple) |
| startDate | date | Filter by start date (from) |
| endDate | date | Filter by start date (to) |

### GET `/projects/:id`
Get project details with all related data.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectNumber": "ORI-2026-0001",
    "customer": {
      "id": "uuid",
      "firstName": "ישראל",
      "lastName": "ישראלי"
    },
    "address": { ... },
    "status": "IN_PROGRESS",
    "systemSize": 10.5,
    "panelCount": 28,
    "inverterModel": "SolarEdge SE10K",
    "estimatedProduction": 15000,
    "professionals": [
      {
        "id": "uuid",
        "name": "חשמל בע\"מ",
        "type": "COMPANY",
        "role": "Installing Company"
      }
    ],
    "stages": [
      {
        "id": "uuid",
        "stageType": "REQUEST_OPENING",
        "status": "COMPLETED",
        "completedAt": "2026-01-05T10:00:00Z"
      },
      {
        "id": "uuid",
        "stageType": "PAYMENT",
        "status": "COMPLETED",
        "completedAt": "2026-01-06T14:00:00Z"
      },
      {
        "id": "uuid",
        "stageType": "DEPARTMENT_RESPONSE",
        "status": "IN_PROGRESS",
        "startedAt": "2026-01-07T09:00:00Z"
      }
    ],
    "forms": [...],
    "tasks": [...],
    "documents": [...],
    "createdAt": "2026-01-01T12:00:00Z"
  }
}
```

### POST `/projects`
Create a new project.

**Request:**
```json
{
  "customerId": "uuid",
  "addressId": "uuid",
  "systemSize": 10.5,
  "panelCount": 28,
  "inverterModel": "SolarEdge SE10K",
  "estimatedProduction": 15000,
  "startDate": "2026-01-15"
}
```

### PUT `/projects/:id`
Update project details.

### POST `/projects/:id/assign-professional`
Assign a professional to a project.

**Request:**
```json
{
  "professionalId": "uuid",
  "role": "Installing Contractor"
}
```

### PUT `/projects/:id/stages/:stageId`
Update installation stage status.

**Request:**
```json
{
  "status": "COMPLETED",
  "notes": "Stage completed successfully"
}
```

---

## Tasks API

### GET `/tasks`
List tasks with filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| assigneeId | uuid | Filter by assigned user |
| projectId | uuid | Filter by project |
| status | enum | PENDING, IN_PROGRESS, COMPLETED, CANCELLED |
| priority | enum | LOW, MEDIUM, HIGH, URGENT |
| dueDate | date | Filter by due date |

### GET `/tasks/:id`
Get task details.

### POST `/tasks`
Create a new task.

**Request:**
```json
{
  "projectId": "uuid",
  "title": "Install solar panels",
  "description": "Complete panel installation on roof",
  "priority": "HIGH",
  "dueDate": "2026-01-20",
  "assigneeId": "uuid"
}
```

### PUT `/tasks/:id`
Update task.

### PUT `/tasks/:id/status`
Quick status update (for mobile app).

**Request:**
```json
{
  "status": "COMPLETED"
}
```

### POST `/tasks/:id/comments`
Add comment to task.

**Request:**
```json
{
  "content": "Completed 50% of the installation"
}
```

---

## Professionals API

### GET `/professionals`
List all professionals.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| type | enum | COMPANY, CONTRACTOR, PLANNER, ELECTRICIAN, CONSTRUCTOR |
| isActive | boolean | Filter by active status |
| licenseExpiring | boolean | Filter professionals with expiring licenses (30 days) |

### GET `/professionals/:id`
Get professional details with license information.

### POST `/professionals`
Create a new professional.

### PUT `/professionals/:id`
Update professional information.

### POST `/professionals/:id/licenses`
Add a new license to a professional.

**Request:**
```json
{
  "licenseType": "Electrician Class A",
  "licenseNumber": "12345",
  "issuedAt": "2024-01-01",
  "expiresAt": "2027-01-01",
  "documentId": "uuid"
}
```

---

## Documents API

### GET `/documents`
List documents.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | uuid | Filter by project |
| customerId | uuid | Filter by customer |
| documentType | enum | Filter by type |

### GET `/documents/:id`
Get document metadata.

### GET `/documents/:id/download`
Download document file.

### POST `/documents/upload`
Upload a new document.

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| file | file | The file to upload |
| projectId | uuid | Associated project |
| customerId | uuid | Associated customer |
| documentType | enum | Document type |
| title | string | Document title |

### DELETE `/documents/:id`
Delete a document.

---

## Forms API

### GET `/forms`
List forms.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | uuid | Filter by project |
| formType | enum | Filter by form type |
| status | enum | Filter by status |

### GET `/forms/:id`
Get form details.

### POST `/forms/generate`
Generate a new form with project data.

**Request:**
```json
{
  "projectId": "uuid",
  "formType": "LAYOUT_PLAN"
}
```

### PUT `/forms/:id/status`
Update form status.

**Request:**
```json
{
  "status": "SIGNED",
  "signedById": "uuid"
}
```

---

## Monitoring API

### GET `/monitoring/projects/:projectId/performance`
Get performance data for a project.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | datetime | Start of period |
| endDate | datetime | End of period |
| interval | enum | HOURLY, DAILY, WEEKLY, MONTHLY |

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEnergy": 1500.5,
      "averagePower": 8.5,
      "peakPower": 10.2,
      "efficiency": 92.5
    },
    "timeSeries": [
      {
        "timestamp": "2026-01-09T00:00:00Z",
        "energyProduced": 45.5,
        "powerOutput": 8.2,
        "efficiency": 91.0
      }
    ]
  }
}
```

### POST `/monitoring/projects/:projectId/sync`
Trigger manual data sync from monitoring provider.

---

## Alerts API

### GET `/alerts`
List alerts.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | uuid | Filter by project |
| type | enum | Filter by alert type |
| severity | enum | INFO, WARNING, CRITICAL |
| isRead | boolean | Filter by read status |
| isResolved | boolean | Filter by resolution status |

### PUT `/alerts/:id/read`
Mark alert as read.

### PUT `/alerts/:id/resolve`
Resolve an alert.

**Request:**
```json
{
  "resolution": "Panel cleaned, production restored"
}
```

---

## Dashboard API

### GET `/dashboard/summary`
Get dashboard summary statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": {
      "total": 150,
      "byType": {
        "PRIVATE": 100,
        "BUSINESS": 40,
        "INSTITUTIONAL": 10
      }
    },
    "projects": {
      "total": 180,
      "active": 25,
      "byStatus": {
        "IN_PROGRESS": 15,
        "PENDING_SYNC": 5,
        "SYNCED": 3,
        "COMMERCIALLY_ACTIVE": 120
      }
    },
    "tasks": {
      "pending": 45,
      "overdue": 5,
      "completedThisWeek": 23
    },
    "alerts": {
      "critical": 2,
      "warning": 8,
      "unread": 15
    },
    "performance": {
      "totalSystemsMonitored": 100,
      "totalEnergyThisMonth": 450000,
      "averageEfficiency": 91.5
    },
    "licenses": {
      "expiringThisMonth": 3
    }
  }
}
```

### GET `/dashboard/recent-activity`
Get recent system activity.

---

## Service Requests API

### GET `/service-requests`
List service requests.

### GET `/service-requests/:id`
Get service request details.

### POST `/service-requests`
Create a new service request.

**Request:**
```json
{
  "customerId": "uuid",
  "projectId": "uuid",
  "requestType": "MAINTENANCE",
  "priority": "MEDIUM",
  "subject": "Annual maintenance required",
  "description": "Customer requesting annual system inspection"
}
```

### PUT `/service-requests/:id`
Update service request.

### PUT `/service-requests/:id/resolve`
Resolve a service request.

**Request:**
```json
{
  "resolution": "Completed annual inspection. All systems normal."
}
```

---

## Reports API

### GET `/reports/projects`
Generate project status report.

### GET `/reports/performance`
Generate performance report.

### GET `/reports/maintenance`
Generate maintenance report.

### GET `/reports/financial`
Generate financial report.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | date | Report start date |
| endDate | date | Report end date |
| format | enum | JSON, PDF, EXCEL |

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Invalid or missing authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input data |
| DUPLICATE_ENTRY | 409 | Resource already exists |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limiting

- **Standard:** 100 requests per minute per user
- **Upload:** 10 file uploads per minute
- **Reports:** 5 report generations per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704805200
```

---

## Webhooks (Future)

Planned webhook events:
- `project.created`
- `project.status_changed`
- `task.assigned`
- `task.completed`
- `alert.created`
- `form.signed`
