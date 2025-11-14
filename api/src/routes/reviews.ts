import express from 'express';
import { db } from '../db/database';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// 인터페이스 정의
interface Review {
    id: number;
    title: string;
    content: string;
    category_id: string;
    rating: number;
    author_id: number;
    author_name: string;
    views: number;
    created_at: string;
    updated_at: string;
}

// 후기 목록 조회
router.get('/', (req, res) => {
    try {
        const { category, limit = 20, offset = 0 } = req.query;

        let query = `
            SELECT r.*, u.username as author_name
            FROM reviews r
            JOIN users u ON r.author_id = u.id
        `;
        const params: any[] = [];

        if (category && category !== 'all') {
            query += ' WHERE r.category_id = ?';
            params.push(category);
        }

        query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));

        const reviews = db.prepare(query).all(...params) as Review[];
        res.json(reviews);
    } catch (error) {
        console.error('Failed to fetch reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// 후기 상세 조회
router.get('/:id', (req, res) => {
    try {
        const reviewId = parseInt(req.params.id);

        // 조회수 증가
        db.prepare('UPDATE reviews SET views = views + 1 WHERE id = ?').run(reviewId);

        const review = db
            .prepare(`
                SELECT r.*, u.username as author_name, u.full_name as author_full_name
                FROM reviews r
                JOIN users u ON r.author_id = u.id
                WHERE r.id = ?
            `)
            .get(reviewId) as Review;

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.json(review);
    } catch (error) {
        console.error('Failed to fetch review:', error);
        res.status(500).json({ error: 'Failed to fetch review' });
    }
});

// 후기 작성
router.post('/', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
        const { title, content, category_id, rating } = req.body;
        const author_id = req.user?.id;

        if (!title || !content || !category_id || !rating) {
            return res.status(400).json({ error: 'Title, content, category and rating are required' });
        }

        const result = db
            .prepare(`
                INSERT INTO reviews (title, content, category_id, rating, author_id)
                VALUES (?, ?, ?, ?, ?)
            `)
            .run(title, content, category_id, rating, Number(author_id));

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Review created successfully',
        });
    } catch (error) {
        console.error('Failed to create review:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});

// 후기 수정
router.put('/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
        const reviewId = parseInt(req.params.id);
        const { title, content, category_id, rating } = req.body;
        const userId = req.user?.id;

        if (!title || !content || !category_id || !rating) {
            return res.status(400).json({ error: 'Title, content, category and rating are required' });
        }

        // 작성자 확인 (관리자는 모든 글 수정 가능)
        const review = db.prepare('SELECT author_id FROM reviews WHERE id = ?').get(reviewId) as { author_id: number };

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (review.author_id !== Number(userId) && !req.user?.isAdmin) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        const result = db
            .prepare(`
                UPDATE reviews
                SET title = ?, content = ?, category_id = ?, rating = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .run(title, content, category_id, rating, reviewId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.json({ message: 'Review updated successfully' });
    } catch (error) {
        console.error('Failed to update review:', error);
        res.status(500).json({ error: 'Failed to update review' });
    }
});

// 후기 삭제
router.delete('/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
        const reviewId = parseInt(req.params.id);
        const userId = req.user?.id;

        // 작성자 확인 (관리자는 모든 글 삭제 가능)
        const review = db.prepare('SELECT author_id FROM reviews WHERE id = ?').get(reviewId) as { author_id: number };

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (review.author_id !== Number(userId) && !req.user?.isAdmin) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        db.prepare('DELETE FROM reviews WHERE id = ?').run(reviewId);
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Failed to delete review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

// 카테고리별 통계
router.get('/stats/categories', (req, res) => {
    try {
        const stats = db
            .prepare(`
                SELECT
                    category_id,
                    COUNT(*) as count,
                    AVG(rating) as avg_rating,
                    MAX(created_at) as latest_date
                FROM reviews
                GROUP BY category_id
            `)
            .all();

        res.json(stats);
    } catch (error) {
        console.error('Failed to fetch category stats:', error);
        res.status(500).json({ error: 'Failed to fetch category stats' });
    }
});

export default router;