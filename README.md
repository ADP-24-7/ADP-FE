# ADP-FE

ADP 관리자 콘솔 프론트엔드입니다. 현재 단계는 Phase 0 foundation으로, Vite + React + TypeScript 기반 SPA 초기 구조와 API 연동 경계만 구성합니다.

## Tech Stack

- Vite
- React
- TypeScript
- React Router
- TanStack Query
- Axios

## Getting Started

```bash
npm install
npm run dev
```

기본 개발 서버는 `http://localhost:5173`에서 실행됩니다.

## Environment

`.env.example`을 복사해 `.env.local`을 생성합니다.

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | ADP BE API base URL |
| `VITE_API_MODE` | `mock` 또는 `real` |
| `VITE_APP_ENV` | `local`, `dev`, `staging`, `prod` |

## Project Structure

```text
src/
  app/                 # App composition, router, providers
  layouts/             # Console shell layouts
  pages/               # Route-level pages
  features/            # Domain feature modules
  shared/              # API, config, styles, shared types/components
```

## Frontend Policy

- Raw Prompt는 프론트엔드 상태, 로그, 스토리지에 저장하지 않습니다.
- 계좌 원문, 토큰 맵, 민감 필드 원문은 저장하지 않습니다.
- `policy_action`과 `final_action`은 별도 필드로 유지합니다.
- Runtime action은 `ALLOW`, `TRANSFORM`, `REVIEW`, `BLOCK` 중 하나로 제한합니다.

자세한 내용은 [docs/architecture.md](docs/architecture.md)와 [docs/api-integration.md](docs/api-integration.md)를 참고합니다.
