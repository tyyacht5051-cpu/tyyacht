import express from 'express';
import multer from 'multer';
import path from 'path';
import { db } from '../db/database';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { config } from '../config/env';
import { ensureDirectory, safeDeleteFile } from '../utils/fileSystem';

const router = express.Router();

// 동영상 파일 업로드 설정
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), config.UPLOAD_PATH, 'videos');
        ensureDirectory(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

// 썸네일 이미지 업로드 설정
const thumbnailStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), config.UPLOAD_PATH, 'thumbnails');
        ensureDirectory(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'thumb-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const uploadVideo = multer({
    storage: videoStorage,
    limits: { fileSize: 1000 * 1024 * 1024 }, // 1GB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'));
        }
    },
});

const uploadThumbnail = multer({
    storage: thumbnailStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for thumbnails'));
        }
    },
});

// 복합 업로드 설정
const uploadFields = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            if (file.fieldname === 'video') {
                const uploadDir = path.join(process.cwd(), config.UPLOAD_PATH, 'videos');
                ensureDirectory(uploadDir);
                cb(null, uploadDir);
            } else if (file.fieldname === 'thumbnail') {
                const uploadDir = path.join(process.cwd(), config.UPLOAD_PATH, 'thumbnails');
                ensureDirectory(uploadDir);
                cb(null, uploadDir);
            } else {
                cb(new Error('Unknown field'), '');
            }
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            if (file.fieldname === 'thumbnail') {
                cb(null, 'thumb-' + uniqueSuffix + path.extname(file.originalname));
            } else {
                cb(null, uniqueSuffix + path.extname(file.originalname));
            }
        }
    }),
    limits: { fileSize: 1000 * 1024 * 1024 }, // 1GB limit
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'video' && file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else if (file.fieldname === 'thumbnail' && file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type for ${file.fieldname}`));
        }
    }
}).fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
]);

// 인터페이스 정의
interface Video {
    id: number;
    title: string;
    description: string;
    category_id: string;
    filename: string;
    original_name: string;
    file_path: string;
    file_size: number;
    thumbnail_path: string;
    duration: string;
    views: number;
    author_id: number;
    created_at: string;
    updated_at: string;
}


// 동영상 목록 조회
router.get('/', (req, res) => {
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

        const videos = db.prepare(query).all(...params) as Video[];

        // 파일 경로를 웹에서 접근 가능한 URL로 변환
        const videosWithUrls = videos.map((video) => ({
            ...video,
            url: `/api/uploads/videos/${video.filename}`,
            thumbnail_url: video.thumbnail_path
                ? `/api/uploads/thumbnails/${path.basename(video.thumbnail_path)}`
                : null,
        }));

        res.json(videosWithUrls);
    } catch (error) {
        console.error('Failed to fetch videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

// 동영상 상세 조회
router.get('/:id', (req, res) => {
    try {
        const videoId = parseInt(req.params.id);

        // 조회수 증가
        db.prepare('UPDATE videos SET views = views + 1 WHERE id = ?').run(videoId);

        const video = db
            .prepare(
                `
      SELECT v.*, u.username as author_name, u.full_name as author_full_name
      FROM videos v 
      JOIN users u ON v.author_id = u.id 
      WHERE v.id = ?
    `
            )
            .get(videoId) as Video;

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const videoWithUrls = {
            ...video,
            url: `/api/uploads/videos/${video.filename}`,
            thumbnail_url: video.thumbnail_path
                ? `/api/uploads/thumbnails/${path.basename(video.thumbnail_path)}`
                : null,
        };

        res.json(videoWithUrls);
    } catch (error) {
        console.error('Failed to fetch video:', error);
        res.status(500).json({ error: 'Failed to fetch video' });
    }
});

// 동영상 업로드 (관리자만)
router.post('/', authenticateToken, requireAdmin, uploadFields, (req: AuthenticatedRequest, res) => {
    try {
        const { title, description, category_id, duration } = req.body;
        const author_id = req.user?.id;

        if (!title || !category_id) {
            return res.status(400).json({ error: 'Title and category are required' });
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        if (!files || !files['video'] || files['video'].length === 0) {
            return res.status(400).json({ error: 'Video file is required' });
        }

        const videoFile = files['video'][0];
        const thumbnailFile = files['thumbnail'] ? files['thumbnail'][0] : null;

        // 동영상 정보 데이터베이스에 저장
        const result = db
            .prepare(
                `
          INSERT INTO videos (title, description, category_id, filename, original_name, file_path, file_size, thumbnail_path, duration, author_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
            )
            .run(
                title,
                description || '',
                category_id,
                videoFile.filename,
                videoFile.originalname,
                videoFile.path,
                videoFile.size,
                thumbnailFile ? thumbnailFile.path : null,
                duration || '0:00',
                author_id
            );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Video uploaded successfully',
        });
    } catch (error) {
        console.error('Failed to upload video:', error);
        res.status(500).json({ error: 'Failed to upload video' });
    }
});

// 동영상 수정 (관리자만)
router.put('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
    try {
        const videoId = parseInt(req.params.id);
        const { title, description, category_id, duration } = req.body;

        if (!title || !category_id) {
            return res.status(400).json({ error: 'Title and category are required' });
        }

        const result = db
            .prepare(
                `
      UPDATE videos 
      SET title = ?, description = ?, category_id = ?, duration = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
            )
            .run(title, description || '', category_id, duration || '0:00', videoId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }

        res.json({ message: 'Video updated successfully' });
    } catch (error) {
        console.error('Failed to update video:', error);
        res.status(500).json({ error: 'Failed to update video' });
    }
});

// 동영상 삭제 (관리자만)
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
    try {
        const videoId = parseInt(req.params.id);

        // 동영상 정보 조회
        const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(videoId) as Video;

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // 동영상 파일 삭제
        safeDeleteFile(video.file_path);

        // 썸네일 파일 삭제
        if (video.thumbnail_path) {
            safeDeleteFile(video.thumbnail_path);
        }

        // 데이터베이스에서 삭제
        db.prepare('DELETE FROM videos WHERE id = ?').run(videoId);

        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Failed to delete video:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

// 카테고리별 통계
router.get('/stats/categories', (req, res) => {
    try {
        const stats = db
            .prepare(
                `
      SELECT 
        category_id,
        COUNT(*) as count,
        MAX(created_at) as latest_date,
        SUM(views) as total_views
      FROM videos 
      GROUP BY category_id
    `
            )
            .all();

        res.json(stats);
    } catch (error) {
        console.error('Failed to fetch category stats:', error);
        res.status(500).json({ error: 'Failed to fetch category stats' });
    }
});

export default router;
