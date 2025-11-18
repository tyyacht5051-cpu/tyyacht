"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../db/database");
const auth_1 = require("../middleware/auth");
const env_1 = require("../config/env");
const fileSystem_1 = require("../utils/fileSystem");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(env_1.config.UPLOAD_PATH, 'notices');
        (0, fileSystem_1.ensureDirectory)(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.hwp', '.hwpx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
            return;
        }
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
        }
        else {
            console.error(`File type not allowed: ${file.originalname}, MIME: ${file.mimetype}, Extension: ${ext}`);
            cb(new Error('File type not allowed'));
        }
    }
});
router.get('/', (req, res) => {
    try {
        const { category, limit = 20, offset = 0 } = req.query;
        let query = `
      SELECT n.*, u.username as author_name 
      FROM notices n 
      JOIN users u ON n.author_id = u.id 
    `;
        const params = [];
        if (category && category !== 'all') {
            query += ' WHERE n.category_id = ?';
            params.push(category);
        }
        query += ' ORDER BY n.important DESC, n.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));
        const notices = database_1.db.prepare(query).all(...params);
        const noticesWithImages = notices.map(notice => {
            const images = database_1.db.prepare('SELECT * FROM notice_images WHERE notice_id = ?').all(notice.id);
            const files = database_1.db.prepare('SELECT * FROM notice_files WHERE notice_id = ?').all(notice.id);
            const imagesWithUrls = images.map(image => ({
                ...image,
                url: `/api/uploads/notices/${image.filename}`
            }));
            return { ...notice, images, files: imagesWithUrls };
        });
        res.json(noticesWithImages);
    }
    catch (error) {
        console.error('Failed to fetch notices:', error);
        res.status(500).json({ error: 'Failed to fetch notices' });
    }
});
router.get('/:id', (req, res) => {
    try {
        const noticeId = parseInt(req.params.id);
        database_1.db.prepare('UPDATE notices SET views = views + 1 WHERE id = ?').run(noticeId);
        const notice = database_1.db.prepare(`
      SELECT n.*, u.username as author_name, u.full_name as author_full_name
      FROM notices n
      JOIN users u ON n.author_id = u.id
      WHERE n.id = ?
    `).get(noticeId);
        if (!notice) {
            return res.status(404).json({ error: 'Notice not found' });
        }
        const images = database_1.db.prepare('SELECT * FROM notice_images WHERE notice_id = ?').all(noticeId);
        const files = database_1.db.prepare('SELECT * FROM notice_files WHERE notice_id = ?').all(noticeId);
        const imagesWithUrls = images.map(image => ({
            ...image,
            url: `/api/uploads/notices/${image.filename}`
        }));
        const filesWithUrls = files.map((file) => ({
            ...file,
            file_path: `/api/uploads/notices/${file.filename}`
        }));
        res.json({ ...notice, images: imagesWithUrls, files: filesWithUrls });
    }
    catch (error) {
        console.error('Failed to fetch notice:', error);
        res.status(500).json({ error: 'Failed to fetch notice' });
    }
});
router.post('/:id/view', (req, res) => {
    try {
        const noticeId = parseInt(req.params.id);
        const notice = database_1.db.prepare('SELECT id FROM notices WHERE id = ?').get(noticeId);
        if (!notice) {
            return res.status(404).json({ error: 'Notice not found' });
        }
        database_1.db.prepare('UPDATE notices SET views = views + 1 WHERE id = ?').run(noticeId);
        res.json({ message: 'View count incremented' });
    }
    catch (error) {
        console.error('Failed to increment view count:', error);
        res.status(500).json({ error: 'Failed to increment view count' });
    }
});
router.get('/:id/adjacent', (req, res) => {
    try {
        const noticeId = parseInt(req.params.id);
        const { category } = req.query;
        const currentNotice = database_1.db.prepare('SELECT category_id FROM notices WHERE id = ?').get(noticeId);
        if (!currentNotice) {
            return res.status(404).json({ error: 'Notice not found' });
        }
        const categoryFilter = category || currentNotice.category_id;
        const nextNotice = database_1.db.prepare(`
      SELECT id, title FROM notices
      WHERE id > ? AND category_id = ?
      ORDER BY id ASC
      LIMIT 1
    `).get(noticeId, categoryFilter);
        const prevNotice = database_1.db.prepare(`
      SELECT id, title FROM notices
      WHERE id < ? AND category_id = ?
      ORDER BY id DESC
      LIMIT 1
    `).get(noticeId, categoryFilter);
        res.json({
            prev: prevNotice || null,
            next: nextNotice || null
        });
    }
    catch (error) {
        console.error('Failed to fetch adjacent notices:', error);
        res.status(500).json({ error: 'Failed to fetch adjacent notices' });
    }
});
router.post('/draft', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const { title = '새 공지사항', content = '내용을 입력하세요...', category_id, important } = req.body;
        const author_id = req.user?.id;
        if (!category_id) {
            return res.status(400).json({ error: 'Category is required' });
        }
        const importantValue = important === 'true' || important === true ? 1 : 0;
        const result = database_1.db.prepare(`
      INSERT INTO notices (title, content, category_id, important, author_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, content, category_id, importantValue, author_id);
        const noticeId = result.lastInsertRowid;
        res.status(201).json({ id: noticeId, message: 'Draft notice created successfully' });
    }
    catch (error) {
        console.error('Failed to create draft notice:', error);
        res.status(500).json({ error: 'Failed to create draft notice' });
    }
});
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, upload.array('images', 3), (req, res) => {
    try {
        const { title, content, category_id, important } = req.body;
        const author_id = req.user?.id;
        if (!title || !content || !category_id) {
            return res.status(400).json({ error: 'Title, content, and category are required' });
        }
        const importantValue = important === 'true' || important === true ? 1 : 0;
        const result = database_1.db.prepare(`
      INSERT INTO notices (title, content, category_id, important, author_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, content, category_id, importantValue, author_id);
        const noticeId = result.lastInsertRowid;
        const files = req.files;
        if (files && files.length > 0) {
            for (const file of files) {
                const isImage = file.mimetype.startsWith('image/');
                const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
                if (isImage) {
                    database_1.db.prepare(`
              INSERT INTO notice_images (notice_id, filename, original_name,
  file_path, file_size)
              VALUES (?, ?, ?, ?, ?)
            `).run(noticeId, file.filename, originalName, file.path, file.size);
                }
                else {
                    database_1.db.prepare(`
              INSERT INTO notice_files (notice_id, filename, original_name,
  file_path, file_size, file_type)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(noticeId, file.filename, originalName, file.path, file.size, file.mimetype);
                }
            }
        }
        res.status(201).json({ id: noticeId, message: 'Notice created successfully' });
    }
    catch (error) {
        console.error('Failed to create notice:', error);
        res.status(500).json({ error: 'Failed to create notice' });
    }
});
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, upload.array('images', 3), (req, res) => {
    try {
        const noticeId = parseInt(req.params.id);
        const { title, content, category_id, important } = req.body;
        if (!title || !content || !category_id) {
            return res.status(400).json({ error: 'Title, content, and category are required' });
        }
        const importantValue = important === 'true' || important === true ? 1 : 0;
        const result = database_1.db.prepare(`
      UPDATE notices
      SET title = ?, content = ?, category_id = ?, important = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, content, category_id, importantValue, noticeId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Notice not found' });
        }
        const files = req.files;
        if (files && files.length > 0) {
            for (const file of files) {
                const isImage = file.mimetype.startsWith('image/');
                const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
                if (isImage) {
                    database_1.db.prepare(`
              INSERT INTO notice_images (notice_id, filename, original_name,
  file_path, file_size)
              VALUES (?, ?, ?, ?, ?)
            `).run(noticeId, file.filename, originalName, file.path, file.size);
                }
                else {
                    database_1.db.prepare(`
              INSERT INTO notice_files (notice_id, filename, original_name,
  file_path, file_size, file_type)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(noticeId, file.filename, originalName, file.path, file.size, file.mimetype);
                }
            }
        }
        res.json({ message: 'Notice updated successfully' });
    }
    catch (error) {
        console.error('Failed to update notice:', error);
        res.status(500).json({ error: 'Failed to update notice' });
    }
});
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const noticeId = parseInt(req.params.id);
        const images = database_1.db.prepare('SELECT * FROM notice_images WHERE notice_id = ?').all(noticeId);
        const files = database_1.db.prepare('SELECT file_path FROM notice_files WHERE notice_id = ?').all(noticeId);
        for (const file of files) {
            (0, fileSystem_1.safeDeleteFile)(file.file_path);
        }
        for (const image of images) {
            (0, fileSystem_1.safeDeleteFile)(image.file_path);
        }
        const result = database_1.db.prepare('DELETE FROM notices WHERE id = ?').run(noticeId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Notice not found' });
        }
        res.json({ message: 'Notice deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete notice:', error);
        res.status(500).json({ error: 'Failed to delete notice' });
    }
});
router.delete('/images/:imageId', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const imageId = parseInt(req.params.imageId);
        const image = database_1.db.prepare('SELECT * FROM notice_images WHERE id = ?').get(imageId);
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        (0, fileSystem_1.safeDeleteFile)(image.file_path);
        database_1.db.prepare('DELETE FROM notice_images WHERE id = ?').run(imageId);
        res.json({ message: 'Image deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});
router.delete('/:noticeId/files/:fileId', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const fileId = parseInt(req.params.fileId);
        const noticeId = parseInt(req.params.noticeId);
        const file = database_1.db.prepare('SELECT * FROM notice_files WHERE id = ? AND notice_id = ?').get(fileId, noticeId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        (0, fileSystem_1.safeDeleteFile)(file.file_path);
        database_1.db.prepare('DELETE FROM notice_files WHERE id = ?').run(fileId);
        res.json({ message: 'File deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});
router.patch('/:id/status', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const noticeId = parseInt(req.params.id);
        const { published } = req.body;
        if (typeof published !== 'boolean') {
            return res.status(400).json({ error: 'Published status must be a boolean' });
        }
        const result = database_1.db.prepare(`
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
    }
    catch (error) {
        console.error('Failed to update notice status:', error);
        res.status(500).json({ error: 'Failed to update notice status' });
    }
});
router.get('/stats/categories', (req, res) => {
    try {
        const stats = database_1.db.prepare(`
      SELECT
        category_id,
        COUNT(*) as count,
        MAX(created_at) as latest_date
      FROM notices
      GROUP BY category_id
    `).all();
        res.json(stats);
    }
    catch (error) {
        console.error('Failed to fetch category stats:', error);
        res.status(500).json({ error: 'Failed to fetch category stats' });
    }
});
exports.default = router;
//# sourceMappingURL=notices.js.map