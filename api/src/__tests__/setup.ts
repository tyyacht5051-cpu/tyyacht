// 테스트 환경 변수 설정 (모듈 로드 전에 실행됨)
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.ADMIN_PASSWORD = 'TestAdmin123!';
process.env.LOG_PATH = './tmp/test-logs';
process.env.UPLOAD_PATH = './tmp/test-uploads';
process.env.PORT = '4099';
