# ADP-FE Architecture

## Goal

ADP-FE는 관리자용 SPA입니다. SSR과 SEO 요구가 없으므로 Vite 기반 React 애플리케이션으로 시작합니다.

## Layers

- `app`: provider, router, app bootstrap
- `layouts`: 관리자 콘솔 공통 레이아웃
- `pages`: URL과 직접 매핑되는 화면
- `features`: auth, workloads, detection, runtime decision, transformation, policy lifecycle, audit trace 도메인
- `shared`: HTTP 클라이언트, error normalization, 공통 타입, config, hook, component, mock infrastructure

## Server State

서버 상태는 TanStack Query로 관리합니다. Page는 feature hook을 호출하고, feature API는 `shared/api/httpClient`만 사용합니다.

```text
app -> pages -> features -> shared
```

`shared/api`에는 도메인 API 함수를 두지 않고 HTTP boundary와 error normalization만 둡니다.

## Mocking

Local mock은 MSW가 HTTP layer에서 `/api/**` 요청을 intercept합니다. Production code는 mock/real 분기를 갖지 않고 항상 동일한 HTTP contract를 사용합니다.

## Security And Privacy

- Raw Prompt는 저장하지 않습니다.
- 계좌 원문과 토큰 맵은 저장하지 않습니다.
- 화면에는 BE가 내려준 masking 또는 derived metadata만 표시합니다.
- `policy_action`은 정책 평가 결과, `final_action`은 최종 런타임 집행 결과로 분리합니다.
