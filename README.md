# ADP-FE

ADP 관리자 콘솔 프론트엔드입니다. 현재 단계는 Phase 0 foundation으로, Vite + React + TypeScript 기반 SPA 초기 구조와 API 연동 경계만 구성합니다.

## Tech Stack

- Vite
- React
- TypeScript
- React Router
- TanStack Query
- Axios

## 기본 구조

```text
ADP-FE/
├── src/
│   ├── app/          # App composition, router, providers
│   ├── layouts/      # Console shell layouts
│   ├── pages/        # Route-level pages
│   ├── features/     # Domain feature modules
│   ├── shared/       # API, config, styles, shared types/components
│   └── test/         # FE test setup
├── docs              # FE architecture and API integration docs
├── Dockerfile        # CI/NCP 배포용 preview image
├── Dockerfile.dev    # 로컬 개발용 Vite dev server image
├── docker-compose.yml # 로컬 통합 개발 스택
├── Makefile
├── package.json
└── vite.config.ts
```

## 빠른 시작

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Docker 개발 환경

ADP-FE의 `docker-compose.yml`은 로컬 통합 개발 스택의 진입점입니다. FE 레포에서 실행하면 같은 상위 폴더에 있는 `ADP-BE`, `ADP-FE`, `ADP-DA`, `ADP-Docs` 네 레포와 PostgreSQL이 함께 실행됩니다.

```bash
make env
make docker-up
```

## Docker 파일 기준

- `Dockerfile`: CI/NCP 배포용 preview image build
- `Dockerfile.dev`: 로컬 개발용 Vite dev server
- `docker-compose.yml`: BE/FE/DA/Docs/PostgreSQL 통합 개발 스택
- `.env.example`: 팀 공통 로컬 환경변수 샘플

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

## Make 명령

```bash
make env
make docker-up
make docker-logs
make docker-ps
make docker-down
make check
```

## Frontend Policy

- Raw Prompt는 프론트엔드 상태, 로그, 스토리지에 저장하지 않습니다.
- 계좌 원문, 토큰 맵, 민감 필드 원문은 저장하지 않습니다.
- `policy_action`과 `final_action`은 별도 필드로 유지합니다.
- Runtime action은 `ALLOW`, `TRANSFORM`, `REVIEW`, `BLOCK` 중 하나로 제한합니다.
- 브라우저에는 `X-ADP-API-Key`를 노출하지 않습니다. Gateway Lab Execute는 Admin 인증 또는 Local BFF 연결 전까지 비활성화합니다.
- Gateway Lab은 `/v1/runtime/executions` API를 중심으로 연결하고 POST 응답의 `executionId`로 `/trace`를 조회합니다.
- Mock 숫자, 정책 버전, Trace ID를 운영 UI에서 자동 생성하지 않습니다.
- Workload · Data Access 화면은 자유 SQL이 아니라 서버가 정의한 Workload, Retrieval Profile, Data Access Decision API를 표시하는 경계로 둡니다.

## Validation

```bash
npm run lint
npm run test
npm run build
```

자세한 내용은 [docs/architecture.md](docs/architecture.md)와 [docs/api-integration.md](docs/api-integration.md)를 참고합니다.
