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
const videoStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/videos');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const thumbnailStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/thumbnails');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'thumb-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const uploadVideo = (0, multer_1.default)({
    storage: videoStorage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only video files are allowed'));
        }
    },
});
const uploadThumbnail = (0, multer_1.default)({
    storage: thumbnailStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed for thumbnails'));
        }
    },
});
const uploadFields = (0, multer_1.default)().fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
]);
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
      SELECT v.*, u.username as author_name 
      FROM videos v 
      JOIN users u ON v.author_id = u.id 
    `;
        const params = [];
        if (category && category !== 'all') {
            query += ' WHERE v.category_id = ?';
            params.push(category);
        }
        query += ' ORDER BY v.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));
        const videos = database_1.db.prepare(query).all(...params);
        const videosWithUrls = videos.map((video) => ({
            ...video,
            url: `/api/uploads/videos/${video.filename}`,
            thumbnail_url: video.thumbnail_path
                ? `/api/uploads/thumbnails/${path_1.default.basename(video.thumbnail_path)}`
                : null,
        }));
        res.json(videosWithUrls);
    }
    catch (error) {
        console.error('Failed to fetch videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});
router.get('/:id', (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        database_1.db.prepare('UPDATE videos SET views = views + 1 WHERE id = ?').run(videoId);
        const video = database_1.db
            .prepare(`
      SELECT v.*, u.username as author_name, u.full_name as author_full_name
      FROM videos v 
      JOIN users u ON v.author_id = u.id 
      WHERE v.id = ?
    `)
            .get(videoId);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        const videoWithUrls = {
            ...video,
            url: `/api/uploads/videos/${video.filename}`,
            thumbnail_url: video.thumbnail_path
                ? `/api/uploads/thumbnails/${path_1.default.basename(video.thumbnail_path)}`
                : null,
        };
        res.json(videoWithUrls);
    }
    catch (error) {
        console.error('Failed to fetch video:', error);
        res.status(500).json({ error: 'Failed to fetch video' });
    }
});
router.post('/', authenticateAdmin, (req, res) => {
    uploadVideo.single('video')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        uploadThumbnail.single('thumbnail')(req, res, (thumbnailErr) => {
            if (thumbnailErr && thumbnailErr.message !== 'Unexpected field') {
                return res.status(400).json({ error: thumbnailErr.message });
            }
            try {
                const { title, description, category_id, duration } = req.body;
                const author_id = req.user.id;
                if (!title || !category_id) {
                    return res.status(400).json({ error: 'Title and category are required' });
                }
                if (!req.files || !req.files['video']) {
                    return res.status(400).json({ error: 'Video file is required' });
                }
                const videoFile = req.files['video'][0];
                const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;
                const result = database_1.db
                    .prepare(`
          INSERT INTO videos (title, description, category_id, filename, original_name, file_path, file_size, thumbnail_path, duration, author_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
                    .run(title, description || '', category_id, videoFile.filename, videoFile.originalname, videoFile.path, videoFile.size, thumbnailFile ? thumbnailFile.path : null, duration || '0:00', author_id);
                res.status(201).json({
                    id: result.lastInsertRowid,
                    message: 'Video uploaded successfully',
                });
            }
            catch (error) {
                console.error('Failed to upload video:', error);
                res.status(500).json({ error: 'Failed to upload video' });
            }
        });
    });
});
router.put('/:id', authenticateAdmin, (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        const { title, description, category_id, duration } = req.body;
        if (!title || !category_id) {
            return res.status(400).json({ error: 'Title and category are required' });
        }
        const result = database_1.db
            .prepare(`
      UPDATE videos 
      SET title = ?, description = ?, category_id = ?, duration = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
            .run(title, description || '', category_id, duration || '0:00', videoId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }
        res.json({ message: 'Video updated successfully' });
    }
    catch (error) {
        console.error('Failed to update video:', error);
        res.status(500).json({ error: 'Failed to update video' });
    }
});
router.delete('/:id', authenticateAdmin, (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        const video = database_1.db.prepare('SELECT * FROM videos WHERE id = ?').get(videoId);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        try {
            if (fs_1.default.existsSync(video.file_path)) {
                fs_1.default.unlinkSync(video.file_path);
            }
        }
        catch (fileError) {
            console.warn('Failed to delete video file:', video.file_path);
        }
        if (video.thumbnail_path) {
            try {
                if (fs_1.default.existsSync(video.thumbnail_path)) {
                    fs_1.default.unlinkSync(video.thumbnail_path);
                }
            }
            catch (fileError) {
                console.warn('Failed to delete thumbnail file:', video.thumbnail_path);
            }
        }
        database_1.db.prepare('DELETE FROM videos WHERE id = ?').run(videoId);
        res.json({ message: 'Video deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete video:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});
router.get('/stats/categories', (req, res) => {
    try {
        const stats = database_1.db
            .prepare(`
      SELECT 
        category_id,
        COUNT(*) as count,
        MAX(created_at) as latest_date,
        SUM(views) as total_views
      FROM videos 
      GROUP BY category_id
    `)
            .all();
        res.json(stats);
    }
    catch (error) {
        console.error('Failed to fetch category stats:', error);
        res.status(500).json({ error: 'Failed to fetch category stats' });
    }
});
exports.default = router;
//# sourceMappingURL=videos.js.map