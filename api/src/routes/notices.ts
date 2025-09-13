import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db/database';

const router = express.Router();

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/notices');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// 인터페이스 정의
interface Notice {
  id: number;
  title: string;
  content: string;
  category_id: string;
  important: number;
  views: number;
  author_id: number;
  created_at: string;
  updated_at: string;
}

interface NoticeImage {
  id: number;
  notice_id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  created_at: string;
}

// 관리자 권한 확인 미들웨어
const authenticateAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tyyacht-jwt-secret-key-2024-development');
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

// 공지사항 목록 조회
router.get('/', (req, res) => {
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
    
    const notices = db.prepare(query).all(...params) as Notice[];
    
    // 각 공지사항의 이미지 정보도 가져오기
    const noticesWithImages = notices.map(notice => {
      const images = db.prepare('SELECT * FROM notice_images WHERE notice_id = ?').all(notice.id) as NoticeImage[];
      return { ...notice, images };
    });
    
    res.json(noticesWithImages);
  } catch (error) {
    console.error('Failed to fetch notices:', error);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

// 공지사항 상세 조회
router.get('/:id', (req, res) => {
  try {
    const noticeId = parseInt(req.params.id);
    
    // 조회수 증가
    db.prepare('UPDATE notices SET views = views + 1 WHERE id = ?').run(noticeId);
    
    // 공지사항 정보 조회
    const notice = db.prepare(`
      SELECT n.*, u.username as author_name, u.full_name as author_full_name
      FROM notices n 
      JOIN users u ON n.author_id = u.id 
      WHERE n.id = ?
    `).get(noticeId) as Notice;
    
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    
    // 첨부 이미지 조회
    const images = db.prepare('SELECT * FROM notice_images WHERE notice_id = ?').all(noticeId) as NoticeImage[];
    
    res.json({ ...notice, images });
  } catch (error) {
    console.error('Failed to fetch notice:', error);
    res.status(500).json({ error: 'Failed to fetch notice' });
  }
});

// 공지사항 작성 (관리자만)
router.post('/', authenticateAdmin, upload.array('images', 3), (req: any, res) => {
  try {
    const { title, content, category_id, important = false } = req.body;
    const author_id = req.user.id;
    
    if (!title || !content || !category_id) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }
    
    // 공지사항 생성
    const result = db.prepare(`
      INSERT INTO notices (title, content, category_id, important, author_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, content, category_id, important ? 1 : 0, author_id);
    
    const noticeId = result.lastInsertRowid;
    
    // 이미지 파일 처리
    if (req.files && req.files.length > 0) {
      const imageStmt = db.prepare(`
        INSERT INTO notice_images (notice_id, filename, original_name, file_path, file_size)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      for (const file of req.files) {
        imageStmt.run(
          noticeId,
          file.filename,
          file.originalname,
          file.path,
          file.size
        );
      }
    }
    
    res.status(201).json({ id: noticeId, message: 'Notice created successfully' });
  } catch (error) {
    console.error('Failed to create notice:', error);
    res.status(500).json({ error: 'Failed to create notice' });
  }
});

// 공지사항 수정 (관리자만)
router.put('/:id', authenticateAdmin, upload.array('images', 3), (req: any, res) => {
  try {
    const noticeId = parseInt(req.params.id);
    const { title, content, category_id, important = false } = req.body;
    
    if (!title || !content || !category_id) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }
    
    // 공지사항 수정
    const result = db.prepare(`
      UPDATE notices 
      SET title = ?, content = ?, category_id = ?, important = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, content, category_id, important ? 1 : 0, noticeId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    
    // 새 이미지 파일 처리
    if (req.files && req.files.length > 0) {
      const imageStmt = db.prepare(`
        INSERT INTO notice_images (notice_id, filename, original_name, file_path, file_size)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      for (const file of req.files) {
        imageStmt.run(
          noticeId,
          file.filename,
          file.originalname,
          file.path,
          file.size
        );
      }
    }
    
    res.json({ message: 'Notice updated successfully' });
  } catch (error) {
    console.error('Failed to update notice:', error);
    res.status(500).json({ error: 'Failed to update notice' });
  }
});

// 공지사항 삭제 (관리자만)
router.delete('/:id', authenticateAdmin, (req: any, res) => {
  try {
    const noticeId = parseInt(req.params.id);
    
    // 첨부된 이미지 파일 삭제
    const images = db.prepare('SELECT * FROM notice_images WHERE notice_id = ?').all(noticeId) as NoticeImage[];
    
    for (const image of images) {
      try {
        if (fs.existsSync(image.file_path)) {
          fs.unlinkSync(image.file_path);
        }
      } catch (fileError) {
        console.warn('Failed to delete image file:', image.file_path);
      }
    }
    
    // 공지사항 삭제 (CASCADE로 이미지 레코드도 자동 삭제됨)
    const result = db.prepare('DELETE FROM notices WHERE id = ?').run(noticeId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Failed to delete notice:', error);
    res.status(500).json({ error: 'Failed to delete notice' });
  }
});

// 이미지 삭제 (관리자만)
router.delete('/images/:imageId', authenticateAdmin, (req: any, res) => {
  try {
    const imageId = parseInt(req.params.imageId);
    
    const image = db.prepare('SELECT * FROM notice_images WHERE id = ?').get(imageId) as NoticeImage;
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // 파일 삭제
    try {
      if (fs.existsSync(image.file_path)) {
        fs.unlinkSync(image.file_path);
      }
    } catch (fileError) {
      console.warn('Failed to delete image file:', image.file_path);
    }
    
    // 데이터베이스에서 삭제
    db.prepare('DELETE FROM notice_images WHERE id = ?').run(imageId);
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Failed to delete image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// 카테고리별 통계
router.get('/stats/categories', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        category_id,
        COUNT(*) as count,
        MAX(created_at) as latest_date
      FROM notices 
      GROUP BY category_id
    `).all();
    
    res.json(stats);
  } catch (error) {
    console.error('Failed to fetch category stats:', error);
    res.status(500).json({ error: 'Failed to fetch category stats' });
  }
});

export default router;