import express from 'express';
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

function authenticateAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.prepare('SELECT id, username, email, full_name, role FROM users WHERE id = ? AND role = ?').get(decoded.userId, 'admin') as Pick<User, 'id' | 'username' | 'email' | 'full_name' | 'role'> | undefined;
    
    if (!user) {
      return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
}

router.get('/users', authenticateAdmin, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, username, email, full_name, phone, birth_date, gender, role, is_active, created_at, updated_at, last_login
      FROM users 
      ORDER BY created_at DESC
    `).all() as Pick<User, 'id' | 'username' | 'email' | 'full_name' | 'phone' | 'birth_date' | 'gender' | 'role' | 'is_active' | 'created_at' | 'updated_at' | 'last_login'>[];

    res.json(users);
  } catch (error) {
    console.error('Failed to get users:', error);
    res.status(500).json({ error: '사용자 목록을 가져오는데 실패했습니다.' });
  }
});

router.patch('/users/:id/toggle-status', authenticateAdmin, (req, res) => {
  try {
    const userId = req.params.id;
    const user = db.prepare('SELECT id, username, is_active, role FROM users WHERE id = ?').get(userId) as Pick<User, 'id' | 'username' | 'is_active' | 'role'> | undefined;

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: '관리자 계정의 상태는 변경할 수 없습니다.' });
    }

    const newStatus = user.is_active ? 0 : 1;
    db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(newStatus, userId);

    res.json({ 
      message: `사용자 ${user.username}이 ${newStatus ? '활성화' : '비활성화'}되었습니다.`,
      is_active: newStatus 
    });
  } catch (error) {
    console.error('Failed to toggle user status:', error);
    res.status(500).json({ error: '사용자 상태 변경에 실패했습니다.' });
  }
});

router.get('/logs', authenticateAdmin, (req, res) => {
  try {
    let logs: string[] = [];
    
    if (fs.existsSync(loginLogPath)) {
      const logContent = fs.readFileSync(loginLogPath, 'utf8');
      logs = logContent.split('\n')
        .filter(line => line.trim() !== '')
        .slice(-100) // 최근 100개 로그만
        .reverse(); // 최신 로그가 위로 오도록
    }

    res.json({ logs });
  } catch (error) {
    console.error('Failed to read login logs:', error);
    res.status(500).json({ error: '로그인 기록을 가져오는데 실패했습니다.' });
  }
});

router.get('/database-status', authenticateAdmin, (req, res) => {
  try {
    const result = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    res.json({ 
      status: 'connected', 
      message: '데이터베이스가 정상적으로 연결되어 있습니다.',
      userCount: result.count
    });
  } catch (error) {
    console.error('Database status check failed:', error);
    res.status(500).json({ error: '데이터베이스 연결 확인에 실패했습니다.' });
  }
});

router.get('/stats', authenticateAdmin, (req, res) => {
  try {
    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users WHERE role != ?').get('admin') as { count: number }).count;
    const activeUsers = (db.prepare('SELECT COUNT(*) as count FROM users WHERE role != ? AND is_active = 1').get('admin') as { count: number }).count;
    const recentLogins = (db.prepare('SELECT COUNT(*) as count FROM users WHERE last_login > datetime(\'now\', \'-7 days\')').get() as { count: number }).count;
    
    res.json({
      totalUsers,
      activeUsers,
      recentLogins,
      inactiveUsers: totalUsers - activeUsers
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    res.status(500).json({ error: '통계 정보를 가져오는데 실패했습니다.' });
  }
});

export default router;