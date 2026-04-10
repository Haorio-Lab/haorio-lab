# Haorio Lab Editorial Workflow

## 목표

앞으로 포스팅은 기본적으로 **draft 먼저 작성**하고,
사용자가 실제 블로그 화면에서 확인한 뒤 공개로 전환한다.

---

## 기본 원칙

- 새 글은 기본값을 `draft: true` 로 둔다.
- 공개 블로그에는 `draft: false` 인 글만 노출한다.
- 사용자는 **Cloudflare Preview 배포 주소**에서 초안을 확인한다.
- 확인이 끝난 뒤 `draft: false` 로 바꾸고 push 하면 공개된다.

---

## 작성 플로우

1. HaorioClaw가 새 글 초안 작성
2. frontmatter에 `draft: true` 설정
3. git commit / git push
4. Cloudflare Preview deployment 생성
5. 사용자가 Preview URL에서 실제 블로그 형태로 검토
6. 수정 필요 시 HaorioClaw가 반영
7. 최종 승인 후 `draft: false` 변경
8. git push
9. 공개 사이트 반영

---

## frontmatter 예시

```yaml
---
title: '예시 제목'
description: '예시 설명'
pubDate: '2026-04-10'
heroImage: '/images/example.jpg'
category: 'AI / Automation'
tags:
  - example
  - notes
draft: true
---
```

공개 전환 시:

```yaml
draft: false
```

---

## 확인 포인트

초안 검토 시 아래를 본다.

- 제목이 너무 길지 않은지
- 첫 문단이 자연스러운지
- 이미지가 깨지지 않는지
- 모바일/PC 둘 다 읽기 괜찮은지
- 기술적으로 어색한 표현이 없는지
- 너무 개인적인 정보가 들어가지 않았는지

---

## 운영 팁

- 새 글은 처음부터 공개하지 않는다.
- 한 번에 여러 draft를 쌓아도 된다.
- 공개 시점만 `draft: false` 로 바꾸면 된다.
- 필요하면 나중에 `/drafts` 같은 내부 검토 페이지를 추가할 수 있다.
