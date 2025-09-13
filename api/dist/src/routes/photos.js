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
        const uploadDir = path_1.default.join(__dirname, '../../uploads/photos');
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
    limits: { fileSize: 10 * 1024 * 1024 },
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
        const { category, limit = 50, offset = 0 } = req.query;
        let query = `
      SELECT p.*, u.username as author_name 
      FROM photos p 
      JOIN users u ON p.author_id = u.id 
    `;
        const params = [];
        if (category && category !== 'all') {
            query += ' WHERE p.category_id = ?';
            params.push(category);
        }
        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));
        const photos = database_1.db.prepare(query).all(...params);
        const photosWithUrls = photos.map(photo => ({
            ...photo,
            url: `/api/uploads/photos/${photo.filename}`
        }));
        res.json(photosWithUrls);
    }
    catch (error) {
        console.error('Failed to fetch photos:', error);
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});
router.get('/:id', (req, res) => {
    try {
        const photoId = parseInt(req.params.id);
        const photo = database_1.db.prepare(`
      SELECT p.*, u.username as author_name, u.full_name as author_full_name
      FROM photos p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.id = ?
    `).get(photoId);
        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }
        const photoWithUrl = {
            ...photo,
            url: `/api/uploads/photos/${photo.filename}`
        };
        res.json(photoWithUrl);
    }
    catch (error) {
        console.error('Failed to fetch photo:', error);
        res.status(500).json({ error: 'Failed to fetch photo' });
    }
});
router.post('/', authenticateAdmin, upload.array('photos', 5), (req, res) => {
    try {
        const { title, description, category_id } = req.body;
        const author_id = req.user.id;
        if (!title || !category_id) {
            return res.status(400).json({ error: 'Title and category are required' });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'At least one photo is required' });
        }
        const photoIds = [];
        const stmt = database_1.db.prepare(`
      INSERT INTO photos (title, description, category_id, filename, original_name, file_path, file_size, author_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const photoTitle = req.files.length > 1 ? `${title} ${i + 1}` : title;
            const result = stmt.run(photoTitle, description || '', category_id, file.filename, file.originalname, file.path, file.size, author_id);
            photoIds.push(result.lastInsertRowid);
        }
        res.status(201).json({
            ids: photoIds,
            count: photoIds.length,
            message: `${photoIds.length} photo(s) uploaded successfully`
        });
    }
    catch (error) {
        console.error('Failed to upload photos:', error);
        res.status(500).json({ error: 'Failed to upload photos' });
    }
});
router.put('/:id', authenticateAdmin, (req, res) => {
    try {
        const photoId = parseInt(req.params.id);
        const { title, description, category_id } = req.body;
        if (!title || !category_id) {
            return res.status(400).json({ error: 'Title and category are required' });
        }
        const result = database_1.db.prepare(`
      UPDATE photos 
      SET title = ?, description = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, description || '', category_id, photoId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Photo not found' });
        }
        res.json({ message: 'Photo updated successfully' });
    }
    catch (error) {
        console.error('Failed to update photo:', error);
        res.status(500).json({ error: 'Failed to update photo' });
    }
});
router.delete('/:id', authenticateAdmin, (req, res) => {
    try {
        const photoId = parseInt(req.params.id);
        const photo = database_1.db.prepare('SELECT * FROM photos WHERE id = ?').get(photoId);
        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }
        try {
            if (fs_1.default.existsSync(photo.file_path)) {
                fs_1.default.unlinkSync(photo.file_path);
            }
        }
        catch (fileError) {
            console.warn('Failed to delete photo file:', photo.file_path);
        }
        database_1.db.prepare('DELETE FROM photos WHERE id = ?').run(photoId);
        res.json({ message: 'Photo deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete photo:', error);
        res.status(500).json({ error: 'Failed to delete photo' });
    }
});
router.get('/stats/categories', (req, res) => {
    try {
        const stats = database_1.db.prepare(`
      SELECT 
        category_id,
        COUNT(*) as count,
        MAX(created_at) as latest_date
      FROM photos 
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
//# sourceMappingURL=photos.js.map