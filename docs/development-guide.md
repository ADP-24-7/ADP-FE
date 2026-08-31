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

Mock API:

```dotenv
VITE_API_MODE=mock
```

Real API:

```dotenv
VITE_API_MODE=real
VITE_API_BASE_URL=http://localhost:8080
```

## Implementation Notes

- route-level page는 `src/pages`에 둡니다.
- 재사용 도메인 로직은 `src/features`로 이동합니다.
- BE DTO와 직접 공유되는 타입은 `src/shared/types`에서 시작하고, 도메인별로 커지면 feature 내부로 옮깁니다.
- Page는 feature hook을 호출하고, feature API가 shared HTTP client를 사용합니다.
- Mock은 MSW handler에서 HTTP contract 기준으로 관리합니다.
