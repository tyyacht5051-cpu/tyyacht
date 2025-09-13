"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../db/database");
const router = express_1.default.Router();
const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            const secret = process.env.JWT_SECRET || 'tyyacht-jwt-secret-key-2024-development';
            if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
                console.error('❌ JWT_SECRET must be configured in production');
                return res.status(500).json({ error: 'Server configuration error' });
            }
            if (!process.env.JWT_SECRET) {
                console.warn('⚠️ Using default JWT_SECRET in development - please set JWT_SECRET environment variable');
            }
            const decoded = jwt.verify(token, secret);
            const user = database_1.db.prepare('SELECT id, username, email, role, is_active FROM users WHERE id = ? AND is_active = 1').get(decoded.userId);
            if (!user) {
                console.warn('⚠️ Invalid or inactive user token:', decoded.userId);
                return res.status(401).json({ error: 'Invalid or inactive user' });
            }
            req.user = user;
        }
        catch (error) {
            console.error('❌ JWT verification failed:', error?.message);
            if (process.env.NODE_ENV === 'development') {
                return res.status(401).json({ error: 'Invalid token', details: error.message });
            }
            return res.status(401).json({ error: 'Invalid token' });
        }
    }
    next();
};
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        console.warn('⚠️ Admin access attempted without token from IP:', req.ip);
        return res.status(401).json({ error: 'Authentication required' });
    }
    try {
        const jwt = require('jsonwebtoken');
        const secret = process.env.JWT_SECRET || 'tyyacht-jwt-secret-key-2024-development';
        if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
            console.error('❌ JWT_SECRET must be configured in production');
            return res.status(500).json({ error: 'Server configuration error' });
        }
        if (!process.env.JWT_SECRET) {
            console.warn('⚠️ Using default JWT_SECRET for admin access in development');
        }
        const decoded = jwt.verify(token, secret);
        const user = database_1.db.prepare('SELECT id, username, email, role, is_active FROM users WHERE id = ? AND is_active = 1').get(decoded.userId);
        if (!user) {
            console.warn('⚠️ Admin access with invalid user ID:', decoded.userId, 'from IP:', req.ip);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (user.role !== 'admin') {
            console.warn('⚠️ Non-admin user attempted admin access:', user.username, 'from IP:', req.ip);
            return res.status(403).json({ error: 'Insufficient privileges' });
        }
        console.log('✅ Admin access granted to:', user.username);
        req.user = user;
        next();
    }
    catch (error) {
        console.error('❌ Admin authentication failed:', error?.message, 'from IP:', req.ip);
        if (process.env.NODE_ENV === 'development') {
            return res.status(401).json({ error: 'Invalid token', details: error.message });
        }
        return res.status(401).json({ error: 'Invalid credentials' });
    }
};
const validateName = (name) => {
    return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 50;
};
const validatePhone = (phone) => {
    const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;
    return typeof phone === 'string' && phoneRegex.test(phone.replace(/-/g, ''));
};
const validateEmail = (email) => {
    if (!email || email.trim() === '')
        return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 100;
};
const validateDate = (date) => {
    const dateObj = new Date(date);
    const now = new Date();
    return !isNaN(dateObj.getTime()) && dateObj >= now;
};
const sanitizeString = (str) => {
    return str.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};
router.post('/cruise', authenticateUser, (req, res) => {
    try {
        const { name, phone, email = '', experience_date, participants, special_requests = '' } = req.body;
        if (!validateName(name)) {
            return res.status(400).json({ error: 'Invalid name format' });
        }
        if (!validatePhone(phone)) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        if (!validateDate(experience_date)) {
            return res.status(400).json({ error: 'Invalid or past date' });
        }
        const participantsNum = parseInt(participants);
        if (isNaN(participantsNum) || participantsNum < 1 || participantsNum > 20) {
            return res.status(400).json({ error: 'Participants must be between 1 and 20' });
        }
        const sanitizedName = sanitizeString(name);
        const sanitizedEmail = sanitizeString(email);
        const sanitizedRequests = sanitizeString(special_requests);
        const user_id = req.user ? req.user.id : null;
        const result = database_1.db.prepare(`
      INSERT INTO cruise_applications (user_id, name, phone, email, experience_date, participants, special_requests)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(user_id, sanitizedName, phone, sanitizedEmail, experience_date, participantsNum, sanitizedRequests);
        console.log('✅ Cruise application submitted:', { id: result.lastInsertRowid, user_id, name: sanitizedName });
        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Cruise experience application submitted successfully'
        });
    }
    catch (error) {
        console.error('❌ Failed to submit cruise application:', error?.message);
        if (process.env.NODE_ENV === 'development') {
            res.status(500).json({ error: 'Failed to submit application', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to submit application' });
        }
    }
});
router.get('/cruise', authenticateAdmin, (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;
        let query = `
      SELECT ca.*, u.username as user_username 
      FROM cruise_applications ca 
      LEFT JOIN users u ON ca.user_id = u.id 
    `;
        const params = [];
        if (status) {
            query += ' WHERE ca.status = ?';
            params.push(status);
        }
        query += ' ORDER BY ca.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));
        const applications = database_1.db.prepare(query).all(...params);
        res.json(applications);
    }
    catch (error) {
        console.error('Failed to fetch cruise applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});
router.put('/cruise/:id/status', authenticateAdmin, (req, res) => {
    try {
        const applicationId = parseInt(req.params.id);
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const result = database_1.db.prepare(`
      UPDATE cruise_applications 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, applicationId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json({ message: 'Application status updated successfully' });
    }
    catch (error) {
        console.error('Failed to update cruise application status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});
router.delete('/cruise/:id', authenticateAdmin, (req, res) => {
    try {
        const applicationId = parseInt(req.params.id);
        const result = database_1.db.prepare(`
      DELETE FROM cruise_applications WHERE id = ?
    `).run(applicationId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json({ message: 'Application deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete cruise application:', error);
        res.status(500).json({ error: 'Failed to delete application' });
    }
});
router.get('/cruise/export', authenticateAdmin, (req, res) => {
    try {
        const applications = database_1.db.prepare(`
      SELECT ca.*, u.username as user_username 
      FROM cruise_applications ca 
      LEFT JOIN users u ON ca.user_id = u.id 
      ORDER BY ca.created_at DESC
    `).all();
        res.json(applications);
    }
    catch (error) {
        console.error('Failed to export cruise applications:', error);
        res.status(500).json({ error: 'Failed to export applications' });
    }
});
router.post('/exemption', authenticateUser, (req, res) => {
    try {
        const { name, phone, email, birthDate, gender, address, license, courseType, preferredDates, discountEligibility } = req.body;
        if (!name || !phone || !birthDate || !gender || !address || !courseType) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }
        if (!['general', 'practical'].includes(courseType)) {
            return res.status(400).json({ error: 'Invalid course type' });
        }
        const user_id = req.user ? req.user.id : null;
        const result = database_1.db.prepare(`
      INSERT INTO exemption_applications (
        user_id, name, phone, email, birth_date, gender, address,
        course_type, preferred_date, license, discount_eligibility
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user_id, name, phone, email || '', birthDate, gender, address, courseType, preferredDates ? JSON.stringify(preferredDates) : null, license || null, discountEligibility || null);
        res.status(201).json({
            id: result.lastInsertRowid,
            message: '면제교육 신청이 접수되었습니다.'
        });
    }
    catch (error) {
        console.error('Failed to submit exemption application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});
router.get('/my-exemption', authenticateUser, (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const applications = database_1.db.prepare(`
      SELECT * FROM exemption_applications 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(req.user.id);
        res.json(applications);
    }
    catch (error) {
        console.error('Failed to fetch user exemption applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});
router.get('/exemption', authenticateAdmin, (req, res) => {
    try {
        const { status, education_type, limit = 50, offset = 0 } = req.query;
        let query = `
      SELECT ea.*, u.username as user_username 
      FROM exemption_applications ea 
      LEFT JOIN users u ON ea.user_id = u.id 
    `;
        const params = [];
        const conditions = [];
        if (status) {
            conditions.push('ea.status = ?');
            params.push(status);
        }
        if (education_type) {
            conditions.push('ea.education_type = ?');
            params.push(education_type);
        }
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY ea.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));
        const applications = database_1.db.prepare(query).all(...params);
        res.json(applications);
    }
    catch (error) {
        console.error('Failed to fetch exemption applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});
router.patch('/exemption/:id/status', authenticateAdmin, (req, res) => {
    try {
        const applicationId = parseInt(req.params.id);
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const result = database_1.db.prepare(`
      UPDATE exemption_applications 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, applicationId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json({ message: 'Application status updated successfully' });
    }
    catch (error) {
        console.error('Failed to update exemption application status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});
router.get('/exemption/stats', authenticateAdmin, (req, res) => {
    try {
        const totalApplications = database_1.db.prepare('SELECT COUNT(*) as count FROM exemption_applications').get();
        const pendingApplications = database_1.db.prepare('SELECT COUNT(*) as count FROM exemption_applications WHERE status = ?').get('pending');
        const approvedApplications = database_1.db.prepare('SELECT COUNT(*) as count FROM exemption_applications WHERE status = ?').get('approved');
        const thisMonth = database_1.db.prepare(`
      SELECT COUNT(*) as count FROM exemption_applications 
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).get();
        res.json({
            total: totalApplications.count,
            pending: pendingApplications.count,
            approved: approvedApplications.count,
            thisMonth: thisMonth.count
        });
    }
    catch (error) {
        console.error('Failed to get exemption application stats:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});
router.get('/exemption/counts/:month', (req, res) => {
    try {
        const { month } = req.params;
        const applications = database_1.db.prepare(`
      SELECT preferred_date, COUNT(*) as count
      FROM exemption_applications 
      WHERE preferred_date IS NOT NULL 
      AND status = 'approved'
      GROUP BY preferred_date
    `).all();
        const dateCounts = {};
        applications.forEach(app => {
            try {
                let dates = [];
                if (typeof app.preferred_date === 'string') {
                    try {
                        dates = JSON.parse(app.preferred_date);
                    }
                    catch {
                        dates = [app.preferred_date];
                    }
                }
                if (Array.isArray(dates)) {
                    dates.forEach((date) => {
                        if (date && date.startsWith(month)) {
                            dateCounts[date] = (dateCounts[date] || 0) + app.count;
                        }
                    });
                }
            }
            catch (error) {
                console.error('Error processing preferred_date:', error);
            }
        });
        res.json({
            counts: dateCounts,
            totalApprovedApplications: applications.reduce((sum, app) => sum + app.count, 0)
        });
    }
    catch (error) {
        console.error('Failed to get exemption application counts:', error);
        res.status(500).json({ error: 'Failed to get counts' });
    }
});
router.get('/exemption/export', authenticateAdmin, (req, res) => {
    try {
        const applications = database_1.db.prepare(`
      SELECT ea.*, u.username as user_username 
      FROM exemption_applications ea 
      LEFT JOIN users u ON ea.user_id = u.id 
      ORDER BY ea.created_at DESC
    `).all();
        res.json(applications);
    }
    catch (error) {
        console.error('Failed to export exemption applications:', error);
        res.status(500).json({ error: 'Failed to export applications' });
    }
});
router.post('/education', authenticateUser, (req, res) => {
    try {
        const { name, phone, email, birthDate, gender, address, license, courseType, preferredDates, discountEligibility, experience, motivation } = req.body;
        if (!name || !phone || !email || !birthDate || !gender || !address || !courseType) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }
        const user_id = req.user ? req.user.id : null;
        const result = database_1.db.prepare(`
      INSERT INTO education_applications (
        user_id, name, phone, email, birth_date, gender, address, 
        license, course_type, preferred_dates, discount_eligibility, experience, motivation
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user_id, name, phone, email, birthDate, gender, address, license || '', courseType, preferredDates ? JSON.stringify(preferredDates) : null, discountEligibility || '', experience || 'none', motivation || '');
        res.status(201).json({
            id: result.lastInsertRowid,
            message: '요트교육 신청이 접수되었습니다.'
        });
    }
    catch (error) {
        console.error('Failed to submit education application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});
router.get('/my-education', authenticateUser, (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const applications = database_1.db.prepare(`
      SELECT * FROM education_applications 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(req.user.id);
        res.json(applications);
    }
    catch (error) {
        console.error('Failed to fetch user education applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});
router.get('/education', authenticateAdmin, (req, res) => {
    try {
        const { status, courseType, limit = 50, offset = 0 } = req.query;
        let query = `
      SELECT ea.*, u.username as user_username 
      FROM education_applications ea 
      LEFT JOIN users u ON ea.user_id = u.id 
    `;
        const params = [];
        const conditions = [];
        if (status) {
            conditions.push('ea.status = ?');
            params.push(status);
        }
        if (courseType) {
            conditions.push('ea.course_type = ?');
            params.push(courseType);
        }
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY ea.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));
        const applications = database_1.db.prepare(query).all(...params);
        res.json(applications);
    }
    catch (error) {
        console.error('Failed to fetch education applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});
router.patch('/education/:id/status', authenticateAdmin, (req, res) => {
    try {
        const applicationId = parseInt(req.params.id);
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const result = database_1.db.prepare(`
      UPDATE education_applications 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, applicationId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json({ message: 'Application status updated successfully' });
    }
    catch (error) {
        console.error('Failed to update education application status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});
router.delete('/education/:id', authenticateAdmin, (req, res) => {
    try {
        const applicationId = parseInt(req.params.id);
        const result = database_1.db.prepare(`
      DELETE FROM education_applications WHERE id = ?
    `).run(applicationId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json({ message: 'Application deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete education application:', error);
        res.status(500).json({ error: 'Failed to delete application' });
    }
});
router.get('/education/stats', authenticateAdmin, (req, res) => {
    try {
        const totalApplications = database_1.db.prepare('SELECT COUNT(*) as count FROM education_applications').get();
        const pendingApplications = database_1.db.prepare('SELECT COUNT(*) as count FROM education_applications WHERE status = ?').get('pending');
        const approvedApplications = database_1.db.prepare('SELECT COUNT(*) as count FROM education_applications WHERE status = ?').get('approved');
        const thisMonth = database_1.db.prepare(`
      SELECT COUNT(*) as count FROM education_applications 
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).get();
        res.json({
            total: totalApplications.count,
            pending: pendingApplications.count,
            confirmed: approvedApplications.count,
            thisMonth: thisMonth.count
        });
    }
    catch (error) {
        console.error('Failed to get education application stats:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});
router.get('/education/export', authenticateAdmin, (req, res) => {
    try {
        const applications = database_1.db.prepare(`
      SELECT ea.*, u.username as user_username 
      FROM education_applications ea 
      LEFT JOIN users u ON ea.user_id = u.id 
      ORDER BY ea.created_at DESC
    `).all();
        res.json(applications);
    }
    catch (error) {
        console.error('Failed to export education applications:', error);
        res.status(500).json({ error: 'Failed to export applications' });
    }
});
router.get('/stats', authenticateAdmin, (req, res) => {
    try {
        const cruiseStats = database_1.db.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM cruise_applications 
      GROUP BY status
    `).all();
        const exemptionStats = database_1.db.prepare(`
      SELECT 
        status,
        education_type,
        COUNT(*) as count
      FROM exemption_applications 
      GROUP BY status, education_type
    `).all();
        const recentApplications = database_1.db.prepare(`
      SELECT 
        DATE(created_at) as date,
        'cruise' as type,
        COUNT(*) as count
      FROM cruise_applications 
      WHERE created_at >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      
      UNION ALL
      
      SELECT 
        DATE(created_at) as date,
        'exemption' as type,
        COUNT(*) as count
      FROM exemption_applications 
      WHERE created_at >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      
      ORDER BY date DESC
    `).all();
        res.json({
            cruise: cruiseStats,
            exemption: exemptionStats,
            recent: recentApplications
        });
    }
    catch (error) {
        console.error('Failed to fetch application stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});
exports.default = router;
//# sourceMappingURL=applications.js.map