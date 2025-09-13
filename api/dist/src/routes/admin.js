"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../db/database");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tyyacht-jwt-secret-key-2024-development';
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.error('❌ JWT_SECRET must be configured in production');
    process.exit(1);
}
if (!process.env.JWT_SECRET) {
    console.warn('⚠️ Using default JWT_SECRET in development - please set JWT_SECRET environment variable');
}
const loginLogPath = path_1.default.join(__dirname, '../../logs/login.txt');
function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = database_1.db.prepare('SELECT id, username, email, full_name, role FROM users WHERE id = ? AND role = ?').get(decoded.userId, 'admin');
        if (!user) {
            return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }
}
router.get('/users', authenticateAdmin, (req, res) => {
    try {
        const users = database_1.db.prepare(`
      SELECT id, username, email, full_name, phone, birth_date, gender, role, is_active, created_at, updated_at, last_login
      FROM users 
      ORDER BY created_at DESC
    `).all();
        res.json(users);
    }
    catch (error) {
        console.error('Failed to get users:', error);
        res.status(500).json({ error: '사용자 목록을 가져오는데 실패했습니다.' });
    }
});
router.patch('/users/:id/toggle-status', authenticateAdmin, (req, res) => {
    try {
        const userId = req.params.id;
        const user = database_1.db.prepare('SELECT id, username, is_active, role FROM users WHERE id = ?').get(userId);
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ error: '관리자 계정의 상태는 변경할 수 없습니다.' });
        }
        const newStatus = user.is_active ? 0 : 1;
        database_1.db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(newStatus, userId);
        res.json({
            message: `사용자 ${user.username}이 ${newStatus ? '활성화' : '비활성화'}되었습니다.`,
            is_active: newStatus
        });
    }
    catch (error) {
        console.error('Failed to toggle user status:', error);
        res.status(500).json({ error: '사용자 상태 변경에 실패했습니다.' });
    }
});
router.get('/logs', authenticateAdmin, (req, res) => {
    try {
        let logs = [];
        if (fs_1.default.existsSync(loginLogPath)) {
            const logContent = fs_1.default.readFileSync(loginLogPath, 'utf8');
            logs = logContent.split('\n')
                .filter(line => line.trim() !== '')
                .slice(-100)
                .reverse();
        }
        res.json({ logs });
    }
    catch (error) {
        console.error('Failed to read login logs:', error);
        res.status(500).json({ error: '로그인 기록을 가져오는데 실패했습니다.' });
    }
});
router.get('/database-status', authenticateAdmin, (req, res) => {
    try {
        const result = database_1.db.prepare('SELECT COUNT(*) as count FROM users').get();
        res.json({
            status: 'connected',
            message: '데이터베이스가 정상적으로 연결되어 있습니다.',
            userCount: result.count
        });
    }
    catch (error) {
        console.error('Database status check failed:', error);
        res.status(500).json({ error: '데이터베이스 연결 확인에 실패했습니다.' });
    }
});
router.get('/stats', authenticateAdmin, (req, res) => {
    try {
        const totalUsers = database_1.db.prepare('SELECT COUNT(*) as count FROM users WHERE role != ?').get('admin').count;
        const activeUsers = database_1.db.prepare('SELECT COUNT(*) as count FROM users WHERE role != ? AND is_active = 1').get('admin').count;
        const recentLogins = database_1.db.prepare('SELECT COUNT(*) as count FROM users WHERE last_login > datetime(\'now\', \'-7 days\')').get().count;
        res.json({
            totalUsers,
            activeUsers,
            recentLogins,
            inactiveUsers: totalUsers - activeUsers
        });
    }
    catch (error) {
        console.error('Failed to get stats:', error);
        res.status(500).json({ error: '통계 정보를 가져오는데 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map