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
- API 함수는 mock/real 전환을 함수 내부 또는 adapter 단에서 처리해 화면 컴포넌트에 분기 로직을 만들지 않습니다.
