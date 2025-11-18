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
const rateLimiter_1 = require("../middleware/rateLimiter");
const env_1 = require("../config/env");
const fileSystem_1 = require("../utils/fileSystem");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(env_1.config.UPLOAD_PATH, 'photos');
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
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
router.get('/', rateLimiter_1.generalLimiter, (req, res) => {
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
        const params = [];
        if (category && category !== 'all') {
            query += ' WHERE pg.category_id = ?';
            params.push(category);
        }
        query += ' GROUP BY pg.id ORDER BY pg.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));
        const galleries = database_1.db.prepare(query).all(...params);
        const galleriesWithUrls = galleries.map((gallery) => ({
            ...gallery,
            url: gallery.first_photo_filename ? `/api/uploads/photos/${gallery.first_photo_filename}` : null
        }));
        res.json(galleriesWithUrls);
    }
    catch (error) {
        console.error('Failed to fetch galleries:', error);
        res.status(500).json({ error: 'Failed to fetch galleries' });
    }
});
router.get('/:id', (req, res) => {
    try {
        const galleryId = parseInt(req.params.id);
        const gallery = database_1.db.prepare(`
      SELECT pg.*, u.username as author_name, u.full_name as author_full_name
      FROM photo_galleries pg
      JOIN users u ON pg.author_id = u.id
      WHERE pg.id = ?
    `).get(galleryId);
        if (!gallery) {
            return res.status(404).json({ error: 'Gallery not found' });
        }
        const photos = database_1.db.prepare(`
      SELECT * FROM photos
      WHERE gallery_id = ?
      ORDER BY display_order, created_at
    `).all(galleryId);
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
    }
    catch (error) {
        console.error('Failed to fetch gallery:', error);
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});
router.post('/', rateLimiter_1.uploadLimiter, auth_1.authenticateToken, auth_1.requireAdmin, upload.array('photos', 20), (req, res) => {
    try {
        const { title, description, category_id } = req.body;
        const author_id = req.user?.id;
        if (!title || !category_id) {
            return res.status(400).json({ error: 'Title and category are required' });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'At least one photo is required' });
        }
        const files = req.files;
        const galleryStmt = database_1.db.prepare(`
      INSERT INTO photo_galleries (title, description, category_id, author_id)
      VALUES (?, ?, ?, ?)
    `);
        const photoStmt = database_1.db.prepare(`
      INSERT INTO photos (gallery_id, filename, original_name, file_path, file_size, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        const galleryResult = galleryStmt.run(title, description || '', category_id, author_id);
        const galleryId = galleryResult.lastInsertRowid;
        const photoIds = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const photoResult = photoStmt.run(galleryId, file.filename, file.originalname, file.path, file.size, i + 1);
            photoIds.push(photoResult.lastInsertRowid);
        }
        res.status(201).json({
            galleryId: galleryId,
            photoIds: photoIds,
            count: photoIds.length,
            message: `Gallery with ${photoIds.length} photo(s) uploaded successfully`
        });
    }
    catch (error) {
        console.error('Failed to upload photos:', error);
        res.status(500).json({ error: 'Failed to upload photos' });
    }
});
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, upload.array('photos', 20), (req, res) => {
    try {
        const galleryId = parseInt(req.params.id);
        const { title, description, category_id } = req.body;
        if (!title || !category_id) {
            return res.status(400).json({ error: 'Title and category are required' });
        }
        const result = database_1.db.prepare(`
      UPDATE photo_galleries
      SET title = ?, description = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, description || '', category_id, galleryId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Gallery not found' });
        }
        const files = req.files;
        if (files && files.length > 0) {
            const existingPhotos = database_1.db.prepare('SELECT COUNT(*) as count FROM photos WHERE gallery_id = ?').get(galleryId);
            if (existingPhotos.count + files.length > 20) {
                return res.status(400).json({ error: 'Cannot exceed 20 photos per gallery' });
            }
            const photoStmt = database_1.db.prepare(`
        INSERT INTO photos (gallery_id, filename, original_name, file_path, file_size, display_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
            files.forEach((file, index) => {
                const displayOrder = existingPhotos.count + index + 1;
                photoStmt.run(galleryId, file.filename, file.originalname, file.path, file.size, displayOrder);
            });
        }
        res.json({ message: 'Gallery updated successfully' });
    }
    catch (error) {
        console.error('Failed to update gallery:', error);
        res.status(500).json({ error: 'Failed to update gallery' });
    }
});
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const galleryId = parseInt(req.params.id);
        const gallery = database_1.db.prepare('SELECT * FROM photo_galleries WHERE id = ?').get(galleryId);
        if (!gallery) {
            return res.status(404).json({ error: 'Gallery not found' });
        }
        const photos = database_1.db.prepare('SELECT * FROM photos WHERE gallery_id = ?').all(galleryId);
        photos.forEach(photo => {
            (0, fileSystem_1.safeDeleteFile)(photo.file_path);
        });
        database_1.db.prepare('DELETE FROM photos WHERE gallery_id = ?').run(galleryId);
        database_1.db.prepare('DELETE FROM photo_galleries WHERE id = ?').run(galleryId);
        res.json({
            message: 'Gallery and all photos deleted successfully',
            deletedPhotos: photos.length
        });
    }
    catch (error) {
        console.error('Failed to delete gallery:', error);
        res.status(500).json({ error: 'Failed to delete gallery' });
    }
});
router.delete('/:galleryId/photos/:photoId', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const galleryId = parseInt(req.params.galleryId);
        const photoId = parseInt(req.params.photoId);
        const photo = database_1.db.prepare('SELECT * FROM photos WHERE id = ? AND gallery_id = ?').get(photoId, galleryId);
        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }
        (0, fileSystem_1.safeDeleteFile)(photo.file_path);
        database_1.db.prepare('DELETE FROM photos WHERE id = ?').run(photoId);
        const remainingPhotos = database_1.db.prepare('SELECT COUNT(*) as count FROM photos WHERE gallery_id = ?').get(galleryId);
        if (remainingPhotos.count === 0) {
            database_1.db.prepare('DELETE FROM photo_galleries WHERE id = ?').run(galleryId);
            res.json({
                message: 'Photo deleted successfully and empty gallery removed',
                galleryDeleted: true
            });
        }
        else {
            res.json({
                message: 'Photo deleted successfully',
                galleryDeleted: false
            });
        }
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