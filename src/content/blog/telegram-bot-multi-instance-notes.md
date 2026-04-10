---
title: 'Telegram bot을 분리 운영하면서 겪은 충돌과 해결'
description: '기존 bot과 새 bot을 분리 운영하는 과정에서 생긴 conflict, pairing, auth 문제를 정리한 기록.'
pubDate: '2026-04-10'
heroImage: '/images/telegram-bot-multi-instance-notes.jpg'
category: 'AI / Automation'
tags:
  - telegram
  - bot
  - openclaw
  - multi-instance
  - troubleshooting
draft: false
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

즉 프로세스는 살아 있지만, 전화선을 잘못 꽂아둔 상태라고 보는 게 더 정확했다.

## 완전 분리는 예뻤지만 실전에서는 불편했다

처음엔 새 인스턴스를 완전히 분리하려고 했다. config home도 따로 두고, workspace도 나누고, 서비스도 따로 두는 방향이었다.

이 자체는 맞는 생각이었지만, 실제로는 provider auth까지 같이 갈라져서 번거로워졌다. Telegram bot은 분리됐는데 모델 인증이 비어버리니, 결국 봇이 메시지를 받아도 답을 못 하는 상황이 생긴다.

그래서 중간에 방향을 수정했다.

- 모델 auth는 공유
- Telegram token, workspace, port, service는 분리

이렇게 하니 훨씬 현실적이었다.

## profile 기반 분리가 더 잘 맞았다

처음에는 환경변수로 config home을 억지로 분리하려고 했는데, 실제 동작을 보면 OpenClaw의 profile 개념을 쓰는 쪽이 더 명확했다.

즉 이런 구조다.

- 메인 인스턴스는 기본 profile
- 새 bot 인스턴스는 `--profile jwclaw`

이 방식으로 가니 적어도 어떤 설정 파일을 읽는지 기준이 명확해졌다. 서비스 파일도 profile 기반으로 맞추는 편이 낫다.

## pairing과 access approval도 별도 인스턴스 기준으로 처리해야 했다

또 하나 걸렸던 부분은 pairing approve였다.

봇이 실제로는 pairing code를 보내주고 있었는데, 승인 명령을 기본 인스턴스에서 쳐버리면 `No pending pairing request found`가 뜬다. 이유는 간단하다. pending request는 새 bot 인스턴스 쪽에 있는데, CLI는 메인 인스턴스를 보고 있었기 때문이다.

이런 상황에서는 같은 명령이라도 **정확히 어떤 profile을 보고 치는지**가 중요해진다.

## 마무리

Telegram bot을 여러 개 운영하는 작업은 단순히 bot token 하나 더 넣는 수준이 아니다. 실제로는 설정, 인증, 메모리, 서비스, access approval이 모두 함께 얽힌 구조 문제에 가깝다.

이번에 정리된 핵심은 이거였다.

- 봇은 분리
- 운영 구조도 분리
- 하지만 auth는 필요에 따라 현실적으로 공유

처음부터 완벽한 독립만 고집하는 것보다, 실제로 잘 돌아가는 구조를 먼저 만드는 편이 훨씬 생산적이었다.
