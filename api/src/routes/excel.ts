import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// 데이터베이스 인스턴스 가져오기 (다른 라우트에서와 동일한 방식)
const db = new Database('./database.db');

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'user';
  };
}

interface ExcelHistory {
  id: number;
  user_id: number;
  category: 'cruise' | 'exemption' | 'education';
  record_count: number;
  filters: string; // JSON string
  created_at: string;
  user_username?: string;
}

// 엑셀 히스토리 테이블 생성
const createExcelHistoryTable = () => {
  const createTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS excel_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('cruise', 'exemption', 'education')),
      record_count INTEGER NOT NULL DEFAULT 0,
      filters TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);
  createTable.run();
};

// 테이블 생성 실행
createExcelHistoryTable();

// 엑셀 히스토리 목록 조회 (관리자만)
router.get('/history', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const histories = db.prepare(`
      SELECT eh.*, u.username as user_username
      FROM excel_history eh
      LEFT JOIN users u ON eh.user_id = u.id
      ORDER BY eh.created_at DESC
      LIMIT 50
    `).all() as ExcelHistory[];

    // filters JSON 파싱
    const processedHistories = histories.map(history => ({
      ...history,
      filters: history.filters ? JSON.parse(history.filters) : {}
    }));

    res.json(processedHistories);
  } catch (error) {
    console.error('Failed to get excel history:', error);
    res.status(500).json({ error: 'Failed to get excel history' });
  }
});

// 엑셀 히스토리 저장 (관리자만)
router.post('/history', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, recordCount, filters = {} } = req.body;
    const userId = req.user!.id;

    if (!category || !['cruise', 'exemption', 'education'].includes(category)) {
      return res.status(400).json({ error: 'Valid category is required' });
    }

    if (typeof recordCount !== 'number' || recordCount < 0) {
      return res.status(400).json({ error: 'Valid record count is required' });
    }

    // user_id가 실제로 존재하는지 확인
    const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!userExists) {
      console.error(`User ID ${userId} not found in database. Token may be outdated.`);
      return res.status(400).json({ error: 'Invalid user. Please log in again.' });
    }

    const stmt = db.prepare(`
      INSERT INTO excel_history (user_id, category, record_count, filters)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      category,
      recordCount,
      JSON.stringify(filters)
    );

    const newHistory = db.prepare(`
      SELECT eh.*, u.username as user_username
      FROM excel_history eh
      LEFT JOIN users u ON eh.user_id = u.id
      WHERE eh.id = ?
    `).get(result.lastInsertRowid) as ExcelHistory;

    res.status(201).json({
      ...newHistory,
      filters: JSON.parse(newHistory.filters || '{}')
    });
  } catch (error) {
    console.error('Failed to save excel history:', error);
    res.status(500).json({ error: 'Failed to save excel history' });
  }
});

// 엑셀 히스토리 삭제 (관리자만)
router.delete('/history/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const historyId = parseInt(req.params.id);

    if (isNaN(historyId)) {
      return res.status(400).json({ error: 'Valid history ID is required' });
    }

    const stmt = db.prepare('DELETE FROM excel_history WHERE id = ?');
    const result = stmt.run(historyId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'History not found' });
    }

    res.json({ message: 'History deleted successfully' });
  } catch (error) {
    console.error('Failed to delete excel history:', error);
    res.status(500).json({ error: 'Failed to delete excel history' });
  }
});

// 카테고리별 통계 조회 (관리자만)
router.get('/stats', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = db.prepare(`
      SELECT
        category,
        COUNT(*) as export_count,
        SUM(record_count) as total_records,
        MAX(created_at) as last_export
      FROM excel_history
      GROUP BY category
    `).all();

    // 전체 통계
    const totalStats = db.prepare(`
      SELECT
        COUNT(*) as total_exports,
        SUM(record_count) as total_records,
        COUNT(DISTINCT user_id) as unique_users
      FROM excel_history
    `).get();

    res.json({
      category_stats: stats,
      total_stats: totalStats
    });
  } catch (error) {
    console.error('Failed to get excel stats:', error);
    res.status(500).json({ error: 'Failed to get excel stats' });
  }
});

// 사용자별 히스토리 조회 (관리자만)
router.get('/history/user/:userId', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Valid user ID is required' });
    }

    const histories = db.prepare(`
      SELECT eh.*, u.username as user_username
      FROM excel_history eh
      LEFT JOIN users u ON eh.user_id = u.id
      WHERE eh.user_id = ?
      ORDER BY eh.created_at DESC
    `).all(userId) as ExcelHistory[];

    const processedHistories = histories.map(history => ({
      ...history,
      filters: history.filters ? JSON.parse(history.filters) : {}
    }));

    res.json(processedHistories);
  } catch (error) {
    console.error('Failed to get user excel history:', error);
    res.status(500).json({ error: 'Failed to get user excel history' });
  }
});

export default router;