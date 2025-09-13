#!/bin/bash

# 통영요트학교 개발서버 배포 스크립트
# Rocky Linux 8 환경용

echo "=== 통영요트학교 개발서버 배포 시작 ==="

# 변수 설정
PROJECT_DIR="/home/test-tyyacht"
API_DIR="$PROJECT_DIR/api"
UI_DIR="$PROJECT_DIR/ui"
BACKUP_DIR="/var/backups/tyyacht"
DATE=$(date +%Y%m%d_%H%M%S)

# 백업 디렉토리 생성
echo "백업 디렉토리 생성..."
sudo mkdir -p $BACKUP_DIR

# 기존 데이터베이스 백업
echo "데이터베이스 백업 중..."
if [ -f "$API_DIR/database.db" ]; then
    sudo cp "$API_DIR/database.db" "$BACKUP_DIR/database_$DATE.db"
    echo "데이터베이스 백업 완료: $BACKUP_DIR/database_$DATE.db"
fi

# PM2 프로세스 중지 (존재하는 경우)
echo "기존 서버 프로세스 중지 중..."
pm2 stop tyyacht-api 2>/dev/null || echo "기존 프로세스가 없습니다."
pm2 delete tyyacht-api 2>/dev/null || echo "삭제할 프로세스가 없습니다."

# API 서버 빌드 및 설정
echo "API 서버 빌드 중..."
cd $API_DIR

# Node.js 의존성 설치
echo "API 의존성 설치 중..."
npm install

# TypeScript 컴파일
echo "TypeScript 컴파일 중..."
npm run build

# 필요한 디렉토리 생성
echo "필요한 디렉토리 생성 중..."
mkdir -p uploads
mkdir -p logs

# 권한 설정
echo "권한 설정 중..."
chmod 755 uploads
chmod 755 logs

# UI 빌드
echo "UI 빌드 중..."
cd $UI_DIR

# UI 의존성 설치
echo "UI 의존성 설치 중..."
npm install

# Vue.js 빌드
echo "Vue.js 빌드 중..."
npm run build

# Nginx 설정 (UI용)
echo "Nginx 설정 생성 중..."
sudo tee /etc/nginx/conf.d/test-tyyacht.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name test-tyyacht.com;
    
    # UI 정적 파일 서빙
    root /var/www/tyyacht/ui/dist;
    index index.html;
    
    # SPA 라우팅 지원
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 프록시
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Nginx 설정 테스트 및 재시작
echo "Nginx 설정 테스트 중..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx 설정 유효함. Nginx 재시작 중..."
    sudo systemctl reload nginx
else
    echo "Nginx 설정 오류 발생!"
    exit 1
fi

# PM2로 API 서버 시작
echo "API 서버 시작 중..."
cd $API_DIR

# PM2 ecosystem 파일이 있으면 사용, 없으면 직접 시작
if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js --env development
else
    pm2 start dist/index.js \
        --name "tyyacht-api" \
        --instances 1 \
        --env development
fi

# PM2 프로세스 상태 확인
echo "서버 상태 확인 중..."
pm2 status

# PM2 자동 시작 설정
echo "PM2 자동 시작 설정 중..."
pm2 save
pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || echo "PM2 startup 설정은 수동으로 진행해주세요."

# 서비스 상태 확인
echo "=== 배포 완료 ==="
echo "서버 상태:"
echo "- API 서버: http://test-tyyacht.com:3001"
echo "- UI 서버: http://test-tyyacht.com"
echo ""
echo "로그 확인 명령어:"
echo "- API 로그: pm2 logs tyyacht-api"
echo "- Nginx 로그: sudo tail -f /var/log/nginx/error.log"
echo ""
echo "서버 관리 명령어:"
echo "- 서버 재시작: pm2 restart tyyacht-api"
echo "- 서버 중지: pm2 stop tyyacht-api"
echo "- 서버 상태: pm2 status"

echo "=== 배포 스크립트 실행 완료 ==="
