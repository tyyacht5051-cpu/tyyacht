import express from 'express';
import { db } from '../db/database';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

const router = express.Router();

// 인터페이스 정의
interface CrewRecruitment {
    id: number;
    title: string;
    content: string;
    recruitment_type: string;
    vessel_name?: string;
    vessel_model?: string;
    preferred_gender?: string;
    preferred_age?: string;
    yacht_license?: string;
    competition_history?: string;
    target_competition?: string;
    max_crew?: number;
    current_crew?: number;
    status: string;
    author_id: number;
    author_name: string;
    views: number;
    created_at: string;
    updated_at: string;
}

interface CrewApplication {
    id: number;
    applicant_name: string;
    applicant_phone: string;
    created_at: string;
}

// 크루 모집 목록 조회
router.get('/', (req, res) => {
    try {
        const { status, recruitment_type, limit = 20, offset = 0 } = req.query;

        let query = `
            SELECT c.*, u.username as author_name
            FROM crew_recruitments c
            JOIN users u ON c.author_id = u.id
        `;
        const params: any[] = [];
        const conditions: string[] = [];

        if (status && status !== 'all') {
            conditions.push('c.status = ?');
            params.push(status);
        }

        if (recruitment_type && recruitment_type !== 'all') {
            conditions.push('c.recruitment_type = ?');
            params.push(recruitment_type);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));

        const recruitments = db.prepare(query).all(...params) as CrewRecruitment[];

        res.json(recruitments);
    } catch (error) {
        console.error('Failed to fetch crew recruitments:', error);
        res.status(500).json({ error: 'Failed to fetch crew recruitments' });
    }
});

// 크루 모집 상세 조회
router.get('/:id', (req, res) => {
    try {
        const recruitmentId = parseInt(req.params.id);

        // 조회수 증가
        db.prepare('UPDATE crew_recruitments SET views = views + 1 WHERE id = ?').run(recruitmentId);

        const recruitment = db
            .prepare(`
                SELECT c.*, u.username as author_name, u.full_name as author_full_name
                FROM crew_recruitments c
                JOIN users u ON c.author_id = u.id
                WHERE c.id = ?
            `)
            .get(recruitmentId) as CrewRecruitment;

        if (!recruitment) {
            return res.status(404).json({ error: 'Recruitment not found' });
        }

        res.json(recruitment);
    } catch (error) {
        console.error('Failed to fetch recruitment:', error);
        res.status(500).json({ error: 'Failed to fetch recruitment' });
    }
});

// 크루 모집 등록
router.post('/', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
        const {
            title,
            content,
            recruitment_type,
            vessel_name,
            vessel_model,
            preferred_gender,
            preferred_age,
            yacht_license,
            competition_history,
            target_competition,
            max_crew
        } = req.body;
        const author_id = req.user?.id;

        if (!title || !content || !recruitment_type) {
            return res.status(400).json({ error: 'Title, content, and recruitment_type are required' });
        }

        // 크루 구해요의 경우 선명 필수
        if (recruitment_type === 'crew_wanted' && !vessel_name) {
            return res.status(400).json({ error: 'Vessel name is required for crew_wanted type' });
        }

        const result = db
            .prepare(`
                INSERT INTO crew_recruitments (
                    title, content, recruitment_type, vessel_name, vessel_model, preferred_gender, preferred_age,
                    yacht_license, competition_history, target_competition, max_crew, status, author_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .run(
                title, content, recruitment_type, vessel_name || null, vessel_model || null, preferred_gender || null, preferred_age || null,
                yacht_license || null, competition_history || null, target_competition || null,
                recruitment_type === 'crew_wanted' ? max_crew || 4 : null, 'recruiting', author_id
            );

        // 편집 토큰 생성 (무제한)
        const editToken = jwt.sign(
            {
                recruitmentId: result.lastInsertRowid,
                authorId: author_id,
                type: 'crew_edit'
            },
            config.JWT_SECRET
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            editToken,
            message: 'Crew recruitment created successfully',
        });
    } catch (error) {
        console.error('Failed to create crew recruitment:', error);
        res.status(500).json({ error: 'Failed to create crew recruitment' });
    }
});

// 크루 모집 수정
router.put('/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
        const recruitmentId = parseInt(req.params.id);
        const {
            title,
            content,
            recruitment_type,
            vessel_name,
            vessel_model,
            preferred_gender,
            preferred_age,
            yacht_license,
            competition_history,
            target_competition,
            max_crew,
            status
        } = req.body;
        const userId = req.user?.id;

        if (!title || !content || !recruitment_type) {
            return res.status(400).json({ error: 'Title, content, and recruitment_type are required' });
        }

        // 작성자 확인 (관리자는 모든 글 수정 가능)
        const recruitment = db.prepare('SELECT author_id FROM crew_recruitments WHERE id = ?').get(recruitmentId) as { author_id: number };

        if (!recruitment) {
            return res.status(404).json({ error: 'Recruitment not found' });
        }

        if (recruitment.author_id !== Number(userId) && !req.user?.isAdmin) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        const result = db
            .prepare(`
                UPDATE crew_recruitments
                SET title = ?, content = ?, recruitment_type = ?, vessel_name = ?, vessel_model = ?, preferred_gender = ?, preferred_age = ?,
                    yacht_license = ?, competition_history = ?, target_competition = ?, max_crew = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .run(
                title, content, recruitment_type, vessel_name || null, vessel_model || null, preferred_gender || null, preferred_age || null,
                yacht_license || null, competition_history || null, target_competition || null,
                recruitment_type === 'crew_wanted' ? max_crew || 4 : null, status || 'recruiting', recruitmentId
            );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Recruitment not found' });
        }

        res.json({ message: 'Crew recruitment updated successfully' });
    } catch (error) {
        console.error('Failed to update crew recruitment:', error);
        res.status(500).json({ error: 'Failed to update crew recruitment' });
    }
});

// 크루 모집 삭제
router.delete('/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
        const recruitmentId = parseInt(req.params.id);
        const userId = req.user?.id;

        // 작성자 확인 (관리자는 모든 글 삭제 가능)
        const recruitment = db.prepare('SELECT author_id FROM crew_recruitments WHERE id = ?').get(recruitmentId) as { author_id: number };

        if (!recruitment) {
            return res.status(404).json({ error: 'Recruitment not found' });
        }

        if (recruitment.author_id !== Number(userId) && !req.user?.isAdmin) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        db.prepare('DELETE FROM crew_recruitments WHERE id = ?').run(recruitmentId);
        res.json({ message: 'Crew recruitment deleted successfully' });
    } catch (error) {
        console.error('Failed to delete crew recruitment:', error);
        res.status(500).json({ error: 'Failed to delete crew recruitment' });
    }
});

// 크루 참가 신청
router.post('/:id/join', (req, res) => {
    try {
        const recruitmentId = parseInt(req.params.id);
        const { name, phone } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and phone are required' });
        }

        // 모집글 확인
        const recruitment = db.prepare(`
            SELECT * FROM crew_recruitments WHERE id = ? AND status = 'recruiting'
        `).get(recruitmentId) as CrewRecruitment;

        if (!recruitment) {
            return res.status(404).json({ error: 'Recruitment not found or not recruiting' });
        }

        // 참가 신청 등록
        db.prepare(`
            INSERT INTO crew_applications (recruitment_id, applicant_name, applicant_phone)
            VALUES (?, ?, ?)
        `).run(recruitmentId, name, phone);

        res.json({ message: 'Successfully applied to crew recruitment' });
    } catch (error) {
        console.error('Failed to join crew:', error);
        res.status(500).json({ error: 'Failed to join crew' });
    }
});

// 크루 참가 취소
router.delete('/:id/leave', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
        const recruitmentId = parseInt(req.params.id);
        const userId = req.user?.id;

        // 참가 신청 확인
        const application = db.prepare(`
            SELECT id FROM crew_applications WHERE recruitment_id = ? AND user_id = ?
        `).get(recruitmentId, userId);

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // 참가 신청 삭제
        db.prepare(`
            DELETE FROM crew_applications WHERE recruitment_id = ? AND user_id = ?
        `).run(recruitmentId, userId);

        // 현재 크루 수 감소
        db.prepare(`
            UPDATE crew_recruitments
            SET current_crew = current_crew - 1,
                status = 'recruiting'
            WHERE id = ?
        `).run(recruitmentId);

        res.json({ message: 'Successfully left crew recruitment' });
    } catch (error) {
        console.error('Failed to leave crew:', error);
        res.status(500).json({ error: 'Failed to leave crew' });
    }
});

// 내가 작성한 크루 모집글 조회 (마이페이지용)
router.get('/my/posts', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        const { limit = 10, offset = 0 } = req.query;

        const recruitments = db
            .prepare(`
                SELECT c.*, u.username as author_name
                FROM crew_recruitments c
                JOIN users u ON c.author_id = u.id
                WHERE c.author_id = ?
                ORDER BY c.created_at DESC
                LIMIT ? OFFSET ?
            `)
            .all(userId, Number(limit), Number(offset)) as CrewRecruitment[];

        res.json(recruitments);
    } catch (error) {
        console.error('Failed to fetch my crew recruitments:', error);
        res.status(500).json({ error: 'Failed to fetch my crew recruitments' });
    }
});

// 모집 상태 변경 (모집중 <-> 모집마감)
router.patch('/:id/status', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
        const recruitmentId = parseInt(req.params.id);
        const { status } = req.body;
        const userId = req.user?.id;

        if (!status || !['recruiting', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be "recruiting" or "completed"' });
        }

        // 작성자 확인 (관리자는 모든 글 수정 가능)
        const recruitment = db.prepare('SELECT author_id FROM crew_recruitments WHERE id = ?').get(recruitmentId) as { author_id: number };

        if (!recruitment) {
            return res.status(404).json({ error: 'Recruitment not found' });
        }

        if (recruitment.author_id !== Number(userId) && !req.user?.isAdmin) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        const result = db
            .prepare('UPDATE crew_recruitments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run(status, recruitmentId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Recruitment not found' });
        }

        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Failed to update status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// 내 모집글의 신청자 목록 조회 (마이페이지용)
router.get('/my/:id/applications', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
        const recruitmentId = parseInt(req.params.id);
        const userId = req.user?.id;

        // 작성자 확인
        const recruitment = db.prepare('SELECT author_id FROM crew_recruitments WHERE id = ?').get(recruitmentId) as { author_id: number };

        if (!recruitment) {
            return res.status(404).json({ error: 'Recruitment not found' });
        }

        if (recruitment.author_id !== Number(userId) && !req.user?.isAdmin) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        // 신청자 목록 조회
        const applications = db.prepare(`
            SELECT
                ca.id,
                ca.applicant_name,
                ca.applicant_phone,
                ca.created_at
            FROM crew_applications ca
            WHERE ca.recruitment_id = ?
            ORDER BY ca.created_at ASC
        `).all(recruitmentId) as CrewApplication[];

        // 신청자 정보 정리
        const processedApplications = applications.map(app => ({
            id: app.id,
            name: app.applicant_name,
            phone: app.applicant_phone,
            applied_at: app.created_at
        }));

        res.json(processedApplications);
    } catch (error) {
        console.error('Failed to fetch applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// 통계 정보
router.get('/stats/overview', (req, res) => {
    try {
        const stats = db.prepare(`
            SELECT
                COUNT(*) as total_recruitments,
                COUNT(CASE WHEN status = 'recruiting' THEN 1 END) as active_recruitments,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_recruitments,
                AVG(cost) as avg_cost
            FROM crew_recruitments
        `).get();

        res.json(stats);
    } catch (error) {
        console.error('Failed to fetch overview stats:', error);
        res.status(500).json({ error: 'Failed to fetch overview stats' });
    }
});

export default router;