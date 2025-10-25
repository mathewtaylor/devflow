# DevFlow Context Loading Pattern Library

This file defines keyword patterns that trigger automatic loading of domain documentation.

## Pattern Format

```
Pattern Name:
  Keywords: [keyword1, keyword2, ...]
  Loads: path/to/domain/doc.md
  Priority: high|medium|low
  Conflicts: [other patterns that conflict]
```

## Security & Authentication

### Authentication
- Keywords: `authentication`, `auth`, `login`, `logout`, `signup`, `signin`, `password`, `credentials`, `jwt`, `token`, `oauth`, `saml`, `sso`
- Loads: `domains/security/authentication.md`
- Priority: high
- Conflicts: none

### Authorization
- Keywords: `authorization`, `permissions`, `roles`, `rbac`, `access control`, `acl`, `policy`, `scope`
- Loads: `domains/security/authorization.md`
- Priority: high
- Conflicts: none

### Data Protection
- Keywords: `encryption`, `hashing`, `secrets`, `sensitive data`, `pii`, `gdpr`, `compliance`, `data privacy`
- Loads: `domains/security/data-protection.md`
- Priority: high
- Conflicts: none

## Integrations

### Payment Processing
- Keywords: `payment`, `stripe`, `paypal`, `billing`, `invoice`, `subscription`, `checkout`, `credit card`, `transaction`
- Loads: `domains/integrations/payment-processing.md`
- Priority: high
- Conflicts: none

### Third-Party APIs
- Keywords: `api integration`, `webhook`, `third party`, `external api`, `rest client`, `graphql client`
- Loads: `domains/integrations/third-party-apis.md`
- Priority: medium
- Conflicts: none

### Email Services
- Keywords: `email`, `sendgrid`, `mailgun`, `ses`, `smtp`, `notification email`
- Loads: `domains/integrations/email-services.md`
- Priority: medium
- Conflicts: none

## Data Layer

### Database Design
- Keywords: `database`, `schema`, `table`, `relation`, `foreign key`, `index`, `constraint`, `normalization`
- Loads: `domains/data/database-design.md`
- Priority: high
- Conflicts: none

### Schema Management
- Keywords: `migration`, `schema change`, `alter table`, `database migration`, `version control`
- Loads: `domains/data/schema-management.md`
- Priority: high
- Conflicts: none

### ORM & Query
- Keywords: `orm`, `entity framework`, `prisma`, `sequelize`, `query builder`, `linq`, `active record`
- Loads: `domains/data/orm-patterns.md`
- Priority: medium
- Conflicts: none

## Architecture

### API Design
- Keywords: `api`, `endpoint`, `rest`, `graphql`, `route`, `controller`, `handler`, `request`, `response`
- Loads: `domains/architecture/api-design.md`
- Priority: high
- Conflicts: none

### Microservices
- Keywords: `microservice`, `service mesh`, `distributed`, `service discovery`, `circuit breaker`
- Loads: `domains/architecture/microservices.md`
- Priority: medium
- Conflicts: none

### Event-Driven
- Keywords: `event`, `message queue`, `pub/sub`, `event bus`, `kafka`, `rabbitmq`, `event sourcing`
- Loads: `domains/architecture/event-driven.md`
- Priority: medium
- Conflicts: none

## Frontend

### React Patterns
- Keywords: `react`, `component`, `hook`, `jsx`, `props`, `state management`, `context api`
- Loads: `domains/frontend/react-patterns.md`
- Priority: medium
- Conflicts: none

### UI/UX Standards
- Keywords: `ui`, `ux`, `design system`, `component library`, `accessibility`, `a11y`, `responsive`
- Loads: `domains/frontend/ui-ux-standards.md`
- Priority: medium
- Conflicts: none

## Quality & Testing

### Testing Standards
- Keywords: `test`, `testing`, `unit test`, `integration test`, `e2e`, `coverage`, `mock`, `stub`, `assertion`
- Loads: `domains/quality/testing-standards.md`
- Priority: high
- Conflicts: none

### Code Quality
- Keywords: `code review`, `linting`, `static analysis`, `code smell`, `refactoring`, `technical debt`
- Loads: `domains/quality/code-standards.md`
- Priority: medium
- Conflicts: none

### Performance
- Keywords: `performance`, `optimization`, `caching`, `profiling`, `latency`, `throughput`, `bottleneck`
- Loads: `domains/quality/performance.md`
- Priority: medium
- Conflicts: none

## DevOps & Infrastructure

### CI/CD
- Keywords: `ci`, `cd`, `pipeline`, `deployment`, `github actions`, `jenkins`, `gitlab ci`
- Loads: `domains/devops/ci-cd.md`
- Priority: medium
- Conflicts: none

### Docker & Containers
- Keywords: `docker`, `container`, `dockerfile`, `image`, `kubernetes`, `k8s`, `pod`
- Loads: `domains/devops/containerization.md`
- Priority: medium
- Conflicts: none

### Monitoring & Logging
- Keywords: `monitoring`, `logging`, `observability`, `metrics`, `tracing`, `alerts`, `sentry`, `datadog`
- Loads: `domains/devops/monitoring.md`
- Priority: medium
- Conflicts: none

## Conflict Resolution

When multiple patterns match:
1. Load all high-priority matches
2. For medium/low priority, limit to top 3 most relevant
3. Respect token budget (max 5 docs recommended)
4. Prioritize feature tags over keyword matches
5. Show user what was loaded and why
