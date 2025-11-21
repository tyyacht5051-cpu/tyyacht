import express, { Request, Response } from 'express';
import db from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 이미지 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/popups');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'popup-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('이미지 파일만 업로드 가능합니다. (jpeg, jpg, png, gif)'));
        }
    }
});

// 활성화된 팝업 목록 조회 (인증 불필요 - 모든 사용자)
router.get('/', async (req: Request, res: Response) => {
    try {
        const now = new Date().toISOString();

        const popups = db.prepare(`
            SELECT id, title, content, image_url, link_url, display_order
            FROM popups
            WHERE is_active = 1
              AND (start_date IS NULL OR start_date <= ?)
              AND (end_date IS NULL OR end_date >= ?)
            ORDER BY display_order ASC, created_at DESC
        `).all(now, now);

        res.json(popups);
    } catch (error) {
        console.error('팝업 목록 조회 오류:', error);
        res.status(500).json({ error: '팝업 목록 조회 실패' });
    }
});

// 모든 팝업 목록 조회 (관리자만)
router.get('/admin', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const popups = db.prepare(`
            SELECT p.*, u.username as created_by_name
            FROM popups p
            LEFT JOIN users u ON p.created_by = u.id
            ORDER BY p.display_order ASC, p.created_at DESC
        `).all();

        res.json(popups);
    } catch (error) {
        console.error('관리자 팝업 목록 조회 오류:', error);
        res.status(500).json({ error: '팝업 목록 조회 실패' });
    }
});

// 특정 팝업 조회
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const popup = db.prepare(`
            SELECT p.*, u.username as created_by_name
            FROM popups p
            LEFT JOIN users u ON p.created_by = u.id
            WHERE p.id = ?
        `).get(id);

        if (!popup) {
            return res.status(404).json({ error: '팝업을 찾을 수 없습니다' });
        }

        res.json(popup);
    } catch (error) {
        console.error('팝업 조회 오류:', error);
        res.status(500).json({ error: '팝업 조회 실패' });
    }
});

// 팝업 생성 (관리자만)
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req: Request, res: Response) => {
    try {
        const { title, content, link_url, is_active, display_order, start_date, end_date } = req.body;
        const userId = (req as any).user.userId;

        if (!title) {
            return res.status(400).json({ error: '제목은 필수입니다' });
        }

        const image_url = req.file ? `/api/uploads/popups/${req.file.filename}` : null;

        const result = db.prepare(`
            INSERT INTO popups (title, content, image_url, link_url, is_active, display_order, start_date, end_date, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            title,
            content || null,
            image_url,
            link_url || null,
            is_active === 'true' || is_active === '1' ? 1 : 0,
            parseInt(display_order) || 0,
            start_date || null,
            end_date || null,
            userId
        );

        const newPopup = db.prepare('SELECT * FROM popups WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json(newPopup);
    } catch (error) {
        console.error('팝업 생성 오류:', error);
        res.status(500).json({ error: '팝업 생성 실패' });
    }
});

// 팝업 수정 (관리자만)
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, link_url, is_active, display_order, start_date, end_date, remove_image } = req.body;

        const existingPopup: any = db.prepare('SELECT * FROM popups WHERE id = ?').get(id);

        if (!existingPopup) {
            return res.status(404).json({ error: '팝업을 찾을 수 없습니다' });
        }

        let image_url = existingPopup.image_url;

        // 이미지 제거 요청
        if (remove_image === 'true' && existingPopup.image_url) {
            const imagePath = path.join(__dirname, '../../', existingPopup.image_url.replace('/api/', ''));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            image_url = null;
        }

        // 새 이미지 업로드
        if (req.file) {
            // 기존 이미지 삭제
            if (existingPopup.image_url) {
                const oldImagePath = path.join(__dirname, '../../', existingPopup.image_url.replace('/api/', ''));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            image_url = `/api/uploads/popups/${req.file.filename}`;
        }

        db.prepare(`
            UPDATE popups
            SET title = ?, content = ?, image_url = ?, link_url = ?, is_active = ?,
                display_order = ?, start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            title || existingPopup.title,
            content !== undefined ? content : existingPopup.content,
            image_url,
            link_url !== undefined ? link_url : existingPopup.link_url,
            is_active !== undefined ? (is_active === 'true' || is_active === '1' ? 1 : 0) : existingPopup.is_active,
            display_order !== undefined ? parseInt(display_order) : existingPopup.display_order,
            start_date !== undefined ? start_date : existingPopup.start_date,
            end_date !== undefined ? end_date : existingPopup.end_date,
            id
        );

        const updatedPopup = db.prepare('SELECT * FROM popups WHERE id = ?').get(id);

        res.json(updatedPopup);
    } catch (error) {
        console.error('팝업 수정 오류:', error);
        res.status(500).json({ error: '팝업 수정 실패' });
    }
});

// 팝업 삭제 (관리자만)
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const popup: any = db.prepare('SELECT * FROM popups WHERE id = ?').get(id);

        if (!popup) {
            return res.status(404).json({ error: '팝업을 찾을 수 없습니다' });
        }

        // 이미지 파일 삭제
        if (popup.image_url) {
            const imagePath = path.join(__dirname, '../../', popup.image_url.replace('/api/', ''));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        db.prepare('DELETE FROM popups WHERE id = ?').run(id);

        res.json({ message: '팝업이 삭제되었습니다' });
    } catch (error) {
        console.error('팝업 삭제 오류:', error);
        res.status(500).json({ error: '팝업 삭제 실패' });
    }
});

// 팝업 활성화/비활성화 토글 (관리자만)
router.patch('/:id/toggle', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const popup: any = db.prepare('SELECT is_active FROM popups WHERE id = ?').get(id);

        if (!popup) {
            return res.status(404).json({ error: '팝업을 찾을 수 없습니다' });
        }

        const newStatus = popup.is_active ? 0 : 1;

        db.prepare('UPDATE popups SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run(newStatus, id);

        res.json({ message: '팝업 상태가 변경되었습니다', is_active: newStatus });
    } catch (error) {
        console.error('팝업 상태 변경 오류:', error);
        res.status(500).json({ error: '팝업 상태 변경 실패' });
    }
});

export default router;
