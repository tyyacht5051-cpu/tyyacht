import express from 'express';
import multer from 'multer';
import path from 'path';
import { db } from '../db/database';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { uploadLimiter, generalLimiter } from '../middleware/rateLimiter';
import { config } from '../config/env';
import { ensureDirectory, safeDeleteFile } from '../utils/fileSystem';

const router = express.Router();

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(config.UPLOAD_PATH, 'photos');
    ensureDirectory(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// 인터페이스 정의
interface PhotoGallery {
  id: number;
  title: string;
  description: string;
  category_id: string;
  author_id: number;
  created_at: string;
  updated_at: string;
}

interface Photo {
  id: number;
  gallery_id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  display_order: number;
  created_at: string;
}


// 갤러리 목록 조회 (각 갤러리의 첫 번째 사진과 함께)
router.get('/', generalLimiter, (req, res) => {
  try {
    const { category, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT
        pg.id, pg.title, pg.description, pg.category_id, pg.author_id, pg.created_at, pg.updated_at,
        u.username as author_name,
        COUNT(p.id) as photo_count,
        MIN(p.filename) as first_photo_filename
      FROM photo_galleries pg
      JOIN users u ON pg.author_id = u.id
      LEFT JOIN photos p ON pg.id = p.gallery_id
    `;
    const params: any[] = [];

    if (category && category !== 'all') {
      query += ' WHERE pg.category_id = ?';
      params.push(category);
    }

    query += ' GROUP BY pg.id ORDER BY pg.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const galleries = db.prepare(query).all(...params);

    // 파일 경로를 웹에서 접근 가능한 URL로 변환
    const galleriesWithUrls = galleries.map((gallery: any) => ({
      ...gallery,
      url: gallery.first_photo_filename ? `/api/uploads/photos/${gallery.first_photo_filename}` : null
    }));

    res.json(galleriesWithUrls);
  } catch (error) {
    console.error('Failed to fetch galleries:', error);
    res.status(500).json({ error: 'Failed to fetch galleries' });
  }
});

// 갤러리 상세 조회 (갤러리 내 모든 사진 포함)
router.get('/:id', (req, res) => {
  try {
    const galleryId = parseInt(req.params.id);

    // 갤러리 정보 조회
    const gallery = db.prepare(`
      SELECT pg.*, u.username as author_name, u.full_name as author_full_name
      FROM photo_galleries pg
      JOIN users u ON pg.author_id = u.id
      WHERE pg.id = ?
    `).get(galleryId) as PhotoGallery;

    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    // 갤러리 내 모든 사진 조회
    const photos = db.prepare(`
      SELECT * FROM photos
      WHERE gallery_id = ?
      ORDER BY display_order, created_at
    `).all(galleryId) as Photo[];

    const photosWithUrls = photos.map(photo => ({
      ...photo,
      url: `/api/uploads/photos/${photo.filename}`
    }));

    const galleryWithPhotos = {
      ...gallery,
      photos: photosWithUrls,
      photo_count: photos.length
    };

    res.json(galleryWithPhotos);
  } catch (error) {
    console.error('Failed to fetch gallery:', error);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

// 사진 업로드 (관리자만)
router.post('/', uploadLimiter, authenticateToken, requireAdmin, upload.array('photos', 20), (req: AuthenticatedRequest, res) => {
  try {
    const { title, description, category_id } = req.body;
    const author_id = req.user?.id;

    if (!title || !category_id) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one photo is required' });
    }

    const files = req.files as Express.Multer.File[];

    // 트랜잭션으로 갤러리와 사진들을 함께 생성
    const galleryStmt = db.prepare(`
      INSERT INTO photo_galleries (title, description, category_id, author_id)
      VALUES (?, ?, ?, ?)
    `);

    const photoStmt = db.prepare(`
      INSERT INTO photos (gallery_id, filename, original_name, file_path, file_size, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // 갤러리 생성
    const galleryResult = galleryStmt.run(title, description || '', category_id, author_id);
    const galleryId = galleryResult.lastInsertRowid as number;

    // 각 파일을 갤러리에 추가
    const photoIds: number[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const photoResult = photoStmt.run(
        galleryId,
        file.filename,
        file.originalname,
        file.path,
        file.size,
        i + 1  // display_order
      );

      photoIds.push(photoResult.lastInsertRowid as number);
    }

    res.status(201).json({
      galleryId: galleryId,
      photoIds: photoIds,
      count: photoIds.length,
      message: `Gallery with ${photoIds.length} photo(s) uploaded successfully`
    });
  } catch (error) {
    console.error('Failed to upload photos:', error);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

// 갤러리 수정 (관리자만) - 갤러리 정보 수정 및 사진 추가
router.put('/:id', authenticateToken, requireAdmin, upload.array('photos', 20), (req: AuthenticatedRequest, res) => {
  try {
    const galleryId = parseInt(req.params.id);
    const { title, description, category_id } = req.body;

    if (!title || !category_id) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    // 갤러리 정보 수정
    const result = db.prepare(`
      UPDATE photo_galleries
      SET title = ?, description = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, description || '', category_id, galleryId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    // 새 사진 추가 (있는 경우)
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      // 기존 사진 개수 확인
      const existingPhotos = db.prepare('SELECT COUNT(*) as count FROM photos WHERE gallery_id = ?').get(galleryId) as { count: number };

      if (existingPhotos.count + files.length > 20) {
        return res.status(400).json({ error: 'Cannot exceed 20 photos per gallery' });
      }

      const photoStmt = db.prepare(`
        INSERT INTO photos (gallery_id, filename, original_name, file_path, file_size, display_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      files.forEach((file, index) => {
        const displayOrder = existingPhotos.count + index + 1;
        photoStmt.run(
          galleryId,
          file.filename,
          file.originalname,
          file.path,
          file.size,
          displayOrder
        );
      });
    }

    res.json({ message: 'Gallery updated successfully' });
  } catch (error) {
    console.error('Failed to update gallery:', error);
    res.status(500).json({ error: 'Failed to update gallery' });
  }
});

// 갤러리 삭제 (관리자만) - 갤러리와 포함된 모든 사진 삭제
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const galleryId = parseInt(req.params.id);

    // 갤러리 정보 조회
    const gallery = db.prepare('SELECT * FROM photo_galleries WHERE id = ?').get(galleryId) as PhotoGallery;

    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    // 갤러리에 속한 모든 사진 조회
    const photos = db.prepare('SELECT * FROM photos WHERE gallery_id = ?').all(galleryId) as Photo[];

    // 모든 사진 파일 삭제
    photos.forEach(photo => {
      safeDeleteFile(photo.file_path);
    });

    // 데이터베이스에서 사진들 삭제 (CASCADE로 자동 삭제되지만 명시적으로)
    db.prepare('DELETE FROM photos WHERE gallery_id = ?').run(galleryId);

    // 갤러리 삭제
    db.prepare('DELETE FROM photo_galleries WHERE id = ?').run(galleryId);

    res.json({
      message: 'Gallery and all photos deleted successfully',
      deletedPhotos: photos.length
    });
  } catch (error) {
    console.error('Failed to delete gallery:', error);
    res.status(500).json({ error: 'Failed to delete gallery' });
  }
});

// 개별 사진 삭제 (관리자만)
router.delete('/:galleryId/photos/:photoId', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const galleryId = parseInt(req.params.galleryId);
    const photoId = parseInt(req.params.photoId);

    // 사진 정보 조회
    const photo = db.prepare('SELECT * FROM photos WHERE id = ? AND gallery_id = ?').get(photoId, galleryId) as Photo;

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // 파일 삭제
    safeDeleteFile(photo.file_path);

    // 데이터베이스에서 삭제
    db.prepare('DELETE FROM photos WHERE id = ?').run(photoId);

    // 갤러리에 남은 사진이 있는지 확인
    const remainingPhotos = db.prepare('SELECT COUNT(*) as count FROM photos WHERE gallery_id = ?').get(galleryId) as { count: number };

    // 갤러리에 사진이 하나도 없으면 갤러리도 삭제
    if (remainingPhotos.count === 0) {
      db.prepare('DELETE FROM photo_galleries WHERE id = ?').run(galleryId);
      res.json({
        message: 'Photo deleted successfully and empty gallery removed',
        galleryDeleted: true
      });
    } else {
      res.json({
        message: 'Photo deleted successfully',
        galleryDeleted: false
      });
    }
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