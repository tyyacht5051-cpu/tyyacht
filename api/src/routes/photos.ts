import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db/database';

const router = express.Router();

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/photos');
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// 인터페이스 정의
interface Photo {
  id: number;
  title: string;
  description: string;
  category_id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  author_id: number;
  created_at: string;
  updated_at: string;
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

// 사진 목록 조회
router.get('/', (req, res) => {
  try {
    const { category, limit = 50, offset = 0 } = req.query;
    
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
    
    const photos = db.prepare(query).all(...params) as Photo[];
    
    // 파일 경로를 웹에서 접근 가능한 URL로 변환
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      url: `/api/uploads/photos/${photo.filename}`
    }));
    
    res.json(photosWithUrls);
  } catch (error) {
    console.error('Failed to fetch photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// 사진 상세 조회
router.get('/:id', (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    
    const photo = db.prepare(`
      SELECT p.*, u.username as author_name, u.full_name as author_full_name
      FROM photos p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.id = ?
    `).get(photoId) as Photo;
    
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    const photoWithUrl = {
      ...photo,
      url: `/api/uploads/photos/${photo.filename}`
    };
    
    res.json(photoWithUrl);
  } catch (error) {
    console.error('Failed to fetch photo:', error);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

// 사진 업로드 (관리자만)
router.post('/', authenticateAdmin, upload.array('photos', 5), (req: any, res) => {
  try {
    const { title, description, category_id } = req.body;
    const author_id = req.user.id;
    
    if (!title || !category_id) {
      return res.status(400).json({ error: 'Title and category are required' });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one photo is required' });
    }
    
    const photoIds: number[] = [];
    
    // 각 파일에 대해 데이터베이스에 레코드 생성
    const stmt = db.prepare(`
      INSERT INTO photos (title, description, category_id, filename, original_name, file_path, file_size, author_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const photoTitle = req.files.length > 1 ? `${title} ${i + 1}` : title;
      
      const result = stmt.run(
        photoTitle,
        description || '',
        category_id,
        file.filename,
        file.originalname,
        file.path,
        file.size,
        author_id
      );
      
      photoIds.push(result.lastInsertRowid as number);
    }
    
    res.status(201).json({ 
      ids: photoIds, 
      count: photoIds.length,
      message: `${photoIds.length} photo(s) uploaded successfully` 
    });
  } catch (error) {
    console.error('Failed to upload photos:', error);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

// 사진 수정 (관리자만)
router.put('/:id', authenticateAdmin, (req: any, res) => {
  try {
    const photoId = parseInt(req.params.id);
    const { title, description, category_id } = req.body;
    
    if (!title || !category_id) {
      return res.status(400).json({ error: 'Title and category are required' });
    }
    
    const result = db.prepare(`
      UPDATE photos 
      SET title = ?, description = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, description || '', category_id, photoId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    res.json({ message: 'Photo updated successfully' });
  } catch (error) {
    console.error('Failed to update photo:', error);
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

// 사진 삭제 (관리자만)
router.delete('/:id', authenticateAdmin, (req: any, res) => {
  try {
    const photoId = parseInt(req.params.id);
    
    // 사진 정보 조회
    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(photoId) as Photo;
    
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    // 파일 삭제
    try {
      if (fs.existsSync(photo.file_path)) {
        fs.unlinkSync(photo.file_path);
      }
    } catch (fileError) {
      console.warn('Failed to delete photo file:', photo.file_path);
    }
    
    // 데이터베이스에서 삭제
    db.prepare('DELETE FROM photos WHERE id = ?').run(photoId);
    
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Failed to delete photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
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
      FROM photos 
      GROUP BY category_id
    `).all();
    
    res.json(stats);
  } catch (error) {
    console.error('Failed to fetch category stats:', error);
    res.status(500).json({ error: 'Failed to fetch category stats' });
  }
});

export default router;