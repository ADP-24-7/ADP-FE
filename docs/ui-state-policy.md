# UI Data State Policy

## 목적

실제 데이터가 준비되지 않은 단계에서 Mock 수치가 운영 데이터처럼 보이는 문제를 방지합니다.

## 상태 구분

| 상태 | UI 표현 | 금지 사항 |
| --- | --- | --- |
| 최초 로딩 | Skeleton | 숫자나 그래프 샘플 삽입 |
| 실제 빈 결과 | `데이터가 없습니다` Empty State | 임의의 0으로 변환 |
| API 미구현 | `API 연결 대기`와 예정 Endpoint | Mock 응답 자동 전환 |
| 연결 실패 | Error State와 재시도 | 빈 결과로 숨기기 |
| 권한 제한 | Blur 또는 `권한 없음` | DOM에 원문 값 포함 |
| 실제 값 0 | 숫자 `0` 표시 | 빈 상태로 처리 |

API가 연결되지 않은 검색, 설정, 실행 control은 활성 입력처럼 노출하지 않고 `disabled`로 표시합니다. 특히 Runtime Execute는 브라우저에 API key를 노출하지 않기 위해 Auth Integration 또는 Local BFF 연결 전까지 비활성화합니다.

## Blur 규칙

Blur는 단지 CSS로 값을 가리는 보안 기능이 아닙니다. 브라우저에 원문이 전달되면 개발자 도구에서 확인할 수 있습니다.

권한 제한 데이터는 BE가 원문을 반환하지 않고 아래처럼 마스킹 상태만 반환해야 합니다.

```json
{
  "displayValue": null,
  "visibility": "RESTRICTED",
  "reasonCode": "INSUFFICIENT_SCOPE"
}
```

FE는 `visibility=RESTRICTED`를 확인한 후 Blur Placeholder나 권한 안내를 렌더링합니다.

## API 응답 원칙

- 목록 API: 결과가 없으면 `items: []`
- 단일 리소스: 없으면 404
- 아직 집계되지 않음: `value: null`과 상태 코드 필드 제공
- 실제 집계값이 0: `value: 0`
- 부분 집계: `completeness` 또는 `partial=true` 제공
- 모든 시간은 ISO-8601 UTC
