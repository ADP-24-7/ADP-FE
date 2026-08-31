# API Integration

## Mode

`VITE_API_MODE=mock`이면 FE mock adapter를 사용합니다. `real`이면 Axios client가 `VITE_API_BASE_URL`로 요청합니다.

## Planned Endpoints

| Page | Endpoints |
| --- | --- |
| Overview | `/api/admin/dashboard/summary`, `/api/admin/alerts` |
| Gateway Lab | `/api/detection/evaluate`, `/api/runtime/decisions`, `/api/transforms/preview` |
| Policies | `/api/admin/policy-artifacts`, `/api/admin/policy-artifacts/{id}/shadow`, `/activate`, `/rollback` |
| Monitoring | `/api/admin/metrics/runtime`, `/api/admin/metrics/privacy`, `/api/admin/metrics/governance` |
| Audit | `/api/admin/audits`, `/api/admin/audits/{traceId}` |

## Runtime Action Contract

FE에서 허용하는 runtime action은 다음 값으로 고정합니다.

```ts
ALLOW | TRANSFORM | REVIEW | BLOCK
```

`policy_action`과 `final_action`은 별도로 표시하고 저장합니다.
