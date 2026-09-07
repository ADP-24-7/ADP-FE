# Local API Verification

## Verified Baseline

- Date: 2026-09-07
- Backend: `ADP-BE origin/main@b5d8d289`
- Database: fresh PostgreSQL database
- Flyway: V1 through V22 applied
- Frontend: `feat/be-main-api-integration`

## Verified Flows

| Flow | Result |
| --- | --- |
| `GET /actuator/health/readiness` | 200, `UP` |
| `POST /api/runtime/context/preview` | 200, Field metadata/Digest/Detection 반환 |
| `POST /v1/runtime/executions` | 200, `COMPLETED / TRANSFORM` |
| `GET /v1/runtime/executions/{id}/trace` | 200, 12 observed stages + evidence |
| `GET /api/admin/audit/executions` | 200, Institution/Workload scoped list |
| `GET /api/admin/audit/executions/{id}/evidence` | 200, digest-only evidence pack |
| `POST /api/admin/policy-lifecycle` | 201, `DRAFT` |
| `GET /api/admin/policy-lifecycle/{id}/versions/{version}` | 200 |

Browser verification covered the following UI transitions:

- Overview displays backend readiness `UP` and leaves unavailable aggregate metrics unconnected.
- Gateway Lab submits an AI Runtime request through the local BFF and renders the returned actions, trace stages, evidence counts, delivery status, and digests.
- Gateway Lab submits the current Digital Asset Thin E2E purchase contract and renders `COMPLETED / TRANSFORM / DELIVERED` without mock data.
- Decision Trace loads the audit list and opens an Evidence Pack by Execution ID.
- Policy Lifecycle loads an exact Artifact ID/Version.
- Workload · Data Access runs the privacy-safe Context Preview without rendering raw records.

## Local Fixture Input

The current BE local fixture accepts the following AI contract. Use synthetic values only.

```text
institutionId: institution_local
approvalReference: approval_ai_customer_support_v1
workloadId: customer_summary
purposeCode: CUSTOMER_SUPPORT
subjectScope: customer:customer-100
destinationProfileId: dest_internal_provider_project_provisional
processingContexts: AI_USE
```

## Known Local Database Issue

The existing shared Docker database failed BE startup because migration V23 had already been applied with a different checksum than the uncommitted V23 file in the current ADP-BE working branch.

```text
Migration checksum mismatch for migration version 23
Applied to database: -1275995779
Resolved locally:    -1307150335
```

No Flyway repair, database deletion, or migration rollback was performed. The latest `origin/main` contains V1 through V22, so it was validated against a separate fresh database. The V23 mismatch belongs to the in-progress BE branch and should be resolved there without modifying an already-applied migration.
