---
author: Haorio
pubDatetime: 2026-04-14T07:57:00Z
title: 웹쉘 공격의 매커니즘과 대응방안
featured: true
draft: false
tags:
  - security
  - web
  - server
  - vulnerability
description: 웹쉘이 어떻게 업로드되고 실행되는지, 그리고 서버를 보호하기 위한 실질적인 대응 방안을 정리한다.
---

웹쉘 공격은 웹 서버를 장악하는 가장 흔한 방법 중 하나다. 방어자 입장에서 중요한 건 공격 패턴을 이해하고, 실질적인 탐지·차단 체계를 만드는 것이다.

## 웹쉘이란 무엇인가

웹쉘은 웹 서버에 업로드된 셸 스크립트다. 공격자가 서버 명령을 원격에서 실행할 수 있게 해주며, 대부분의 경우 PHP, JSP, ASP 같은 동적 페이지 확장자에 숨겨진다.

```php
<?php system($_GET['cmd']); ?>
```

이 한 줄이 전형적인 PHP 웹쉘의 핵심이다. URL 파라미터로 명령을 받아 `system()`으로 실행한다. 겉보기엔 단순하지만, 이게 서버 전체를 잠식하는 시작점이 된다.

## 공격 매커니즘

### 1. 파일 업로드 취약점

가장 흔한 진입로다. 이미지 업로드, 문서 첨부, 프로필 사진 같은 기능에 웹쉘을 몰래 넣는 방식.

```
정상 요청:  POST /upload/avatar.jpg
공격 요청:  POST /upload/shell.php
```

防护되지 않은 업로드 기능은 확장자 검증, MIME 타입 체크, 파일 내용 스캔 없이 파일을 저장한다. 공격자는 `.php.jpg`처럼 이중 확장자나 파일 매직넘버를 조작해서 우회한다.

### 2. Inclusion 취약점을 통한 주입

`include`, `require`, `include_once` 같은 함수에 외부 입력이 그대로 전달되면, 공격자는 로그 파일이나 세션 파일에 웹쉘 코드를 삽입하고それをインクルードさせることで実行시킬 수 있다.

```php
// 취약한 코드
include($_GET['page'] . '.php');
```

```txt
# 공격자가 로그에 주입
<?php system($_GET['cmd']); ?>
```

```url
https://target.com/index.php?page=../../../../var/log/apache2/access.log%00
```

### 3. RDS(Remote Code Execution)

명시적인 코드 실행 취약점이 있으면, 공격자는 웹쉘을 업로드할 필요도 없다. 셸 명령을 직접 내려 웹쉘을 생성하고 그 안에서 추가 명령을 실행한다.

```bash
# 대상 서버에서 실행된 공격 명령 예시
echo '<?php system($_GET["cmd"]); ?>' > /var/www/html/shell.php
```

## 웹쉘이 확보한 후

웹쉘이 실행되면 공격자는 다음 단계로 나아간다:

| 단계 | 활동 | 위험도 |
|------|------|--------|
| 정찰 | 서버 정보 수집, 네트워크 스캔 | 낮음 |
| 권한 확대 | SetUID, sudo 취약점 활용 | 중간 |
| 지속성 확보 | 크론잡, 백도어 설치 | 높음 |
| 데이터 탈취 | DB 접속, 파일 압축 후 외부 전송 | 높음 |
| lateral movement | 내부 네트워크 다른 서버 침투 | 높음 |

## 대응방안

### 파일 업로드 방어

1. **확장자 화이트리스트** — 허용 목록之外는 모두 차단
2. **MIME 타입 검증** — `Content-Type`이 아닌 실제 파일 매직넘버 체크
3. **파일 이름 재작성** — 업로드 시 원본 이름 대신 UUID나 해시 기반 이름 사용
4. **업로드 디렉토리 격리** — `web root` 밖에 저장, 실행 권한 제거
5. **콘텐츠 디스어셈블리** — 이미지 업로드는 `imageflip`, `imagick` 등으로 실제 이미지 형태로 재인코딩

```php
// PHP 예시: 안전하게 이미지 처리 후 저장
$img = new Imagick($_FILES['upload']['tmp_name']);
$img->setImageFormat('png');
$img->writeImage('/var/uploads/' . $safe_filename . '.png');
```

### WAF(Web Application Firewall)

서드파티 WAF나 ModSecurity를 뒬면Known 웹쉘 시그니처를 탐지하고 차단할 수 있다. 하지만 난독화된 웹쉘은 시그니처 기반 탐지를 피할 수 있으므로, **행위 기반 탐지**(비정상적 URI 패턴,罕见한 파라미터 조합)를 함께 쓰는 게 효과적이다.

### 파일 시스템 모니터링

```bash
# inotifywait로 /var/www/html 아래 파일 변경 감시
inotifywait -m -r -e CREATE,MODIFY,DELETE /var/www/html/
```

생성·수정된 파일을 실시간으로 감시하면 업로드 직후 탐지할 수 있다. 로그를 centralised logging 시스템으로 보내면 복구 분석에도 유용하다.

### 네트워크 레벨 탐지

- 비정상적인 outbound 연결 (웹쉘이 C2 서버에 콜백하는 트래픽)
- 자주使う 않는 HTTP 메서드 (PUT, DELETE, TRACE)
-|long URI 요청이나罕见한 인코딩

### 권한 최소화

- 웹 서버 프로세스를 `www-data` 같은 저권한 사용자로만 실행
- `open_basedir`로 접근 가능한 디렉토리 제한
- PHP의 `disable_functions`로 위험한 함수 차단

```ini
# php.ini
open_basedir = /var/www/html:/var/uploads:/tmp
disable_functions = system,exec,shell_exec,passthru,proc_open,popen
```

## 실전 체크리스트

- [ ] 파일 업로드 기능에 확장자/MIME 검증이 있는가
- [ ] 업로드 디렉토리가 웹 루트 밖에 있는가
- [ ] 업로드 파일에 실행 권한이 없는가
- [ ] WAF 또는 시그니처 탐지 솔루션이 있는가
- [ ] 파일 시스템 감시( inotify, tripwire 등)가 설정되어 있는가
- [ ] 이상 아웃바운드 트래픽을 탐지하는 네트워크 모니터링이 있는가
- [ ] PHP 설정에서 `disable_functions`가 적절히 설정되어 있는가

## 마무리

웹쉘 공격은 고전적이지만 여전히 효과적이다. 가장 좋은 방어는 단일 지점에 의존하지 않는 **방어 인 체**다. 업로드 검증, 실행 격리, 탐지 시스템, 네트워크 모니터링을 레이어로 겹치면 공격자가 한계를 넘어서기 전에 포착할 수 있다.
