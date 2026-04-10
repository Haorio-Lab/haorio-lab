# Cloudflare Preview Setup for Draft Posts

## 목표

- Production 배포에서는 `draft: true` 글 숨김
- Preview 배포에서는 `draft: true` 글 표시

---

## 필요한 설정

Cloudflare Pages 프로젝트의 **Preview** 환경 변수에 아래 값 추가:

- Key: `PUBLIC_INCLUDE_DRAFTS`
- Value: `true`

Production 환경에는 이 값을 추가하지 않거나, 비워둔다.

---

## 설정 위치

1. Cloudflare Dashboard
2. Workers & Pages
3. `haorio-lab` 프로젝트 클릭
4. Settings
5. Variables and Secrets
6. Environment Variables
7. **Preview** 환경에만 아래 추가

```text
PUBLIC_INCLUDE_DRAFTS = true
```

---

## 동작 방식

### Production
- `PUBLIC_INCLUDE_DRAFTS` 없음
- `draft: true` 글은 목록/개별 페이지에서 숨김

### Preview
- `PUBLIC_INCLUDE_DRAFTS=true`
- `draft: true` 글도 목록/개별 페이지에 표시
- Blog 페이지 상단에 `Preview mode` 문구 표시

---

## 검토 플로우

1. 새 글 작성 시 `draft: true`
2. git push
3. Cloudflare Preview deployment 생성
4. Preview URL에서 초안 확인
5. 승인되면 `draft: false` 로 수정
6. 다시 push
7. Production 공개
