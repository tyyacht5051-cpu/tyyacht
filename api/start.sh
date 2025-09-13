#!/bin/bash

# 통영요트학교 API 서버 시작 스크립트
# 리눅스 환경에서 사용

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚢 통영요트학교 API 서버 시작 중...${NC}"

# 환경 변수 검증
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env 파일이 없습니다. .env.example을 참고하여 생성해주세요.${NC}"
    if [ -f ".env.example" ]; then
        echo -e "${BLUE}📋 .env.example을 .env로 복사합니다...${NC}"
        cp .env.example .env
        echo -e "${RED}❗ .env 파일의 설정값들을 실제 환경에 맞게 수정해주세요!${NC}"
        exit 1
    fi
fi

# Node.js 버전 확인
NODE_VERSION=$(node --version 2>/dev/null || echo "not installed")
if [[ $NODE_VERSION == "not installed" ]]; then
    echo -e "${RED}❌ Node.js가 설치되지 않았습니다.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 버전: $NODE_VERSION${NC}"

# 필요한 디렉토리 생성
echo -e "${BLUE}📁 필요한 디렉토리를 생성합니다...${NC}"

# 환경 변수 로드
export $(grep -v '^#' .env | xargs)

# 데이터베이스 디렉토리 생성
if [ ! -z "$DATABASE_PATH" ]; then
    DB_DIR=$(dirname "$DATABASE_PATH")
    if [ ! -d "$DB_DIR" ]; then
        echo -e "${BLUE}📂 데이터베이스 디렉토리 생성: $DB_DIR${NC}"
        sudo mkdir -p "$DB_DIR"
        sudo chown $(whoami):$(whoami) "$DB_DIR"
        sudo chmod 755 "$DB_DIR"
    fi
fi

# 업로드 디렉토리 생성
if [ ! -z "$UPLOAD_PATH" ]; then
    if [ ! -d "$UPLOAD_PATH" ]; then
        echo -e "${BLUE}📂 업로드 디렉토리 생성: $UPLOAD_PATH${NC}"
        sudo mkdir -p "$UPLOAD_PATH"
        sudo chown $(whoami):$(whoami) "$UPLOAD_PATH"
        sudo chmod 755 "$UPLOAD_PATH"
    fi
fi

# 로그 디렉토리 생성
if [ ! -z "$LOG_PATH" ]; then
    if [ ! -d "$LOG_PATH" ]; then
        echo -e "${BLUE}📂 로그 디렉토리 생성: $LOG_PATH${NC}"
        sudo mkdir -p "$LOG_PATH"
        sudo chown $(whoami):$(whoami) "$LOG_PATH"
        sudo chmod 755 "$LOG_PATH"
    fi
fi

# npm 패키지 설치 확인
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 npm 패키지를 설치합니다...${NC}"
    npm install
fi

# TypeScript 컴파일
echo -e "${BLUE}🔨 TypeScript를 컴파일합니다...${NC}"
npm run build

# PM2가 설치되어 있는지 확인
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2가 설치되지 않았습니다. 전역으로 설치합니다...${NC}"
    sudo npm install -g pm2
fi

# PM2로 서버 시작
echo -e "${GREEN}🚀 PM2로 서버를 시작합니다...${NC}"

# 기존 프로세스가 있다면 중지
pm2 delete tyyacht-api 2>/dev/null || true

# PM2 설정 파일이 있는지 확인
if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
else
    # 기본 PM2 시작
    pm2 start dist/server.js --name "tyyacht-api" \
        --instances 2 \
        --exec-mode cluster \
        --env production \
        --log-file "$LOG_PATH/combined.log" \
        --error-file "$LOG_PATH/error.log" \
        --out-file "$LOG_PATH/out.log"
fi

# PM2 저장 및 시작 설정
pm2 save
pm2 startup

echo -e "${GREEN}✅ 서버가 성공적으로 시작되었습니다!${NC}"
echo -e "${BLUE}📊 서버 상태 확인: pm2 status${NC}"
echo -e "${BLUE}📋 로그 확인: pm2 logs tyyacht-api${NC}"
echo -e "${BLUE}🔄 서버 재시작: pm2 restart tyyacht-api${NC}"
echo -e "${BLUE}⏹️  서버 중지: pm2 stop tyyacht-api${NC}"

pm2 status