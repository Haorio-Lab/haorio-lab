---
author: Haorio
pubDatetime: 2026-04-10T00:30:00Z
title: Telegram bot을 분리 운영하면서 겪은 충돌과 해결
featured: false
draft: false
tags:
  - telegram
  - bot
  - openclaw
  - multi-instance
  - troubleshooting
description: 기존 bot과 새 bot을 분리 운영하는 과정에서 생긴 conflict, pairing, auth 문제를 정리한 기록.
---

Telegram bot을 하나만 운영할 때는 설정이 단순하다. 하지만 기존 bot이 이미 돌고 있는 상태에서 새 bot을 별도 용도로 추가하려고 하면, 생각보다 금방 충돌과 구조 문제가 튀어나온다.

이번에는 기존 bot을 유지한 채 새로운 bot을 별도 인스턴스로 붙이려 했고, 그 과정에서 겪은 문제들을 꽤 현실적으로 정리할 수 있었다.

## 처음엔 bot이 죽은 줄 알았다

새 bot을 설정한 뒤 `/start`를 보내봤는데 아무 반응이 없었다. 이런 상황에서는 보통 “서비스가 안 떴나?”부터 의심하게 된다.

하지만 실제로 확인해보면 gateway 프로세스는 이미 살아 있었고, 포트도 listen 중이었다.

즉 문제는 서비스가 죽은 게 아니라, **Telegram 쪽 연결이나 설정 분리**가 잘못된 상태였다.

## 핵심 문제는 기존 bot으로 잘못 붙는 것이었다

로그를 확인해보니 새 인스턴스가 떠 있긴 한데, 실제로는 새 bot이 아니라 기존 bot으로 붙고 있었다.

이 상황에서 나타난 증상은 명확했다.

- 기존 bot 이름이 로그에 뜸
- `getUpdates conflict` 발생
- 새 bot은 응답 없는 것처럼 보임

## 완전 분리는 예뻤지만 실전에서는 불편했다

처음엔 새 인스턴스를 완전히 분리하려고 했다. 하지만 실제로는 provider auth까지 같이 갈라져서 운영이 더 번거로워졌다.

그래서 중간에 방향을 수정했다.

- 모델 auth는 공유
- Telegram token, workspace, port, service는 분리

## 마무리

Telegram bot을 여러 개 운영하는 작업은 단순히 token 하나 더 넣는 수준이 아니다. 실제로는 설정, 인증, 메모리, 서비스, access approval이 함께 얽힌 구조 문제에 가깝다.

처음부터 완벽한 독립만 고집하는 것보다, 실제로 잘 돌아가는 구조를 먼저 만드는 편이 훨씬 생산적이었다.
