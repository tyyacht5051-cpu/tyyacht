# 통영요트학교 서버 배포 가이드

## 📋 리눅스 서버 환경 요구사항

### 시스템 요구사항
- **OS**: Ubuntu 20.04 LTS 이상 또는 CentOS 8 이상
- **Node.js**: v18.x 이상
- **메모리**: 최소 1GB (권장 2GB 이상)
- **디스크**: 최소 10GB 여유 공간
- **방화벽**: 포트 3001 개방 (API 서버용)

### 필수 패키지 설치
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y curl git build-essential

# Node.js 18.x 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 전역 설치
sudo npm install -g pm2

# CentOS/RHEL
sudo yum update -y
sudo yum install -y curl git gcc-c++ make

# Node.js 설치 (CentOS)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

## 🚀 배포 단계

### 1. 프로젝트 클론 및 설정
```bash
# 프로젝트 디렉토리로 이동
cd /var/www
sudo mkdir -p tyyacht
sudo chown $USER:$USER tyyacht
cd tyyacht

# 프로젝트 파일 복사 (FTP/SFTP 등으로 업로드)
# 또는 Git 저장소에서 클론
# git clone <your-repository-url> .

# API 디렉토리로 이동
cd api
```

### 2. 환경 설정
```bash
# .env 파일 생성
cp .env.example .env

# 환경 변수 수정 (필수!)
nano .env
```

#### 필수 수정 항목:
```bash
NODE_ENV=production
JWT_SECRET=change-this-to-very-secure-jwt-secret-key-in-production
ADMIN_PASSWORD=change-this-to-secure-admin-password
DATABASE_PATH=/var/lib/tyyacht/database.db
UPLOAD_PATH=/var/lib/tyyacht/uploads
LOG_PATH=/var/log/tyyacht
ALLOWED_ORIGINS=https://tyyacht.com,https://www.tyyacht.com
```

### 3. 의존성 설치 및 빌드
```bash
# npm 패키지 설치
npm install

# TypeScript 컴파일
npm run build
```

### 4. 서버 시작
```bash
# 시작 스크립트에 실행 권한 부여
chmod +x start.sh

# 서버 시작
./start.sh
```

## 🔧 수동 설정 (start.sh 사용하지 않는 경우)

### 1. 디렉토리 생성
```bash
# 데이터베이스 디렉토리
sudo mkdir -p /var/lib/tyyacht
sudo chown $USER:$USER /var/lib/tyyacht
sudo chmod 755 /var/lib/tyyacht

# 업로드 디렉토리
sudo mkdir -p /var/lib/tyyacht/uploads
sudo chown $USER:$USER /var/lib/tyyacht/uploads
sudo chmod 755 /var/lib/tyyacht/uploads

# 로그 디렉토리
sudo mkdir -p /var/log/tyyacht
sudo chown $USER:$USER /var/log/tyyacht
sudo chmod 755 /var/log/tyyacht
```

### 2. PM2로 서버 시작
```bash
# PM2 설정 파일 사용
pm2 start ecosystem.config.js --env production

# 또는 직접 실행
pm2 start dist/server.js \
  --name "tyyacht-api" \
  --instances max \
  --exec-mode cluster \
  --env production

# PM2 자동 시작 설정
pm2 save
pm2 startup
```

## 🔒 보안 설정

### 1. 방화벽 설정 (UFW)
```bash
# UFW 설치 및 활성화
sudo ufw enable

# 기본 정책 설정
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 필요한 포트만 개방
sudo ufw allow ssh
sudo ufw allow 3001/tcp  # API 서버
sudo ufw allow 80/tcp    # HTTP (필요시)
sudo ufw allow 443/tcp   # HTTPS (필요시)

# 상태 확인
sudo ufw status
```

### 2. 시스템 사용자 생성 (권장)
```bash
# 전용 사용자 생성
sudo adduser tyyacht --disabled-password --gecos ""

# 필요한 디렉토리 권한 설정
sudo chown -R tyyacht:tyyacht /var/lib/tyyacht
sudo chown -R tyyacht:tyyacht /var/log/tyyacht
sudo chown -R tyyacht:tyyacht /var/www/tyyacht

# 사용자 전환하여 서버 실행
sudo -u tyyacht -H bash -c "cd /var/www/tyyacht/api && ./start.sh"
```

## 📊 모니터링 및 관리

### PM2 명령어
```bash
# 서버 상태 확인
pm2 status

# 로그 확인
pm2 logs tyyacht-api

# 실시간 모니터링
pm2 monit

# 서버 재시작
pm2 restart tyyacht-api

# 서버 중지
pm2 stop tyyacht-api

# 서버 삭제
pm2 delete tyyacht-api
```

### 로그 관리
```bash
# 로그 파일 위치
/var/log/tyyacht/combined.log  # 통합 로그
/var/log/tyyacht/error.log     # 에러 로그
/var/log/tyyacht/out.log       # 출력 로그

# 로그 실시간 확인
tail -f /var/log/tyyacht/combined.log

# 로그 로테이션 설정 (선택사항)
sudo nano /etc/logrotate.d/tyyacht
```

## 🔄 업데이트 및 배포

### 1. 무중단 업데이트
```bash
cd /var/www/tyyacht/api

# 새 코드 배포
git pull origin main  # 또는 파일 업로드

# 의존성 업데이트
npm install

# 빌드
npm run build

# PM2 무중단 재시작
pm2 reload tyyacht-api
```

### 2. 데이터베이스 백업
```bash
# 정기 백업 스크립트 예시
#!/bin/bash
BACKUP_DIR="/var/backups/tyyacht"
DB_PATH="/var/lib/tyyacht/database.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_PATH "$BACKUP_DIR/database_$DATE.db"

# 7일 이상된 백업 파일 삭제
find $BACKUP_DIR -name "database_*.db" -mtime +7 -delete
```

## ❗ 트러블슈팅

### 자주 발생하는 문제들

1. **권한 오류**
   ```bash
   sudo chown -R $USER:$USER /var/lib/tyyacht
   sudo chmod -R 755 /var/lib/tyyacht
   ```

2. **포트 이미 사용 중**
   ```bash
   sudo lsof -i :3001
   sudo kill -9 <PID>
   ```

3. **메모리 부족**
   ```bash
   # PM2 메모리 제한 설정
   pm2 start ecosystem.config.js --max-memory-restart 500M
   ```

4. **데이터베이스 락**
   ```bash
   # SQLite 락 해제
   sudo pkill -f "database.db"
   ```

## 📞 지원

문제 발생 시 로그를 확인하고 다음 정보를 포함하여 문의하세요:
- 서버 OS 및 버전
- Node.js 버전
- 에러 메시지
- 관련 로그 내용

```bash
# 시스템 정보 수집
uname -a
node --version
npm --version
pm2 --version
pm2 status
tail -n 50 /var/log/tyyacht/error.log
```