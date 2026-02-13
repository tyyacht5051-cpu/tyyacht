interface Config {
  NODE_ENV: string;
  PORT: number;
  JWT_SECRET: string;
  DATABASE_PATH: string;
  UPLOAD_PATH: string;
  MAX_FILE_SIZE: number;
  LOG_LEVEL: string;
  LOG_PATH: string;
  BCRYPT_ROUNDS: number;
  ADMIN_PASSWORD: string;
  ALLOWED_ORIGINS: string[];
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

const requiredEnvVars = [
  'JWT_SECRET',
  'ADMIN_PASSWORD'
];

const defaultValues = {
  NODE_ENV: 'development',
  PORT: 4001,
  DATABASE_PATH: './database.db',
  UPLOAD_PATH: './uploads',
  MAX_FILE_SIZE: 10485760, // 10MB
  LOG_LEVEL: 'info',
  LOG_PATH: './logs',
  BCRYPT_ROUNDS: 12,
  ALLOWED_ORIGINS: [
	'http://www.tyyacht.com',
	'http://tyyacht.com',
	'https://www.tyyacht.com',
	'https://tyyacht.com',
	'http://110.10.168.158'
],
  RATE_LIMIT_WINDOW_MS: 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100
};

function validateConfig(): Config {
  const errors: string[] = [];

  // 운영 환경에서 필수 환경변수 체크
  if (process.env.NODE_ENV === 'production') {
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        errors.push(`❌ Required environment variable ${envVar} is not set in production`);
      }
    }

    // 운영 환경에서 기본 비밀번호 체크
    if (process.env.ADMIN_PASSWORD === 'admin123!@#') {
      errors.push('❌ Default admin password must be changed in production');
    }

    if (process.env.JWT_SECRET === 'change-this-to-very-secure-jwt-secret-key-in-production') {
      errors.push('❌ Default JWT secret must be changed in production');
    }
  }

  if (errors.length > 0) {
    console.error('Environment validation failed:');
    errors.forEach(error => console.error(error));
    process.exit(1);
  }

  // 개발 환경에서 기본값 경고
  if (process.env.NODE_ENV !== 'production') {
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ Using default JWT_SECRET in development - please set JWT_SECRET environment variable');
    }
    if (!process.env.ADMIN_PASSWORD) {
      console.warn('⚠️ Using default ADMIN_PASSWORD in development - please set ADMIN_PASSWORD environment variable');
    }
  }

  // ALLOWED_ORIGINS 파싱
  let allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : defaultValues.ALLOWED_ORIGINS;

  // 개발 환경에서 localhost 자동 추가
  if ((process.env.NODE_ENV || defaultValues.NODE_ENV) !== 'production') {
    const localOrigins = ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:4000'];
    allowedOrigins = [...new Set([...allowedOrigins, ...localOrigins])];
  }

  return {
    NODE_ENV: process.env.NODE_ENV || defaultValues.NODE_ENV,
    PORT: parseInt(process.env.PORT || defaultValues.PORT.toString(), 10),
    JWT_SECRET: process.env.JWT_SECRET || 'tyyacht-jwt-secret-key-2024-development',
    DATABASE_PATH: process.env.DATABASE_PATH || defaultValues.DATABASE_PATH,
    UPLOAD_PATH: process.env.UPLOAD_PATH || defaultValues.UPLOAD_PATH,
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || defaultValues.MAX_FILE_SIZE.toString(), 10),
    LOG_LEVEL: process.env.LOG_LEVEL || defaultValues.LOG_LEVEL,
    LOG_PATH: process.env.LOG_PATH || defaultValues.LOG_PATH,
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || defaultValues.BCRYPT_ROUNDS.toString(), 10),
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'change-this-to-secure-admin-password',
    ALLOWED_ORIGINS: allowedOrigins,
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || defaultValues.RATE_LIMIT_WINDOW_MS.toString(), 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || defaultValues.RATE_LIMIT_MAX_REQUESTS.toString(), 10)
  };
}

export const config = validateConfig();

// 환경 설정 정보를 로깅 (민감한 정보 제외)
console.log(`🚀 Starting TY Yacht School API Server`);
console.log(`📍 Environment: ${config.NODE_ENV}`);
console.log(`🌐 Port: ${config.PORT}`);
console.log(`📁 Database: ${config.DATABASE_PATH}`);
console.log(`📤 Upload Path: ${config.UPLOAD_PATH}`);
console.log(`🔒 CORS Origins: ${config.ALLOWED_ORIGINS.join(', ')}`);

if (config.NODE_ENV === 'development') {
  console.log(`⚙️ Development mode - using relaxed security settings`);
}
