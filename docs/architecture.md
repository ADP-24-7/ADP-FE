# ADP-FE Architecture

## Goal

ADP-FE는 관리자용 SPA입니다. SSR과 SEO 요구가 없으므로 Vite 기반 React 애플리케이션으로 시작합니다.

## Layers

- `app`: provider, router, app bootstrap
- `layouts`: 관리자 콘솔 공통 레이아웃
- `pages`: URL과 직접 매핑되는 화면
- `features`: auth, workloads, detection, runtime decision, transformation, policy lifecycle, audit trace 도메인
- `shared`: API 클라이언트, 공통 타입, config, hook, component, mock

## Server State

서버 상태는 TanStack Query로 관리합니다. API 함수는 `shared/api`에 두고, 화면과 feature는 API 구현 방식이 mock인지 real인지 알지 않도록 유지합니다.

## Security And Privacy

- Raw Prompt는 저장하지 않습니다.
- 계좌 원문과 토큰 맵은 저장하지 않습니다.
- 화면에는 BE가 내려준 masking 또는 derived metadata만 표시합니다.
- `policy_action`은 정책 평가 결과, `final_action`은 최종 런타임 집행 결과로 분리합니다.
