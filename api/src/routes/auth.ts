import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/database';
import path from 'path';
import { authenticateToken, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter';
import { config } from '../config/env';
import { appendToFile } from '../utils/fileSystem';

interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  role: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  last_login?: string;
  terms_agreed: number;
  privacy_agreed: number;
}

const router = express.Router();
const loginLogPath = path.join(config.LOG_PATH, 'login.txt');

function logLoginActivity(username: string, email: string, status: 'SUCCESS' | 'FAILED' | 'LOGOUT', ip?: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${status}: ${username} (${email}) ${ip ? `from ${ip}` : ''}\n`;

  appendToFile(loginLogPath, logEntry);
}

router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { username, email, password, fullName, phone, birthDate, gender, termsAgreed, privacyAgreed } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
    }

    if (!termsAgreed || !privacyAgreed) {
      return res.status(400).json({ error: '약관 동의가 필요합니다.' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existingUser) {
      return res.status(409).json({ error: '이미 존재하는 사용자입니다.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = db.prepare(`
      INSERT INTO users (username, email, password_hash, full_name, phone, birth_date, gender, terms_agreed, privacy_agreed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(username, email, passwordHash, fullName, phone, birthDate, gender, 1, 1);

    logLoginActivity(username, email, 'SUCCESS', req.ip);

    res.status(201).json({ 
      message: '회원가입이 완료되었습니다.',
      userId: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '사용자명과 비밀번호를 입력해주세요.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username) as User | undefined;

    if (!user) {
      logLoginActivity(username, '', 'FAILED', req.ip);
      return res.status(401).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    console.log('Login attempt - Username:', username);
    console.log('Login attempt - Password received:', password);
    console.log('Login attempt - Hash from DB:', user.password_hash);
    console.log('Login attempt - Hash length:', user.password_hash?.length);

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    console.log('Login attempt - Password valid:', isValidPassword);

    if (!isValidPassword) {
      logLoginActivity(user.username, user.email, 'FAILED', req.ip);
      return res.status(401).json({ error: '비밀번호가 올바르지 않습니다.' });
    }

    if (!user.is_active) {
      logLoginActivity(user.username, user.email, 'FAILED', req.ip);
      return res.status(401).json({ error: '비활성화된 계정입니다.' });
    }

    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logLoginActivity(user.username, user.email, 'SUCCESS', req.ip);

    // httpOnly 쿠키로 JWT 토큰 설정
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송 (프로덕션)
      sameSite: 'strict', // CSRF 공격 방지
      maxAge: 24 * 60 * 60 * 1000 // 24시간 (밀리초)
    });

    res.json({
      message: '로그인 성공',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
  }
});

router.post('/logout', optionalAuth, (req: AuthenticatedRequest, res) => {
  if (req.user) {
    try {
      logLoginActivity(req.user.username, '', 'LOGOUT', req.ip);
    } catch (error) {
      console.error('Logout logging error:', error);
    }
  }

  // httpOnly 쿠키 삭제
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.json({ message: '로그아웃 되었습니다.' });
});

router.get('/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const user = db.prepare('SELECT id, username, email, full_name, role FROM users WHERE id = ?').get(req.user?.id) as Pick<User, 'id' | 'username' | 'email' | 'full_name' | 'role'> | undefined;

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ error: '사용자 정보를 가져오는데 실패했습니다.' });
  }
});

router.put('/change-password', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: '현재 비밀번호와 새 비밀번호를 입력해주세요.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: '새 비밀번호는 최소 8자 이상이어야 합니다.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: '현재 비밀번호가 올바르지 않습니다.' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newPasswordHash, userId);

    logLoginActivity(user.username, user.email, 'SUCCESS', req.ip);
    appendToFile(loginLogPath, `[${new Date().toISOString()}] PASSWORD_CHANGED: ${user.username} (${user.email})\n`);

    res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: '비밀번호 변경 중 오류가 발생했습니다.' });
  }
});

export default router;