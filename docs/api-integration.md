# API Integration

## Mode

`VITE_API_MODE=mock`이면 MSW가 `/api/**` 요청을 HTTP layer에서 intercept합니다. `real`이면 동일한 Axios 호출이 Vite proxy 또는 배포 reverse proxy를 통해 BE로 전달됩니다.

`VITE_API_MODE`는 fail-closed로 검증합니다. 값이 없거나 `mock`, `real` 외 값이면 앱이 시작되지 않습니다. `mock`은 `VITE_APP_ENV=local`에서만 허용합니다.

## Planned Endpoints

| Page | Endpoints |
| --- | --- |
| Overview | `/api/admin/dashboard/summary`, `/api/admin/alerts` |
| Gateway Lab | `/api/detection/evaluate`, `/api/runtime/decisions`, `/api/transforms/preview` |
| Policies | `/api/admin/policy-artifacts`, `/api/admin/policy-artifacts/{id}/shadow`, `/activate`, `/rollback` |
| Monitoring | `/api/admin/metrics/runtime`, `/api/admin/metrics/privacy`, `/api/admin/metrics/governance` |
| Audit | `/api/admin/audits`, `/api/admin/audits/{traceId}` |

## Runtime Action Contract

FE에서 허용하는 policy/final action은 다음 값으로 고정합니다.

```ts
type PolicyAction = 'ALLOW' | 'TRANSFORM' | 'REVIEW' | 'BLOCK';
type FinalAction = 'ALLOW' | 'TRANSFORM' | 'REVIEW' | 'BLOCK';
```

`policy_action`과 `final_action`은 별도로 표시하고 저장합니다.

## Error Contract

BE error response는 다음 필드를 기준으로 normalize합니다.

```ts
type ApiError = {
  status?: number;
  reasonCode: string;
  message: string;
  requestId?: string;
  traceId?: string;
  timestamp?: string;
};
```
