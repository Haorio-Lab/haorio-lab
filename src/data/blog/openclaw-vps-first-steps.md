---
author: Haorio
pubDatetime: 2026-04-10T00:10:00Z
title: OpenClaw를 VPS에 올리며 처음 배운 것들
featured: true
draft: false
tags:
  - openclaw
  - vps
  - telegram-bot
  - nas
  - automation
description: 직접 VPS에 OpenClaw를 올리고 Telegram bot과 NAS를 붙이며 배운 실전 메모.
---

기술 블로그의 첫 글은 거창한 선언보다 현실적인 기록이 더 낫다고 생각한다. 그래서 이 글은 OpenClaw를 VPS에 올리고, Telegram bot과 NAS를 붙이며 직접 부딪힌 문제와 배운 점들을 정리한 메모다.

## 설치보다 구조가 더 중요했다

처음에는 서버에 올리고 실행만 되면 끝일 줄 알았다. 그런데 조금만 확장하려고 해도 금방 구조 문제가 드러났다.

예를 들면 이런 질문들이 바로 생겼다.

- 어떤 데이터는 VPS에 두고, 어떤 데이터는 NAS에 둘지
- 여러 Telegram bot을 어떻게 분리할지
- 사람별 memory를 어떻게 나눌지
- 여러 agent를 운영할 때 무엇을 공용으로 둘지

결국 설치 자체보다 중요한 건 구조였다. 특히 나중에 바꾸기 어려운 경로, workspace, storage, bot 분리 방식은 초반에 조금 더 신중하게 보는 편이 맞았다.

## NAS는 저장소로 좋고, 실행은 VPS가 더 안정적이었다

이번 구성에서 빨리 정리된 원칙 중 하나는 이것이었다.

- 실행은 VPS
- 대용량 자료와 아카이브는 NAS

이 방식은 생각보다 깔끔했다. 실제로 agent runtime, systemd 서비스, active workspace 같은 건 VPS에 두는 편이 반응 속도와 단순함 면에서 낫다. 반면 문서, 산출물, 공유 라이브러리, 장기 보관 파일은 NAS 쪽이 훨씬 잘 맞았다.

## Telegram bot을 여러 개 굴릴 때는 충돌부터 의심해야 했다

한 인스턴스에서 이미 Telegram bot을 운영 중인데 다른 bot까지 붙이려다 보면, 설정을 잘못 보는 순간 기존 bot으로 연결되거나 polling conflict가 생긴다.

이번에 실제로 겪은 문제도 비슷했다.

- 새 인스턴스를 만들었는데 기존 bot으로 붙어버림
- `getUpdates` conflict 발생
- 결과적으로 새 bot은 응답이 없는 것처럼 보임

이 상황에서 중요한 건 서비스가 죽었는지만 보는 게 아니라, 실제로 **어느 bot token으로 붙고 있는지 로그를 확인하는 것**이었다.

## 완전 독립보다 현실적인 분리가 더 중요했다

처음엔 새 bot용 인스턴스를 완전히 분리하려고 했다. 그런데 그렇게 하면 provider auth까지 같이 갈라져서 운영이 더 번거로워졌다.

그래서 중간에 방향을 조금 바꿨다.

- 모델 auth는 공유
- bot, port, workspace, service, memory는 분리

이 구조가 지금 단계에서는 가장 현실적이었다. 예쁜 구조보다 실제로 운영 가능한 구조가 더 중요하다는 걸 다시 느꼈다.

## 마무리

OpenClaw를 VPS에 올리는 일 자체는 생각보다 어렵지 않을 수 있다. 하지만 실제로 운영 가능한 구조를 만들려면 결국 설치보다 설계와 운영 방식이 더 중요하다.
