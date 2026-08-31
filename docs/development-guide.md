# Development Guide

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Build

```bash
npm run build
```

## Test

```bash
npm run test
```

## Lint

```bash
npm run lint
```

## API Mode

Real API:

```dotenv
VITE_API_MODE=real
VITE_API_BASE_URL=http://localhost:8080
```

`npm run dev`는 MSW browser worker를 시작하지 않습니다. BE가 꺼져 있거나 API가 미구현이면 화면은 Error State 또는 `API 연결 대기`를 표시해야 합니다.

MSW fixture는 contract test에서만 사용합니다.

## Implementation Notes

- route-level page는 `src/pages`에 둡니다.
- 재사용 도메인 로직은 `src/features`로 이동합니다.
- BE DTO와 직접 공유되는 타입은 `src/shared/types`에서 시작하고, 도메인별로 커지면 feature 내부로 옮깁니다.
- Page는 feature hook을 호출하고, feature API가 shared HTTP client를 사용합니다.
- 운영 UI는 Mock 숫자, 정책 버전, Trace ID를 자동 생성하지 않습니다.
