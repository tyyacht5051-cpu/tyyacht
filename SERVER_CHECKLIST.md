# 통영요트학교 개발서버 배포 체크리스트

## 🚀 배포 전 준비사항

### Windows 개발환경에서 할 일

- [ ] **빌드 스크립트 실행**
  ```cmd
  build-and-upload.bat
  ```

- [ ] **빌드 결과 확인**
  - [ ] `api/dist/` 폴더가 생성되었는지 확인
  - [ ] `ui/dist/` 폴더가 생성되었는지 확인
  - [ ] 빌드 과정에서 오류가 없었는지 확인

### 서버 환경 설정 확인

- [ ] **Rocky Linux 8 기본 설정**
  - [ ] Node.js 18.x 설치 확인
  - [ ] PM2 설치 확인  
  - [ ] Nginx 설치 확인
  - [ ] 방화벽 포트 개방 (80, 443, 3001)

## 📁 파일 업로드

### MobaXterm 사용 (권장)

1. **MobaXterm 연결**
   - 서버: `test-tyyacht.com`
   - 사용자: `root` (또는 설정된 사용자)
   - 포트: `22`

2. **파일 업로드**
   - 로컬 경로: `C:\Users\Jy\Desktop\통영요트학교\홈페이지\tyyacht\`
   - 서버 경로: `/var/www/tyyacht/`
   - 전체 프로젝트 폴더를 드래그 앤 드롭

3. **권한 설정**
   ```bash
   sudo chown -R $USER:$USER /var/www/tyyacht
   sudo chmod -R 755 /var/www/tyyacht
   ```

## 🔧 서버에서 실행할 명령어

### 1. 배포 디렉토리 이동
```bash
cd /var/www/tyyacht
```

### 2. 배포 스크립트 실행 권한 부여
```bash
chmod +x deploy-to-test-server.sh
chmod +x ROCKY_LINUX_SETUP.md
```

### 3. Rocky Linux 환경 설정 (최초 1회)
```bash
# ROCKY_LINUX_SETUP.md 파일의 1-7단계 순서대로 실행
```

### 4. 배포 스크립트 실행
```bash
./deploy-to-test-server.sh
```

## ✅ 배포 완료 후 확인사항

### 서비스 상태 확인

- [ ] **PM2 프로세스 상태**
  ```bash
  pm2 status
  ```
  - `tyyacht-api`가 `online` 상태인지 확인

- [ ] **Nginx 상태**
  ```bash
  sudo systemctl status nginx
  ```
  - `active (running)` 상태인지 확인

- [ ] **포트 리스닝 확인**
  ```bash
  sudo netstat -tlnp | grep 3001
  sudo netstat -tlnp | grep 80
  ```

### 웹사이트 접속 테스트

- [ ] **API 서버 테스트**
  - URL: `http://test-tyyacht.com:3001`
  - 응답이 정상적으로 오는지 확인

- [ ] **UI 서버 테스트**
  - URL: `http://test-tyyacht.com`
  - 홈페이지가 정상적으로 로드되는지 확인

- [ ] **API 연동 테스트**
  - 브라우저 개발자도구에서 네트워크 탭 확인
  - API 호출이 `http://test-tyyacht.com:3001`로 가는지 확인
  - CORS 오류가 없는지 확인

### 기능별 테스트

- [ ] **홈페이지 로딩**
- [ ] **관리자 페이지 접속**
- [ ] **데이터 저장/불러오기**
- [ ] **파일 업로드 (있다면)**
- [ ] **모바일 반응형 디자인**

## 🔍 트러블슈팅

### API 서버 접속 불가시
```bash
# 로그 확인
pm2 logs tyyacht-api

# 프로세스 재시작
pm2 restart tyyacht-api

# 수동 실행으로 오류 확인
cd /var/www/tyyacht/api
node dist/index.js
```

### UI 페이지 로드 안됨
```bash
# Nginx 로그 확인
sudo tail -f /var/log/nginx/error.log

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

### CORS 오류 발생시
- `/var/www/tyyacht/api/.env` 파일의 `ALLOWED_ORIGINS` 설정 확인
- API 서버 재시작 필요

### 권한 오류
```bash
sudo chown -R $USER:$USER /var/www/tyyacht
sudo chmod -R 755 /var/www/tyyacht
mkdir -p /var/www/tyyacht/api/uploads
mkdir -p /var/www/tyyacht/api/logs
```

## 📊 모니터링

### 실시간 모니터링
```bash
# PM2 실시간 모니터링
pm2 monit

# API 로그 실시간 확인
pm2 logs tyyacht-api --lines 50

# 시스템 리소스 확인
htop
```

### 로그 위치
- API 로그: `/var/www/tyyacht/api/logs/`
- Nginx 로그: `/var/log/nginx/`
- PM2 로그: `~/.pm2/logs/`

## 🎯 배포 성공 기준

✅ **모든 체크리스트 완료시 배포 성공**

1. PM2에서 `tyyacht-api`가 정상 실행
2. `http://test-tyyacht.com`에서 홈페이지 로드
3. `http://test-tyyacht.com:3001`에서 API 응답
4. 브라우저에서 CORS 오류 없음
5. 관리자 기능 정상 동작
6. 모바일에서도 정상 접속

## 📞 지원

문제 발생시 다음 정보와 함께 문의:

```bash
# 시스템 정보 수집
uname -a
node --version
pm2 --version
sudo systemctl status nginx
pm2 status
tail -n 20 /var/www/tyyacht/api/logs/error.log
```

---
**배포 완료 후 이 체크리스트를 저장해두시면 향후 업데이트시 유용합니다.**