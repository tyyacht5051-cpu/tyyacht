import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/database';
import fs from 'fs';
import path from 'path';

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
const JWT_SECRET = process.env.JWT_SECRET || 'tyyacht-jwt-secret-key-2024-development';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('❌ JWT_SECRET must be configured in production');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ Using default JWT_SECRET in development - please set JWT_SECRET environment variable');
}
const loginLogPath = path.join(__dirname, '../../logs/login.txt');

function logLoginActivity(username: string, email: string, status: 'SUCCESS' | 'FAILED', ip?: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${status}: ${username} (${email}) ${ip ? `from ${ip}` : ''}\n`;
  
  fs.appendFileSync(loginLogPath, logEntry, 'utf8');
}

router.post('/register', async (req, res) => {
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

router.post('/login', async (req, res) => {
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

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
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
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logLoginActivity(user.username, user.email, 'SUCCESS', req.ip);

    res.json({
      message: '로그인 성공',
      token,
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

router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      logLoginActivity(decoded.username, '', 'SUCCESS', req.ip);
    } catch (error) {
      console.error('Token decode error during logout:', error);
    }
  }
  
  res.json({ message: '로그아웃 되었습니다.' });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.prepare('SELECT id, username, email, full_name, role FROM users WHERE id = ?').get(decoded.userId) as Pick<User, 'id' | 'username' | 'email' | 'full_name' | 'role'> | undefined;
    
    if (!user) {
      return res.status(401).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    });
  } catch (error) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
});

export default router;