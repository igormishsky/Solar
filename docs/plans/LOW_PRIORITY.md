# Low Priority Implementation Items

These are quality improvements, developer experience enhancements, and nice-to-have features.

---

## 1. Test Coverage Expansion

**Current State:** ~40 test cases exist (<20% coverage). Only validation and permission tests.

**Priority:** Low (but important for long-term)
**Effort:** L (ongoing)

### What Needs To Be Done

#### Unit Tests
- [ ] Component rendering tests
- [ ] Hook behavior tests
- [ ] Store action tests
- [ ] Utility function tests
- [ ] Form validation edge cases

#### Integration Tests
- [ ] API endpoint tests
- [ ] Database operation tests
- [ ] Authentication flow tests
- [ ] Authorization scenario tests
- [ ] File upload tests

#### E2E Tests
- [ ] Complete user flows:
  - Customer CRUD flow
  - Project creation and management
  - Task assignment and completion
  - Form submission workflow
  - Document upload flow
- [ ] Cross-browser testing
- [ ] Mobile responsive testing

#### Files To Create/Modify
```
src/__tests__/
  ├── components/           # New - Component tests
  │   ├── CustomerList.test.tsx
  │   ├── ProjectCard.test.tsx
  │   └── TaskForm.test.tsx
  ├── hooks/                # New - Hook tests
  │   ├── useProjects.test.ts
  │   └── useCustomers.test.ts
  └── integration/          # New - Integration tests
      ├── api.test.ts
      └── auth.test.ts
e2e/
  ├── customer-flow.spec.ts
  ├── project-flow.spec.ts
  └── task-flow.spec.ts
```

#### Coverage Goals
| Area | Current | Target |
|------|---------|--------|
| Overall | <20% | 70% |
| Validations | 90% | 100% |
| Components | 0% | 60% |
| Hooks | 0% | 80% |
| API Routes | 0% | 90% |

---

## 2. Component Documentation (Storybook)

**Current State:** No component documentation or isolated development environment.

**Priority:** Low
**Effort:** M

### What Needs To Be Done

#### Setup
- [ ] Install Storybook for React
- [ ] Configure for TypeScript
- [ ] Add design tokens/theme support
- [ ] Configure addons (accessibility, viewport, etc.)

#### Documentation
- [ ] Create stories for all UI components:
  - Buttons, inputs, cards
  - Forms and form fields
  - Tables and lists
  - Modals and dialogs
  - Navigation components
- [ ] Add prop documentation
- [ ] Add usage examples
- [ ] Document component variants

#### Files To Create
```
.storybook/
  ├── main.ts
  ├── preview.ts
  └── theme.ts
src/components/
  ├── Button/
  │   ├── Button.tsx
  │   └── Button.stories.tsx
  ├── Input/
  │   ├── Input.tsx
  │   └── Input.stories.tsx
  └── ... (all components)
```

---

## 3. Performance Monitoring

**Current State:** No application performance monitoring or error tracking.

**Priority:** Low
**Effort:** S-M

### What Needs To Be Done

#### Backend Monitoring
- [ ] Install Sentry SDK (`@sentry/node`)
- [ ] Configure error tracking
- [ ] Add performance tracing
- [ ] Set up alerting rules

#### Frontend Monitoring
- [ ] Install Sentry SDK (`@sentry/react`)
- [ ] Configure error boundaries
- [ ] Add user context to errors
- [ ] Track core web vitals

#### Dashboard Setup
- [ ] Configure Sentry project
- [ ] Create custom dashboards
- [ ] Set up slack/email alerts
- [ ] Create release tracking

#### Files To Create/Modify
```
server/src/lib/sentry.ts           # New - Sentry config
server/src/index.ts                # Add Sentry initialization
src/lib/sentry.ts                  # New - Frontend Sentry
src/App.tsx                        # Add error boundary
```

#### Environment Variables Needed
```
SENTRY_DSN=
SENTRY_ENVIRONMENT=
SENTRY_RELEASE=
```

---

## 4. Database Migration Tooling

**Current State:** Schema exists in Supabase. No migration files in repository.

**Priority:** Low
**Effort:** M

### What Needs To Be Done

#### Setup
- [ ] Choose migration tool (Prisma, Knex, or raw SQL migrations)
- [ ] Export current schema as baseline
- [ ] Set up migration scripts
- [ ] Add to CI/CD pipeline

#### Implementation
- [ ] Create baseline migration
- [ ] Document migration workflow
- [ ] Add rollback support
- [ ] Create seed data scripts

#### Files To Create
```
database/
  ├── migrations/
  │   ├── 001_initial_schema.sql
  │   ├── 002_add_audit_logs.sql
  │   └── ...
  ├── seeds/
  │   ├── development.sql
  │   └── test.sql
  └── README.md
```

---

## 5. Mobile Offline Support

**Current State:** Mobile app requires network connection. No offline data caching.

**Priority:** Low
**Effort:** L

### What Needs To Be Done

#### Data Layer
- [ ] Install offline storage (`@react-native-async-storage/async-storage`)
- [ ] Implement offline data sync strategy
- [ ] Add queue for offline mutations
- [ ] Handle conflict resolution

#### UI Changes
- [ ] Add offline indicator
- [ ] Show cached data when offline
- [ ] Queue actions for sync
- [ ] Show sync status

#### Background Sync
- [ ] Implement background sync
- [ ] Handle partial sync failures
- [ ] Add retry logic

#### Files To Create/Modify
```
src/lib/offline/
  ├── storage.ts           # AsyncStorage wrapper
  ├── sync.ts              # Sync logic
  └── queue.ts             # Mutation queue
src/hooks/useOffline.ts    # Offline state hook
src/components/OfflineIndicator.tsx
```

---

## 6. Accessibility Improvements

**Current State:** Basic accessibility. No comprehensive audit done.

**Priority:** Low
**Effort:** S-M

### What Needs To Be Done

#### Audit
- [ ] Run automated accessibility audit
- [ ] Manual keyboard navigation testing
- [ ] Screen reader testing
- [ ] Color contrast verification

#### Implementation
- [ ] Add proper ARIA labels
- [ ] Ensure keyboard navigation
- [ ] Add skip links
- [ ] Improve focus management
- [ ] Add announcements for dynamic content

#### Files To Modify
- All component files for ARIA attributes
- Navigation components for keyboard support
- Form components for accessibility

---

## 7. API Documentation (OpenAPI/Swagger)

**Current State:** API documented in markdown. No interactive documentation.

**Priority:** Low
**Effort:** S-M

### What Needs To Be Done

#### Setup
- [ ] Install swagger tools (`swagger-ui-express`, `swagger-jsdoc`)
- [ ] Configure OpenAPI spec generation
- [ ] Add JSDoc annotations to routes

#### Documentation
- [ ] Document all endpoints
- [ ] Add request/response schemas
- [ ] Add authentication documentation
- [ ] Add error response documentation

#### Files To Create/Modify
```
server/src/lib/swagger.ts          # New - Swagger config
server/src/routes/*.ts             # Add JSDoc annotations
docs/api/openapi.yaml              # Generated spec
```

---

## 8. Code Quality Tools

**Current State:** ESLint and TypeScript configured. No additional quality gates.

**Priority:** Low
**Effort:** S

### What Needs To Be Done

#### Setup
- [ ] Add Husky for git hooks
- [ ] Add lint-staged for pre-commit
- [ ] Add commitlint for commit messages
- [ ] Configure Prettier (if not already)

#### Configuration
- [ ] Pre-commit: lint, type-check, format
- [ ] Pre-push: run tests
- [ ] Commit message validation

#### Files To Create
```
.husky/
  ├── pre-commit
  └── pre-push
.commitlintrc.js
.lintstagedrc.js
```

---

## Implementation Checklist Summary

| Item | Effort | Dependencies |
|------|--------|--------------|
| Test Coverage | L | None |
| Storybook | M | None |
| Performance Monitoring | S-M | Sentry account |
| Database Migrations | M | None |
| Offline Support | L | None |
| Accessibility | S-M | None |
| API Documentation | S-M | None |
| Code Quality Tools | S | None |

## Recommended Order

1. **Code Quality Tools** - Quick win, improves dev experience
2. **Performance Monitoring** - Important for production
3. **API Documentation** - Helps team and API consumers
4. **Test Coverage** - Ongoing, start with critical paths
5. **Accessibility** - Important for compliance
6. **Storybook** - Nice for component development
7. **Database Migrations** - Before major schema changes
8. **Offline Support** - Only if users need offline access

## Notes

These items are marked as "low priority" because the application can function without them. However, they are important for:

- **Long-term maintainability** (tests, migrations, docs)
- **Developer experience** (Storybook, quality tools)
- **Production stability** (monitoring, error tracking)
- **Compliance** (accessibility)

Consider gradually implementing these alongside feature work.
