import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 에러 로깅 함수
function logError(error: AppError, req: Request) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ERROR: ${error.message}\n` +
    `Method: ${req.method} ${req.originalUrl}\n` +
    `User-Agent: ${req.get('User-Agent') || 'Unknown'}\n` +
    `IP: ${req.ip}\n` +
    `Stack: ${error.stack}\n` +
    '---\n';

  console.error(logMessage);

  // 운영 환경에서는 추가적인 로깅 시스템으로 전송 가능
  if (config.NODE_ENV === 'production') {
    // TODO: 실제 로깅 서비스로 전송 (예: Winston, Sentry 등)
  }
}

// 운영 에러와 개발 에러를 다르게 처리
function sendErrorDev(error: AppError, res: Response) {
  res.status(error.statusCode || 500).json({
    status: 'error',
    error: error.message,
    message: error.message,
    stack: error.stack,
    ...(error.statusCode && { statusCode: error.statusCode })
  });
}

function sendErrorProd(error: AppError, res: Response) {
  // 운영 환경에서는 민감한 정보를 숨김
  if (error.isOperational) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  } else {
    // 예상치 못한 에러는 일반적인 메시지로 응답
    res.status(500).json({
      status: 'error',
      message: '서버에서 오류가 발생했습니다.'
    });
  }
}

// 글로벌 에러 핸들러
export const globalErrorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 기본값 설정
  error.statusCode = error.statusCode || 500;

  // 에러 로깅
  logError(error, req);

  // 환경에 따른 에러 응답
  if (config.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// 처리되지 않은 라우트를 위한 핸들러
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(`경로를 찾을 수 없습니다: ${req.originalUrl}`, 404);
  next(error);
};

// 비동기 함수의 에러를 자동으로 next()로 전달하는 래퍼
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 일반적인 에러 생성 함수들
export const createValidationError = (message: string) => new ApiError(message, 400);
export const createAuthError = (message = '인증이 필요합니다.') => new ApiError(message, 401);
export const createForbiddenError = (message = '권한이 없습니다.') => new ApiError(message, 403);
export const createNotFoundError = (message = '리소스를 찾을 수 없습니다.') => new ApiError(message, 404);
export const createConflictError = (message: string) => new ApiError(message, 409);
export const createServerError = (message = '서버 오류가 발생했습니다.') => new ApiError(message, 500);