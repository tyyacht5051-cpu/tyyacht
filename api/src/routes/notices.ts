import express from 'express';
import multer from 'multer';
import path from 'path';
import { db } from '../db/database';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { config } from '../config/env';
import { ensureDirectory, safeDeleteFile } from '../utils/fileSystem';

const router = express.Router();

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(config.UPLOAD_PATH, 'notices');
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
 fileFilter: (req, file, cb) => {
      // 허용된 파일 확장자 (한글 파일의 MIME 타입이 브라우저마다 다를 수 있어 확장자로도 체크)
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.hwp', '.hwpx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const ext = path.extname(file.originalname).toLowerCase();

      // 확장자로 먼저 체크
      if (allowedExtensions.includes(ext)) {
        cb(null, true);
        return;
      }

      // MIME 타입으로도 체크
      const allowedMimes = [
        'image/',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
        'application/x-zip-compressed',
        'application/x-hwp',
        'application/haansofthwp',
        'application/vnd.hancom.hwpx'
      ];

      if (allowedMimes.some(type => file.mimetype.startsWith(type) || file.mimetype === type)) {
        cb(null, true);
      } else {
        console.error(`File type not allowed: ${file.originalname}, MIME: ${file.mimetype}, Extension: ${ext}`);
        cb(new Error('File type not allowed'));
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
  published: number;
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
       const files = db.prepare('SELECT * FROM notice_files WHERE notice_id = ?').all(notice.id);     
   
 // 이미지 파일 경로를 웹에서 접근 가능한 URL로 변환
      const imagesWithUrls = images.map(image => ({
        ...image,
        url: `/api/uploads/notices/${image.filename}`
      }));
      return { ...notice, images, files: imagesWithUrls };
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

      // 파일 조회 추가
      const files = db.prepare('SELECT * FROM notice_files WHERE notice_id = ?').all(noticeId);

    // 이미지 파일 경로를 웹에서 접근 가능한 URL로 변환
    const imagesWithUrls = images.map(image => ({
      ...image,
      url: `/api/uploads/notices/${image.filename}`
    }));

    // 첨부 파일 경로를 웹에서 접근 가능한 URL로 변환
    const filesWithUrls = files.map((file: any) => ({
      ...file,
      file_path: `/api/uploads/notices/${file.filename}`
    }));

    res.json({ ...notice, images: imagesWithUrls, files: filesWithUrls });
  } catch (error) {
    console.error('Failed to fetch notice:', error);
    res.status(500).json({ error: 'Failed to fetch notice' });
  }
});

// 조회수 증가 (별도 엔드포인트)
router.post('/:id/view', (req, res) => {
  try {
    const noticeId = parseInt(req.params.id);

    // 공지사항 존재 확인
    const notice = db.prepare('SELECT id FROM notices WHERE id = ?').get(noticeId);

    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    // 조회수 증가
    db.prepare('UPDATE notices SET views = views + 1 WHERE id = ?').run(noticeId);

    res.json({ message: 'View count incremented' });
  } catch (error) {
    console.error('Failed to increment view count:', error);
    res.status(500).json({ error: 'Failed to increment view count' });
  }
});

// 이전/다음 공지사항 조회
router.get('/:id/adjacent', (req, res) => {
  try {
    const noticeId = parseInt(req.params.id);
    const { category } = req.query;

    // 현재 공지사항의 카테고리 확인
    const currentNotice = db.prepare('SELECT category_id FROM notices WHERE id = ?').get(noticeId) as { category_id: string };

    if (!currentNotice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    const categoryFilter = category || currentNotice.category_id;

    // 이전 공지사항 (더 높은 ID, 최신)
    const nextNotice = db.prepare(`
      SELECT id, title FROM notices
      WHERE id > ? AND category_id = ?
      ORDER BY id ASC
      LIMIT 1
    `).get(noticeId, categoryFilter) as { id: number; title: string } | undefined;

    // 다음 공지사항 (더 낮은 ID, 이전)
    const prevNotice = db.prepare(`
      SELECT id, title FROM notices
      WHERE id < ? AND category_id = ?
      ORDER BY id DESC
      LIMIT 1
    `).get(noticeId, categoryFilter) as { id: number; title: string } | undefined;

    res.json({
      prev: prevNotice || null,
      next: nextNotice || null
    });
  } catch (error) {
    console.error('Failed to fetch adjacent notices:', error);
    res.status(500).json({ error: 'Failed to fetch adjacent notices' });
  }
});

// 드래프트 공지사항 생성 (관리자만)
router.post('/draft', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { title = '새 공지사항', content = '내용을 입력하세요...', category_id, important = false } = req.body;
    const author_id = req.user?.id;

    if (!category_id) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // 드래프트 공지사항 생성
    const result = db.prepare(`
      INSERT INTO notices (title, content, category_id, important, author_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, content, category_id, important ? 1 : 0, author_id);

    const noticeId = result.lastInsertRowid;

    res.status(201).json({ id: noticeId, message: 'Draft notice created successfully' });
  } catch (error) {
    console.error('Failed to create draft notice:', error);
    res.status(500).json({ error: 'Failed to create draft notice' });
  }
});

// 공지사항 작성 (관리자만)
router.post('/', authenticateToken, requireAdmin, upload.array('images', 3), (req: AuthenticatedRequest, res) => {
  try {
    const { title, content, category_id, important = false } = req.body;
    const author_id = req.user?.id;
    
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
    const files = req.files as Express.Multer.File[];
         if (files && files.length > 0) {
        for (const file of files) {
          // 이미지 파일인지 확인
          const isImage = file.mimetype.startsWith('image/');
          // 한글 파일명 인코딩 수정 (multer는 latin1로 인코딩하므로 utf-8로 변환)
          const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

          if (isImage) {
            // 이미지는 notice_images 테이블에 저장
            db.prepare(`
              INSERT INTO notice_images (notice_id, filename, original_name,
  file_path, file_size)
              VALUES (?, ?, ?, ?, ?)
            `).run(noticeId, file.filename, originalName, file.path, file.size);
          } else {
            // 일반 파일은 notice_files 테이블에 저장
            db.prepare(`
              INSERT INTO notice_files (notice_id, filename, original_name,
  file_path, file_size, file_type)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(noticeId, file.filename, originalName, file.path, file.size,
  file.mimetype);
          }
        }
      } 
    res.status(201).json({ id: noticeId, message: 'Notice created successfully' });
  } catch (error) {
    console.error('Failed to create notice:', error);
    res.status(500).json({ error: 'Failed to create notice' });
  }
});

// 공지사항 수정 (관리자만)
router.put('/:id', authenticateToken, requireAdmin, upload.array('images', 3), (req: AuthenticatedRequest, res) => {
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
    const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        for (const file of files) {
          const isImage = file.mimetype.startsWith('image/');
          // 한글 파일명 인코딩 수정 (multer는 latin1로 인코딩하므로 utf-8로 변환)
          const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

          if (isImage) {
            db.prepare(`
              INSERT INTO notice_images (notice_id, filename, original_name,
  file_path, file_size)
              VALUES (?, ?, ?, ?, ?)
            `).run(noticeId, file.filename, originalName, file.path, file.size);
          } else {
            db.prepare(`
              INSERT INTO notice_files (notice_id, filename, original_name,
  file_path, file_size, file_type)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(noticeId, file.filename, originalName, file.path, file.size,
  file.mimetype);
          }
        }
      }    
    res.json({ message: 'Notice updated successfully' });
  } catch (error) {
    console.error('Failed to update notice:', error);
    res.status(500).json({ error: 'Failed to update notice' });
  }
});

// 공지사항 삭제 (관리자만)
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const noticeId = parseInt(req.params.id);
    
    // 첨부된 이미지 파일 삭제
    const images = db.prepare('SELECT * FROM notice_images WHERE notice_id = ?').all(noticeId) as NoticeImage[];

// 일반 파일 삭제 추가
     const files = db.prepare('SELECT file_path FROM notice_files WHERE notice_id = ?').all(noticeId) as Array<{ file_path: string }>;
    for (const file of files) {
      safeDeleteFile(file.file_path);
    }
    for (const image of images) {
      safeDeleteFile(image.file_path);
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
router.delete('/images/:imageId', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const imageId = parseInt(req.params.imageId);

    const image = db.prepare('SELECT * FROM notice_images WHERE id = ?').get(imageId) as NoticeImage;

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // 파일 삭제
    safeDeleteFile(image.file_path);

    // 데이터베이스에서 삭제
    db.prepare('DELETE FROM notice_images WHERE id = ?').run(imageId);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Failed to delete image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// 파일 삭제 (관리자만)
router.delete('/:noticeId/files/:fileId', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const fileId = parseInt(req.params.fileId);
    const noticeId = parseInt(req.params.noticeId);

    const file = db.prepare('SELECT * FROM notice_files WHERE id = ? AND notice_id = ?').get(fileId, noticeId) as any;

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // 파일 삭제
    safeDeleteFile(file.file_path);

    // 데이터베이스에서 삭제
    db.prepare('DELETE FROM notice_files WHERE id = ?').run(fileId);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Failed to delete file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// 공지사항 상태 변경 (게시/비게시)
router.patch('/:id/status', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const noticeId = parseInt(req.params.id);
    const { published } = req.body;

    if (typeof published !== 'boolean') {
      return res.status(400).json({ error: 'Published status must be a boolean' });
    }

    const result = db.prepare(`
      UPDATE notices
      SET published = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(published ? 1 : 0, noticeId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    res.json({
      message: `Notice ${published ? 'published' : 'unpublished'} successfully`,
      published
    });
  } catch (error) {
    console.error('Failed to update notice status:', error);
    res.status(500).json({ error: 'Failed to update notice status' });
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
