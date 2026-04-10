---
title: 'Tailscale로 VPS에 안전하게 SSH 붙이기'
description: '맥과 윈도우에서 Tailscale을 이용해 VPS에 더 편하고 안전하게 SSH 접속한 과정 정리.'
pubDate: '2026-04-10'
heroImage: '/images/openclaw-vps-first-steps.jpg'
category: 'Server / VPS'
tags:
  - tailscale
  - ssh
  - vps
  - remote-access
  - troubleshooting
draft: true
---

VPS를 운영하다 보면 결국 가장 자주 하게 되는 일 중 하나가 SSH 접속이다. 문제는 이 작업이 자주 반복될수록, 그냥 public IP로 붙는 방식이 점점 불편하고 불안하게 느껴진다는 점이다.

이번에 내 환경에서는 Tailscale을 이용해서 VPS에 붙는 방식을 정리했다. 결론부터 말하면, 설정만 잘 해두면 훨씬 편하고 마음도 편하다.

## 왜 Tailscale로 붙으려고 했나

기존에도 public IP로 접속은 가능했다. 하지만 매번 직접 IP를 기억하거나, 외부에서 root SSH를 그대로 노출한 상태로 쓰는 건 장기적으로 좋은 방식이 아니다.

Tailscale을 붙이면 이런 장점이 있다.

- 서버를 tailnet 내부 IP로 접근 가능
- SSH 접속 대상이 명확해짐
- 로컬 개발기기에서 config alias로 접속하기 쉬움
- 추후 node, NAS, 다른 장치까지 같은 방식으로 묶기 좋음

즉 단순히 “접속된다”보다 “계속 쓰기 편한 구조”를 만드는 데 의미가 있다.

## 처음엔 Tailscale IP를 잘못 보고 삽질했다

재밌게도 문제는 SSH가 아니라 IP부터였다.

처음엔 다른 주소로 접속을 시도해서 `Connection refused`가 떴다. 이때는 보통 SSH 데몬이 죽었거나 방화벽 문제를 의심하게 되는데, 실제로는 아예 잘못된 Tailscale IP를 보고 있었던 거였다.

서버 안에서 다시 확인해보니 실제 Tailscale IP는 다른 값이었다. 결국 이 문제는 다음 두 가지를 다시 확인하면서 정리됐다.

- `tailscale ip -4`
- `ip addr show tailscale0`

결국 길은 있었는데 주소를 잘못 보고 있었던 셈이다.

## refused가 뜬다고 무조건 sshd 문제는 아니었다

한 번은 맥북에서 접속하려다 `Connection refused`를 봤다. 이럴 때 보통 바로 “SSH 서버가 안 떠 있나?”라고 생각하게 된다.

하지만 실제로 서버에서 보면 SSH 서비스는 이미 살아 있었다.

- `systemctl status ssh`
- `ss -ltnp | grep ':22'`

즉 이 경우엔 서비스가 죽은 게 아니라, 접속하려는 대상이 틀렸거나 경로를 잘못 봤을 가능성을 먼저 보는 게 맞았다.

이런 식으로 증상과 원인이 어긋나는 경우가 많다.

## 접속 alias를 만들어두니 삶이 편해졌다

정상 IP를 확인한 뒤에는 클라이언트 쪽 `~/.ssh/config`에 alias를 만들어두는 게 훨씬 편했다.

예를 들면 이런 식이다.

```sshconfig
Host henryclaw
    HostName 100.xx.xx.xx
    User root
    Port 22
    LocalForward 18789 127.0.0.1:18789
```

이렇게 해두면 이후엔 단순히:

```bash
ssh henryclaw
```

만 치면 된다.

그리고 OpenClaw 대시보드까지 같이 포워딩해두면:

- SSH 접속
- 로컬 브라우저에서 대시보드 확인

이 흐름이 꽤 부드럽다.

## 윈도우와 맥 모두 같은 구조로 갈 수 있었다

환경이 달라도 큰 원칙은 같다.

- Tailscale 설치
- 같은 tailnet 로그인
- 서버 Tailscale IP 확인
- SSH config 또는 WinSCP/SCP 세팅

즉 장치마다 방법이 완전히 달라지는 게 아니라, 같은 개념을 다른 도구로 푸는 정도다. 이런 구조는 나중에 운영하면서도 덜 헷갈린다.

## 마무리

Tailscale로 VPS에 붙는 작업은 단순히 SSH 접속 경로를 바꾸는 일이 아니다. 실제로는 서버 운영 구조를 조금 더 안전하고 일관된 방식으로 정리하는 과정에 가깝다.

특히 여러 장치에서 접속할 일이 많거나, 나중에 NAS나 다른 노드까지 함께 묶을 생각이라면 초반에 이 구조를 잡아두는 게 꽤 도움이 된다.
