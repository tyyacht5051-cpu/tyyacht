"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const database_1 = require("../db/database");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/notices');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
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
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tyyacht-jwt-secret-key-2024-development');
        const user = database_1.db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
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
            return { ...notice, images };
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
        res.json({ ...notice, images });
    }
    catch (error) {
        console.error('Failed to fetch notice:', error);
        res.status(500).json({ error: 'Failed to fetch notice' });
    }
});
router.post('/', authenticateAdmin, upload.array('images', 3), (req, res) => {
    try {
        const { title, content, category_id, important = false } = req.body;
        const author_id = req.user.id;
        if (!title || !content || !category_id) {
            return res.status(400).json({ error: 'Title, content, and category are required' });
        }
        const result = database_1.db.prepare(`
      INSERT INTO notices (title, content, category_id, important, author_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, content, category_id, important ? 1 : 0, author_id);
        const noticeId = result.lastInsertRowid;
        if (req.files && req.files.length > 0) {
            const imageStmt = database_1.db.prepare(`
        INSERT INTO notice_images (notice_id, filename, original_name, file_path, file_size)
        VALUES (?, ?, ?, ?, ?)
      `);
            for (const file of req.files) {
                imageStmt.run(noticeId, file.filename, file.originalname, file.path, file.size);
            }
        }
        res.status(201).json({ id: noticeId, message: 'Notice created successfully' });
    }
    catch (error) {
        console.error('Failed to create notice:', error);
        res.status(500).json({ error: 'Failed to create notice' });
    }
});
router.put('/:id', authenticateAdmin, upload.array('images', 3), (req, res) => {
    try {
        const noticeId = parseInt(req.params.id);
        const { title, content, category_id, important = false } = req.body;
        if (!title || !content || !category_id) {
            return res.status(400).json({ error: 'Title, content, and category are required' });
        }
        const result = database_1.db.prepare(`
      UPDATE notices 
      SET title = ?, content = ?, category_id = ?, important = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, content, category_id, important ? 1 : 0, noticeId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Notice not found' });
        }
        if (req.files && req.files.length > 0) {
            const imageStmt = database_1.db.prepare(`
        INSERT INTO notice_images (notice_id, filename, original_name, file_path, file_size)
        VALUES (?, ?, ?, ?, ?)
      `);
            for (const file of req.files) {
                imageStmt.run(noticeId, file.filename, file.originalname, file.path, file.size);
            }
        }
        res.json({ message: 'Notice updated successfully' });
    }
    catch (error) {
        console.error('Failed to update notice:', error);
        res.status(500).json({ error: 'Failed to update notice' });
    }
});
router.delete('/:id', authenticateAdmin, (req, res) => {
    try {
        const noticeId = parseInt(req.params.id);
        const images = database_1.db.prepare('SELECT * FROM notice_images WHERE notice_id = ?').all(noticeId);
        for (const image of images) {
            try {
                if (fs_1.default.existsSync(image.file_path)) {
                    fs_1.default.unlinkSync(image.file_path);
                }
            }
            catch (fileError) {
                console.warn('Failed to delete image file:', image.file_path);
            }
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
router.delete('/images/:imageId', authenticateAdmin, (req, res) => {
    try {
        const imageId = parseInt(req.params.imageId);
        const image = database_1.db.prepare('SELECT * FROM notice_images WHERE id = ?').get(imageId);
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        try {
            if (fs_1.default.existsSync(image.file_path)) {
                fs_1.default.unlinkSync(image.file_path);
            }
        }
        catch (fileError) {
            console.warn('Failed to delete image file:', image.file_path);
        }
        database_1.db.prepare('DELETE FROM notice_images WHERE id = ?').run(imageId);
        res.json({ message: 'Image deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
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