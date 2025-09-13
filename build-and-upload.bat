@echo off
echo === Windows 환경에서 빌드 및 서버 업로드 스크립트 ===
echo.

:: 변수 설정
set SERVER_IP=test-tyyacht.com
set SERVER_USER=root
set PROJECT_PATH=/var/www/tyyacht

echo API 서버 빌드 중...
cd /d "%~dp0api"
call npm install
call npm run build
if errorlevel 1 (
    echo API 빌드 실패!
    pause
    exit /b 1
)

echo.
echo UI 빌드 중...
cd /d "%~dp0ui"
call npm install
call npm run build
if errorlevel 1 (
    echo UI 빌드 실패!
    pause
    exit /b 1
)

echo.
echo === 빌드 완료 ===
echo.
echo 다음 단계를 수행하세요:
echo 1. MobaXterm 또는 SCP 클라이언트를 사용하여 전체 프로젝트 폴더를 서버에 업로드
echo 2. 서버에서 다음 명령어 실행:
echo    chmod +x /var/www/tyyacht/deploy-to-test-server.sh
echo    cd /var/www/tyyacht
echo    ./deploy-to-test-server.sh
echo.
echo === 업로드할 경로 ===
echo 로컬: %~dp0
echo 서버: %SERVER_IP%:%PROJECT_PATH%
echo.
echo === 서버 접속 정보 ===
echo 서버 주소: %SERVER_IP%
echo 사용자: %SERVER_USER%
echo 프로젝트 경로: %PROJECT_PATH%
echo.
echo === 확인할 URL ===
echo API 서버: http://%SERVER_IP%:3001
echo UI 서버: http://%SERVER_IP%
echo.

pause