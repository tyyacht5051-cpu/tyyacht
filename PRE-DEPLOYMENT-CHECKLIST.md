# 🚀 배포 전 최종 체크리스트

## 📋 보안 설정 확인

### 필수 환경변수 설정
- [ ] `JWT_SECRET` - 강력한 JWT 서명 키 설정
- [ ] `ADMIN_PASSWORD` - 관리자 계정 비밀번호 변경
- [ ] `ALLOWED_ORIGINS` - 실제 도메인으로 변경
- [ ] `NODE_ENV=production` 설정 확인

### 데이터베이스 보안
- [ ] 데이터베이스 파일 권한 설정 (755)
- [ ] 데이터베이스 경로 보안 (`/var/lib/tyyacht/database.db`)
- [ ] 기본 관리자 계정 비밀번호 변경 확인

## 🔧 시스템 설정 확인

### 서버 환경
- [ ] Node.js v18+ 설치 확인
- [ ] PM2 전역 설치 확인
- [ ] 필요한 디렉토리 생성 및 권한 설정
  - [ ] `/var/lib/tyyacht` (755)
  - [ ] `/var/lib/tyyacht/uploads` (755)  
  - [ ] `/var/log/tyyacht` (755)

### 방화벽 설정
- [ ] 포트 3001 개방 (API 서버)
- [ ] 불필요한 포트 차단
- [ ] SSH 포트 보안 설정

## 📁 파일 정리 확인

### 제거된 임시 파일들
- [x] `api/test-jwt.js` - 테스트 파일 삭제
- [x] `api/src/db/database.ts.backup` - 백업 파일 삭제
- [x] `api/src/routes/applications.ts.backup` - 백업 파일 삭제
- [x] `api/dist/` - 빌드 산출물 정리
- [x] `ui/dist/` - 빌드 산출물 정리

### 설정 파일 업데이트
- [x] JWT 시크릿 통일 (모든 라우터 파일)
- [x] 프로덕션 환경변수 기본값 설정
- [x] package.json 스크립트 수정
- [x] ecosystem.config.js 중복 제거

## 🌐 도메인 및 URL 설정

### 프론트엔드 설정
- [ ] `ui/src/config/env.js`의 프로덕션 API URL 확인
- [ ] CORS 허용 도메인과 일치하는지 확인

### SSL 인증서
- [ ] SSL 인증서 설치 및 설정
- [ ] HTTPS 리다이렉트 설정
- [ ] 인증서 자동 갱신 설정

## 🔍 최종 테스트

### 기능 테스트
- [ ] 사용자 회원가입/로그인 테스트
- [ ] 관리자 로그인 테스트 (변경된 비밀번호)
- [ ] 요트교육 신청 기능 테스트
- [ ] 파일 업로드 기능 테스트
- [ ] 커뮤니티 기능 테스트

### 성능 테스트
- [ ] API 응답 시간 확인
- [ ] 데이터베이스 쿼리 성능 확인
- [ ] 파일 업로드 성능 확인

## 📚 배포 절차

1. **서버 준비**
   ```bash
   # 서버 패키지 업데이트
   sudo apt update && sudo apt upgrade -y
   
   # Node.js 18.x 설치
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # PM2 전역 설치
   sudo npm install -g pm2
   ```

2. **프로젝트 배포**
   ```bash
   # 프로젝트 디렉토리 생성
   sudo mkdir -p /var/www/tyyacht
   sudo chown $USER:$USER /var/www/tyyacht
   
   # 파일 업로드 (FTP/SCP 등)
   # 또는 Git clone
   
   # API 서버 설치 및 빌드
   cd /var/www/tyyacht/api
   npm install
   npm run build
   
   # 환경설정 파일 생성
   cp .env.example .env
   # .env 파일 편집하여 실제 값 설정
   
   # 서버 시작
   ./start.sh
   ```

3. **프론트엔드 빌드**
   ```bash
   cd /var/www/tyyacht/ui
   npm install
   npm run build
   
   # 웹서버(Nginx/Apache)에 dist 폴더 배포
   ```

## ⚠️ 주의사항

1. **보안 주의사항**
   - 기본 비밀번호를 절대 그대로 사용하지 말 것
   - JWT_SECRET은 최소 32자 이상의 강력한 키 사용
   - 정기적인 보안 업데이트 필요

2. **백업 설정**
   - 데이터베이스 정기 백업 설정
   - 업로드된 파일 백업 설정
   - 설정 파일 백업

3. **모니터링**
   - PM2 모니터링 설정
   - 로그 확인 및 로테이션 설정
   - 서버 리소스 모니터링

## 📞 문제 발생시 확인사항

1. **서버가 시작되지 않는 경우**
   ```bash
   pm2 logs tyyacht-api
   tail -f /var/log/tyyacht/error.log
   ```

2. **데이터베이스 연결 오류**
   ```bash
   ls -la /var/lib/tyyacht/
   sudo chown -R $USER:$USER /var/lib/tyyacht
   ```

3. **JWT 인증 오류**
   - .env 파일의 JWT_SECRET 설정 확인
   - 모든 라우터에서 동일한 시크릿 사용하는지 확인

---

✅ **모든 항목을 확인한 후 배포를 진행하세요!**