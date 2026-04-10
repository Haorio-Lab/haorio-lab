---
author: Haorio
pubDatetime: 2026-04-10T00:20:00Z
title: Tailscale로 VPS에 안전하게 SSH 붙이기
featured: false
draft: false
tags:
  - tailscale
  - ssh
  - vps
  - remote-access
  - troubleshooting
description: 맥과 윈도우에서 Tailscale을 이용해 VPS에 더 편하고 안전하게 SSH 접속한 과정 정리.
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

## 처음엔 Tailscale IP를 잘못 보고 삽질했다

처음엔 다른 주소로 접속을 시도해서 `Connection refused`가 떴다. 이럴 때는 SSH 데몬이나 방화벽 문제를 의심하게 되는데, 실제로는 아예 잘못된 Tailscale IP를 보고 있었던 거였다.

서버 안에서 다시 확인해보니 실제 Tailscale IP는 다른 값이었다. 결국 이 문제는 다음 두 가지를 다시 확인하면서 정리됐다.

- `tailscale ip -4`
- `ip addr show tailscale0`

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

이렇게 해두면 이후엔 단순히 다음 명령으로 붙으면 된다.

```bash
ssh henryclaw
```

## 마무리

Tailscale로 VPS에 붙는 작업은 단순히 SSH 접속 경로를 바꾸는 일이 아니다. 실제로는 서버 운영 구조를 조금 더 안전하고 일관된 방식으로 정리하는 과정에 가깝다.
