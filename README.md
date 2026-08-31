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
cp .env.example .env.local
npm run dev
```

기본 개발 서버는 `http://localhost:5173`에서 실행됩니다.

## Docker Preview

로컬에서 빌드된 SPA를 계속 띄워 확인할 때는 Docker Compose를 사용합니다.

```bash
docker compose up -d --build
```

미리보기는 `http://localhost:4173`에서 열립니다. 컨테이너는 기본적으로 호스트의 BE를 `http://host.docker.internal:8080`으로 바라봅니다.

## Environment

`.env.example`을 복사해 `.env.local`을 생성합니다.

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | ADP BE API base URL |
| `VITE_API_MODE` | 기본값 `real`; 테스트 fixture 검증 시에만 `mock` 사용 |
| `VITE_APP_ENV` | `local`, `dev`, `staging`, `prod` |

일반 `npm run dev`는 MSW browser worker를 시작하지 않습니다. 로컬 화면은 `/v1` Vite proxy를 통해 실제 BE에 연결됩니다.

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
- Gateway Lab은 `/v1/runtime/executions` API를 중심으로 연결하고 Authorization/Retrieval/Detection/Decision/Transform/Guard/Provider/Audit 흐름을 execution trace stage로 표현합니다.
- Mock 숫자, 정책 버전, Trace ID를 운영 UI에서 자동 생성하지 않습니다.
- Workload · Data Access 화면은 자유 SQL이 아니라 서버가 정의한 Workload, Retrieval Profile, Data Access Decision API를 표시하는 경계로 둡니다.

## Validation

```bash
npm run lint
npm run test
npm run build
```

자세한 내용은 [docs/architecture.md](docs/architecture.md)와 [docs/api-integration.md](docs/api-integration.md)를 참고합니다.
