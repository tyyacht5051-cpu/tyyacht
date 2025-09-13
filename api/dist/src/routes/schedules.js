"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../db/database");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'tyyacht-jwt-secret-key-2024-development';
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.error('❌ JWT_SECRET must be configured in production');
    process.exit(1);
}
if (!process.env.JWT_SECRET) {
    console.warn('⚠️ Using default JWT_SECRET in development - please set JWT_SECRET environment variable');
}
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
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
router.get('/', async (req, res) => {
    try {
        const schedules = database_1.db.prepare('SELECT * FROM exemption_schedules ORDER BY month').all();
        const schedulesMap = {};
        schedules.forEach((schedule) => {
            schedulesMap[schedule.month] = JSON.parse(schedule.dates);
        });
        res.json(schedulesMap);
    }
    catch (error) {
        console.error('Failed to load schedules:', error);
        res.status(500).json({ error: 'Failed to load schedules' });
    }
});
router.get('/:month', async (req, res) => {
    try {
        const { month } = req.params;
        const schedule = database_1.db.prepare('SELECT * FROM exemption_schedules WHERE month = ?').get(month);
        if (!schedule) {
            return res.json({ dates: [] });
        }
        res.json({
            month: schedule.month,
            dates: JSON.parse(schedule.dates)
        });
    }
    catch (error) {
        console.error('Failed to load schedule:', error);
        res.status(500).json({ error: 'Failed to load schedule' });
    }
});
router.post('/', authenticateAdmin, async (req, res) => {
    try {
        const { month, dates } = req.body;
        if (!month || !Array.isArray(dates)) {
            return res.status(400).json({ error: 'Invalid month or dates' });
        }
        if (dates.length > 5) {
            return res.status(400).json({ error: 'Maximum 5 dates allowed per month' });
        }
        const validDates = dates.filter(date => {
            try {
                new Date(date).toISOString();
                return true;
            }
            catch {
                return false;
            }
        });
        if (validDates.length !== dates.length) {
            return res.status(400).json({ error: 'Invalid date format' });
        }
        const datesJson = JSON.stringify(dates.sort());
        const stmt = database_1.db.prepare(`
      INSERT INTO exemption_schedules (month, dates, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(month) DO UPDATE SET 
      dates = excluded.dates,
      updated_at = CURRENT_TIMESTAMP
    `);
        stmt.run(month, datesJson);
        res.json({
            success: true,
            message: 'Schedule saved successfully',
            month,
            dates
        });
    }
    catch (error) {
        console.error('Failed to save schedule:', error);
        res.status(500).json({ error: 'Failed to save schedule' });
    }
});
router.delete('/:month', authenticateAdmin, async (req, res) => {
    try {
        const { month } = req.params;
        const stmt = database_1.db.prepare('DELETE FROM exemption_schedules WHERE month = ?');
        const result = stmt.run(month);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        res.json({ success: true, message: 'Schedule deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete schedule:', error);
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
});
router.get('/available/:month', async (req, res) => {
    try {
        const { month } = req.params;
        const schedule = database_1.db.prepare('SELECT * FROM exemption_schedules WHERE month = ?').get(month);
        if (!schedule) {
            return res.json({ dates: [] });
        }
        const dates = JSON.parse(schedule.dates);
        const today = new Date().toISOString().split('T')[0];
        const availableDates = dates.filter((date) => date >= today);
        res.json({ dates: availableDates });
    }
    catch (error) {
        console.error('Failed to load available dates:', error);
        res.status(500).json({ error: 'Failed to load available dates' });
    }
});
exports.default = router;
//# sourceMappingURL=schedules.js.map