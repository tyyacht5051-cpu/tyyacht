import express from 'express';
import { db } from '../db/database';
import fs from 'fs';
import path from 'path';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { adminLimiter } from '../middleware/rateLimiter';
import { config } from '../config/env';

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

// 모든 관리자 라우트에 Rate Limiting 적용
router.use(adminLimiter);

// 관리자 상태 실시간 검증 API (보안 강화)
router.get('/verify-admin', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    // 데이터베이스에서 실시간 관리자 상태 재확인
    const user = db.prepare('SELECT id, username, role, is_active FROM users WHERE id = ?').get(req.user?.id) as Pick<User, 'id' | 'username' | 'role' | 'is_active'> | undefined;

    if (!user || user.role !== 'admin' || user.is_active !== 1) {
      console.warn(`⚠️ 비활성화된 관리자 계정 접근 시도: ${req.user?.username} (${req.ip})`);
      return res.status(403).json({
        error: '관리자 권한이 없거나 비활성화된 계정입니다.',
        code: 'ADMIN_ACCESS_DENIED'
      });
    }

    res.json({
      isAdmin: true,
      username: user.username,
      lastVerified: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin verification failed:', error);
    res.status(500).json({ error: '관리자 권한 확인 중 오류가 발생했습니다.' });
  }
});

router.get('/users', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
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

router.patch('/users/:id/toggle-status', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
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

router.get('/logs', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
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

router.get('/database-status', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
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

router.get('/stats', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users WHERE role != ?').get('admin') as { count: number }).count;
    const activeUsers = (db.prepare('SELECT COUNT(*) as count FROM users WHERE role != ? AND is_active = 1').get('admin') as { count: number }).count;
    const recentLogins = (db.prepare('SELECT COUNT(*) as count FROM users WHERE last_login > datetime(\'now\', \'-7 days\')').get() as { count: number }).count;

    // 미디어 통계 추가
    const totalPhotos = (db.prepare('SELECT COUNT(*) as count FROM photos').get() as { count: number }).count;
    const totalVideos = (db.prepare('SELECT COUNT(*) as count FROM videos').get() as { count: number }).count;
    const totalNotices = (db.prepare('SELECT COUNT(*) as count FROM notices').get() as { count: number }).count;
    const totalVideoViews = (db.prepare('SELECT COALESCE(SUM(views), 0) as total FROM videos').get() as { total: number }).total;
    const totalNoticeViews = (db.prepare('SELECT COALESCE(SUM(views), 0) as total FROM notices').get() as { total: number }).total;

    res.json({
      totalUsers,
      activeUsers,
      recentLogins,
      inactiveUsers: totalUsers - activeUsers,
      media: {
        totalPhotos,
        totalVideos,
        totalNotices,
        totalVideoViews,
        totalNoticeViews
      }
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    res.status(500).json({ error: '통계 정보를 가져오는데 실패했습니다.' });
  }
});

// 포토갤러리 관리
router.get('/photos', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT p.*, u.username as author_name
      FROM photos p
      JOIN users u ON p.author_id = u.id
    `;
    const params: any[] = [];

    if (category && category !== 'all') {
      query += ' WHERE p.category_id = ?';
      params.push(category);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const photos = db.prepare(query).all(...params);

    const photosWithUrls = photos.map((photo: any) => ({
      ...photo,
      url: `/api/uploads/photos/${photo.filename}`,
      file_size_mb: (photo.file_size / (1024 * 1024)).toFixed(2)
    }));

    res.json(photosWithUrls);
  } catch (error) {
    console.error('Failed to fetch photos for admin:', error);
    res.status(500).json({ error: '포토갤러리 목록을 가져오는데 실패했습니다.' });
  }
});

router.get('/photos/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const photoId = parseInt(req.params.id);

    const photo = db.prepare(`
      SELECT p.*, u.username as author_name, u.full_name as author_full_name
      FROM photos p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `).get(photoId);

    if (!photo) {
      return res.status(404).json({ error: '사진을 찾을 수 없습니다.' });
    }

    const photoWithUrl = {
      ...photo,
      url: `/api/uploads/photos/${(photo as any).filename}`,
      file_size_mb: ((photo as any).file_size / (1024 * 1024)).toFixed(2)
    };

    res.json(photoWithUrl);
  } catch (error) {
    console.error('Failed to fetch photo for admin:', error);
    res.status(500).json({ error: '사진 정보를 가져오는데 실패했습니다.' });
  }
});

// 동영상갤러리 관리
router.get('/videos', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT v.*, u.username as author_name
      FROM videos v
      JOIN users u ON v.author_id = u.id
    `;
    const params: any[] = [];

    if (category && category !== 'all') {
      query += ' WHERE v.category_id = ?';
      params.push(category);
    }

    query += ' ORDER BY v.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const videos = db.prepare(query).all(...params);

    const videosWithUrls = videos.map((video: any) => ({
      ...video,
      url: `/api/uploads/videos/${video.filename}`,
      thumbnail_url: video.thumbnail_path ? `/api/uploads/thumbnails/${path.basename(video.thumbnail_path)}` : null,
      file_size_mb: (video.file_size / (1024 * 1024)).toFixed(2)
    }));

    res.json(videosWithUrls);
  } catch (error) {
    console.error('Failed to fetch videos for admin:', error);
    res.status(500).json({ error: '동영상갤러리 목록을 가져오는데 실패했습니다.' });
  }
});

router.get('/videos/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const videoId = parseInt(req.params.id);

    const video = db.prepare(`
      SELECT v.*, u.username as author_name, u.full_name as author_full_name
      FROM videos v
      JOIN users u ON v.author_id = u.id
      WHERE v.id = ?
    `).get(videoId);

    if (!video) {
      return res.status(404).json({ error: '동영상을 찾을 수 없습니다.' });
    }

    const videoWithUrls = {
      ...video,
      url: `/api/uploads/videos/${(video as any).filename}`,
      thumbnail_url: (video as any).thumbnail_path ? `/api/uploads/thumbnails/${path.basename((video as any).thumbnail_path)}` : null,
      file_size_mb: ((video as any).file_size / (1024 * 1024)).toFixed(2)
    };

    res.json(videoWithUrls);
  } catch (error) {
    console.error('Failed to fetch video for admin:', error);
    res.status(500).json({ error: '동영상 정보를 가져오는데 실패했습니다.' });
  }
});

// 공지사항 관리
router.get('/notices', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT n.*, u.username as author_name
      FROM notices n
      JOIN users u ON n.author_id = u.id
    `;
    const params: any[] = [];

    if (category && category !== 'all') {
      query += ' WHERE n.category_id = ?';
      params.push(category);
    }

    query += ' ORDER BY n.important DESC, n.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const notices = db.prepare(query).all(...params);

    const noticesWithImages = notices.map((notice: any) => {
      const images = db.prepare('SELECT * FROM notice_images WHERE notice_id = ?').all(notice.id);
      return {
        ...notice,
        images,
        image_count: images.length
      };
    });

    res.json(noticesWithImages);
  } catch (error) {
    console.error('Failed to fetch notices for admin:', error);
    res.status(500).json({ error: '공지사항 목록을 가져오는데 실패했습니다.' });
  }
});

router.get('/notices/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const noticeId = parseInt(req.params.id);

    const notice = db.prepare(`
      SELECT n.*, u.username as author_name, u.full_name as author_full_name
      FROM notices n
      JOIN users u ON n.author_id = u.id
      WHERE n.id = ?
    `).get(noticeId);

    if (!notice) {
      return res.status(404).json({ error: '공지사항을 찾을 수 없습니다.' });
    }

    const images = db.prepare('SELECT * FROM notice_images WHERE notice_id = ?').all(noticeId);

    res.json({ ...notice, images });
  } catch (error) {
    console.error('Failed to fetch notice for admin:', error);
    res.status(500).json({ error: '공지사항 정보를 가져오는데 실패했습니다.' });
  }
});

// 미디어 카테고리별 통계
router.get('/media-stats', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const photoStats = db.prepare(`
      SELECT
        category_id,
        COUNT(*) as count,
        MAX(created_at) as latest_date
      FROM photos
      GROUP BY category_id
    `).all();

    const videoStats = db.prepare(`
      SELECT
        category_id,
        COUNT(*) as count,
        MAX(created_at) as latest_date,
        SUM(views) as total_views
      FROM videos
      GROUP BY category_id
    `).all();

    const noticeStats = db.prepare(`
      SELECT
        category_id,
        COUNT(*) as count,
        MAX(created_at) as latest_date,
        SUM(views) as total_views
      FROM notices
      GROUP BY category_id
    `).all();

    res.json({
      photos: photoStats,
      videos: videoStats,
      notices: noticeStats
    });
  } catch (error) {
    console.error('Failed to fetch media stats:', error);
    res.status(500).json({ error: '미디어 통계를 가져오는데 실패했습니다.' });
  }
});

export default router;