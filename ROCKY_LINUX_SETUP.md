# Rocky Linux 8 서버 설정 가이드

## 1. 기본 시스템 업데이트

```bash
# 시스템 패키지 업데이트
sudo dnf update -y

# 필수 패키지 설치
sudo dnf install -y curl wget git vim nano
sudo dnf groupinstall -y "Development Tools"
```

## 2. Node.js 18.x 설치

```bash
# NodeSource 저장소 추가
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Node.js 설치
sudo dnf install -y nodejs

# 버전 확인
node --version
npm --version
```

## 3. PM2 글로벌 설치

```bash
sudo npm install -g pm2

# PM2 버전 확인
pm2 --version
```

## 4. Nginx 설치 및 설정

```bash
# Nginx 설치
sudo dnf install -y nginx

# Nginx 서비스 활성화 및 시작
sudo systemctl enable nginx
sudo systemctl start nginx

# 서비스 상태 확인
sudo systemctl status nginx
```

## 5. 방화벽 설정

```bash
# 방화벽 활성화
sudo systemctl enable firewalld
sudo systemctl start firewalld

# HTTP/HTTPS 포트 개방
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# API 서버 포트 개방 (3001)
sudo firewall-cmd --permanent --add-port=3001/tcp

# 방화벽 규칙 적용
sudo firewall-cmd --reload

# 방화벽 상태 확인
sudo firewall-cmd --list-all
```

## 6. 프로젝트 디렉토리 설정

```bash
# 웹 서버 루트 디렉토리 생성
sudo mkdir -p /var/www/tyyacht
sudo chown -R $USER:$USER /var/www/tyyacht
sudo chmod -R 755 /var/www/tyyacht

# 백업 디렉토리 생성
sudo mkdir -p /var/backups/tyyacht
sudo chown -R $USER:$USER /var/backups/tyyacht
sudo chmod -R 755 /var/backups/tyyacht
```

## 7. SELinux 설정 (필요시)

```bash
# SELinux 상태 확인
sudo getenforce

# 웹 서버용 SELinux 컨텍스트 설정
sudo setsebool -P httpd_can_network_connect 1
sudo chcon -R -t httpd_exec_t /var/www/tyyacht
```

## 8. 프로젝트 파일 업로드

### 방법 1: SCP 사용 (Windows에서)
```bash
# PowerShell 또는 Command Prompt에서
scp -r "C:\Users\Jy\Desktop\통영요트학교\홈페이지\tyyacht" user@test-tyyacht.com:/var/www/
```

### 방법 2: FTP/SFTP 클라이언트 사용
- FileZilla, WinSCP 등을 사용하여 전체 프로젝트 폴더를 `/var/www/tyyacht/`로 업로드

## 9. 배포 스크립트 실행

```bash
# 프로젝트 디렉토리로 이동
cd /var/www/tyyacht

# 스크립트에 실행 권한 부여
chmod +x deploy-to-test-server.sh

# 배포 스크립트 실행
./deploy-to-test-server.sh
```

## 10. 도메인 설정

### DNS 설정
- `test-tyyacht.com`이 서버 IP를 가리키도록 DNS 설정

### 로컬 테스트용 hosts 파일 수정 (Windows 개발 환경)
```
# Windows: C:\Windows\System32\drivers\etc\hosts 파일에 추가
[서버IP] test-tyyacht.com
```

## 11. SSL 인증서 설정 (선택사항)

```bash
# Let's Encrypt 설치
sudo dnf install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d test-tyyacht.com

# 자동 갱신 설정
sudo systemctl enable certbot-renew.timer
```

## 12. 모니터링 및 로그

### PM2 모니터링
```bash
# 프로세스 상태 확인
pm2 status

# 실시간 모니터링
pm2 monit

# 로그 확인
pm2 logs tyyacht-api
```

### 시스템 로그
```bash
# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 시스템 로그
journalctl -u nginx -f
```

## 13. 백업 및 유지보수

### 자동 백업 스크립트
```bash
# 크론탭 설정
crontab -e

# 매일 새벽 2시에 데이터베이스 백업
0 2 * * * /var/www/tyyacht/backup-database.sh
```

### 백업 스크립트 생성
```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="/var/backups/tyyacht"
API_DIR="/var/www/tyyacht/api"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp "$API_DIR/database.db" "$BACKUP_DIR/database_$DATE.db"

# 7일 이상된 백업 파일 삭제
find $BACKUP_DIR -name "database_*.db" -mtime +7 -delete
```

## 트러블슈팅

### 일반적인 문제들

1. **포트 접근 불가**
   ```bash
   sudo firewall-cmd --add-port=3001/tcp --permanent
   sudo firewall-cmd --reload
   ```

2. **권한 문제**
   ```bash
   sudo chown -R $USER:$USER /var/www/tyyacht
   sudo chmod -R 755 /var/www/tyyacht
   ```

3. **Nginx 설정 오류**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **PM2 프로세스 재시작**
   ```bash
   pm2 restart tyyacht-api
   pm2 save
   ```

### 로그 확인
```bash
# API 서버 로그
pm2 logs tyyacht-api

# Nginx 로그
sudo tail -f /var/log/nginx/error.log

# 시스템 로그
journalctl -xe
```

## 성능 최적화

### Nginx 최적화
```bash
# /etc/nginx/nginx.conf에서 worker_processes 수정
worker_processes auto;

# gzip 압축 활성화
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### PM2 클러스터 모드
```bash
pm2 start ecosystem.config.js --env production
```

이 가이드를 따라하면 Rocky Linux 8 환경에서 통영요트학교 홈페이지를 성공적으로 배포할 수 있습니다.