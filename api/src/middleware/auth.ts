import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    isAdmin: boolean;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // 쿠키에서 토큰 확인을 우선으로, Authorization 헤더는 백업으로
  const cookieToken = req.cookies?.authToken;
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.split(' ')[1]; // Bearer TOKEN 형식에서 TOKEN 부분만 추출

  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({
      error: '인증 토큰이 필요합니다.',
      code: 'TOKEN_REQUIRED'
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    req.user = {
      id: decoded.userId || decoded.id,
      username: decoded.username,
      isAdmin: decoded.role === 'admin' || decoded.role === 'super_admin'
    };
    next();
  } catch (error) {
    console.error('JWT 토큰 검증 실패:', error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: '토큰이 만료되었습니다.',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: '유효하지 않은 토큰입니다.',
        code: 'TOKEN_INVALID'
      });
    }

    return res.status(500).json({
      error: '토큰 검증 중 오류가 발생했습니다.',
      code: 'TOKEN_ERROR'
    });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // 사용자 인증 여부 먼저 확인
  if (!req.user) {
    return res.status(401).json({
      error: '인증이 필요합니다.',
      code: 'AUTH_REQUIRED'
    });
  }

  // 관리자 권한 확인 - 더 엄격한 검증
  if (!req.user.isAdmin || req.user.id === undefined || req.user.username === undefined) {
    console.warn(`⚠️ 비인가 관리자 페이지 접근 시도: ${req.user.username || 'unknown'} (${req.ip})`);
    return res.status(403).json({
      error: '관리자 권한이 필요합니다.',
      code: 'ADMIN_REQUIRED'
    });
  }

  // 관리자 접근 로깅 (보안 감사용)
  console.log(`👤 관리자 접근: ${req.user.username} -> ${req.method} ${req.path} (${req.ip})`);
  next();
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // 쿠키에서 토큰 확인을 우선으로, Authorization 헤더는 백업으로
  const cookieToken = req.cookies?.authToken;
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.split(' ')[1];

  const token = cookieToken || headerToken;

  if (!token) {
    req.user = undefined;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    req.user = {
      id: decoded.userId || decoded.id,
      username: decoded.username,
      isAdmin: decoded.role === 'admin' || decoded.role === 'super_admin'
    };
  } catch (error) {
    console.error('선택적 JWT 토큰 검증 실패:', error);
    req.user = undefined;
  }

  next();
};