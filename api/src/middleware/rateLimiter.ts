import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

// 일반적인 API 요청에 대한 속도 제한
export const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS, // .env의 RATE_LIMIT_MAX_REQUESTS 값 사용 (기본 100)
  message: {
    error: '너무 많은 요청이 발생했습니다. 15분 후에 다시 시도해주세요.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 로그인 요청에 대한 더 엄격한 속도 제한 (브루트포스 공격 방지)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // IP당 15분에 최대 5번의 로그인 시도
  message: {
    error: '로그인 시도가 너무 많습니다. 15분 후에 다시 시도해주세요.',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 성공한 로그인은 카운터에서 제외
  handler: (req, res) => {
    console.warn(`🚨 브루트포스 공격 감지: ${req.ip} - ${req.body?.username || 'unknown'} (${new Date().toISOString()})`);
    res.status(429).json({
      error: '로그인 시도가 너무 많습니다. 15분 후에 다시 시도해주세요.',
      code: 'LOGIN_RATE_LIMIT_EXCEEDED'
    });
  }
});

// 회원가입 요청에 대한 속도 제한
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 3, // IP당 1시간에 최대 3번의 회원가입 시도
  message: {
    error: '회원가입 시도가 너무 많습니다. 1시간 후에 다시 시도해주세요.',
    code: 'REGISTER_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 관리자 페이지 접근에 대한 속도 제한
export const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5분
  max: 30, // IP당 5분에 최대 30번의 관리자 페이지 요청
  message: {
    error: '관리자 페이지 요청이 너무 많습니다. 5분 후에 다시 시도해주세요.',
    code: 'ADMIN_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`🚨 관리자 페이지 과다 접근: ${req.ip} (${new Date().toISOString()})`);
    res.status(429).json({
      error: '관리자 페이지 요청이 너무 많습니다. 5분 후에 다시 시도해주세요.',
      code: 'ADMIN_RATE_LIMIT_EXCEEDED'
    });
  }
});

// 파일 업로드에 대한 속도 제한
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10분
  max: 20, // IP당 10분에 최대 20번의 파일 업로드
  message: {
    error: '파일 업로드 요청이 너무 많습니다. 10분 후에 다시 시도해주세요.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// API 검색/조회 요청에 대한 속도 제한
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 60, // IP당 1분에 최대 60번의 검색 요청
  message: {
    error: '검색 요청이 너무 많습니다. 1분 후에 다시 시도해주세요.',
    code: 'SEARCH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});
