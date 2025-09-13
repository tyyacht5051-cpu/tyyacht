import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database';

const router = Router();

// JWT 시크릿
const JWT_SECRET = process.env.JWT_SECRET || 'tyyacht-jwt-secret-key-2024-development';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('❌ JWT_SECRET must be configured in production');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ Using default JWT_SECRET in development - please set JWT_SECRET environment variable');
}

// 관리자 권한 확인 미들웨어
const authenticateAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId) as any;
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// 스케줄 테이블은 database.ts에서 초기화됨

// 스케줄 조회 (모든 월)
router.get('/', async (req: any, res) => {
  try {
    const schedules = db.prepare('SELECT * FROM exemption_schedules ORDER BY month').all() as any[];
    
    const schedulesMap: { [key: string]: string[] } = {};
    schedules.forEach((schedule: any) => {
      schedulesMap[schedule.month] = JSON.parse(schedule.dates);
    });
    
    res.json(schedulesMap);
  } catch (error) {
    console.error('Failed to load schedules:', error);
    res.status(500).json({ error: 'Failed to load schedules' });
  }
});

// 특정 월 스케줄 조회
router.get('/:month', async (req: any, res) => {
  try {
    const { month } = req.params;
    const schedule = db.prepare('SELECT * FROM exemption_schedules WHERE month = ?').get(month) as any;
    
    if (!schedule) {
      return res.json({ dates: [] });
    }
    
    res.json({
      month: schedule.month,
      dates: JSON.parse(schedule.dates)
    });
  } catch (error) {
    console.error('Failed to load schedule:', error);
    res.status(500).json({ error: 'Failed to load schedule' });
  }
});

// 스케줄 저장/업데이트 (관리자만)
router.post('/', authenticateAdmin, async (req: any, res) => {
  try {
    const { month, dates } = req.body;
    
    if (!month || !Array.isArray(dates)) {
      return res.status(400).json({ error: 'Invalid month or dates' });
    }
    
    if (dates.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 dates allowed per month' });
    }
    
    // 날짜 검증
    const validDates = dates.filter(date => {
      try {
        new Date(date).toISOString();
        return true;
      } catch {
        return false;
      }
    });
    
    if (validDates.length !== dates.length) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    const datesJson = JSON.stringify(dates.sort());
    
    // UPSERT (INSERT OR UPDATE)
    const stmt = db.prepare(`
      INSERT INTO exemption_schedules (month, dates, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(month) DO UPDATE SET 
      dates = excluded.dates,
      updated_at = CURRENT_TIMESTAMP
    `);
    
    stmt.run(month, datesJson);
    
    res.json({ 
      success: true, 
      message: 'Schedule saved successfully',
      month,
      dates
    });
  } catch (error) {
    console.error('Failed to save schedule:', error);
    res.status(500).json({ error: 'Failed to save schedule' });
  }
});

// 스케줄 삭제 (관리자만)
router.delete('/:month', authenticateAdmin, async (req: any, res) => {
  try {
    const { month } = req.params;
    
    const stmt = db.prepare('DELETE FROM exemption_schedules WHERE month = ?');
    const result = stmt.run(month);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

// 현재 월의 가능한 날짜 조회 (공개)
router.get('/available/:month', async (req: any, res) => {
  try {
    const { month } = req.params;
    const schedule = db.prepare('SELECT * FROM exemption_schedules WHERE month = ?').get(month) as any;
    
    if (!schedule) {
      return res.json({ dates: [] });
    }
    
    const dates = JSON.parse(schedule.dates);
    const today = new Date().toISOString().split('T')[0];
    
    // 오늘 이후 날짜만 반환
    const availableDates = dates.filter((date: string) => date >= today);
    
    res.json({ dates: availableDates });
  } catch (error) {
    console.error('Failed to load available dates:', error);
    res.status(500).json({ error: 'Failed to load available dates' });
  }
});

export default router;