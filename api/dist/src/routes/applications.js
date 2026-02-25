"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../db/database");
const auth_1 = require("../middleware/auth");
const exemption_document_1 = require("../utils/exemption-document");
const boarding_document_1 = require("../utils/boarding-document");
const practical_document_1 = require("../utils/practical-document");
const education_document_1 = require("../utils/education-document");
const router = express_1.default.Router();
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
router.post('/cruise', auth_1.authenticateToken, (req, res) => {
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
        const { experience_type = '크루즈요트', representative = {}, companions = [], location = '' } = req.body;
        let address_do = '';
        let address_sigungu = '';
        if (location) {
            const parts = location.split(' ');
            if (parts.length >= 2) {
                address_do = parts[0];
                address_sigungu = parts[1];
            }
        }
        function calculateAge(birthDate) {
            if (!birthDate)
                return 25;
            const birth = new Date(birthDate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        }
        function isAdult(age) {
            return age >= 19;
        }
        function getGender(companion) {
            if (companion.gender === 'M' || companion.gender === 'male')
                return 'male';
            if (companion.gender === 'F' || companion.gender === 'female')
                return 'female';
            return Math.random() > 0.5 ? 'male' : 'female';
        }
        const allParticipants = [representative, ...companions];
        let adult_male = 0;
        let adult_female = 0;
        let youth_male = 0;
        let youth_female = 0;
        let infant_male = 0;
        let infant_female = 0;
        let teens_male = 0;
        let teens_female = 0;
        let twenties_male = 0;
        let twenties_female = 0;
        let thirties_male = 0;
        let thirties_female = 0;
        let forties_male = 0;
        let forties_female = 0;
        let fifties_plus_male = 0;
        let fifties_plus_female = 0;
        allParticipants.forEach(person => {
            if (!person || !person.birthDate) {
                thirties_male++;
                adult_male++;
                return;
            }
            const age = calculateAge(person.birthDate);
            const gender = getGender(person);
            if (isAdult(age)) {
                if (gender === 'male') {
                    adult_male++;
                }
                else {
                    adult_female++;
                }
            }
            else {
                if (gender === 'male') {
                    youth_male++;
                }
                else {
                    youth_female++;
                }
            }
            if (age < 8) {
                if (gender === 'male') {
                    infant_male++;
                }
                else {
                    infant_female++;
                }
            }
            else if (age >= 10 && age <= 19) {
                if (gender === 'male') {
                    teens_male++;
                }
                else {
                    teens_female++;
                }
            }
            else if (age >= 20 && age <= 29) {
                if (gender === 'male') {
                    twenties_male++;
                }
                else {
                    twenties_female++;
                }
            }
            else if (age >= 30 && age <= 39) {
                if (gender === 'male') {
                    thirties_male++;
                }
                else {
                    thirties_female++;
                }
            }
            else if (age >= 40 && age <= 49) {
                if (gender === 'male') {
                    forties_male++;
                }
                else {
                    forties_female++;
                }
            }
            else if (age >= 50) {
                if (gender === 'male') {
                    fifties_plus_male++;
                }
                else {
                    fifties_plus_female++;
                }
            }
        });
        const adult_total = adult_male + adult_female;
        const youth_total = youth_male + youth_female;
        const total_participants = adult_total + youth_total;
        const result = database_1.db.prepare(`
      INSERT INTO cruise_applications (
        user_id, name, phone, email, experience_date, participants,
        experience_type, desired_date, address_do, address_sigungu,
        adult_male, adult_female, adult_total,
        youth_male, youth_female, youth_total, total_participants,
        infant_male, infant_female, teens_male, teens_female,
        twenties_male, twenties_female, thirties_male, thirties_female,
        forties_male, forties_female, fifties_plus_male, fifties_plus_female,
        special_requests
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user_id, sanitizedName, phone, sanitizedEmail, experience_date, participantsNum, experience_type, experience_date, address_do, address_sigungu, adult_male, adult_female, adult_total, youth_male, youth_female, youth_total, total_participants, infant_male, infant_female, teens_male, teens_female, twenties_male, twenties_female, thirties_male, thirties_female, forties_male, forties_female, fifties_plus_male, fifties_plus_female, JSON.stringify({ text: sanitizedRequests, representative, companions }));
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
router.get('/cruise', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
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
router.put('/cruise/:id/status', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
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
router.delete('/cruise/:id', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
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
router.get('/cruise/export', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
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
router.post('/exemption', auth_1.authenticateToken, (req, res) => {
    try {
        const { name, phone, email, birthDate, gender, address, license, courseType, preferredDates, discountEligibility } = req.body;
        if (!name || !phone || !birthDate || !gender || !address || !courseType) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }
        if (!['general', 'practical', 'exemption'].includes(courseType)) {
            return res.status(400).json({ error: 'Invalid course type' });
        }
        const user_id = req.user ? req.user.id : null;
        const recent = database_1.db.prepare(`
      SELECT id FROM exemption_applications
      WHERE name = ? AND phone = ? AND created_at > datetime('now', '-60 seconds')
    `).get(name, phone);
        if (recent) {
            return res.status(409).json({ error: '이미 신청이 접수되었습니다. 잠시 후 다시 시도해주세요.' });
        }
        const result = database_1.db.prepare(`
      INSERT INTO exemption_applications (
        user_id, name, phone, email, birth_date, gender, address,
        education_type, course_type, preferred_date, license, discount_eligibility
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user_id, name, phone, email || '', birthDate, gender, address, courseType, courseType, preferredDates ? JSON.stringify(preferredDates) : null, license || null, discountEligibility || null);
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
router.get('/my-exemption', auth_1.authenticateToken, (req, res) => {
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
router.get('/exemption', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
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
router.patch('/exemption/:id/status', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
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
router.patch('/exemption/:id/payment', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    const { payment_status } = req.body;
    if (!['pending', 'confirmed'].includes(payment_status)) {
        return res.status(400).json({ error: 'Invalid payment_status' });
    }
    const result = database_1.db.prepare(`UPDATE exemption_applications SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(payment_status, parseInt(req.params.id));
    if (result.changes === 0)
        return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Payment status updated' });
});
router.delete('/exemption/:id', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const applicationId = parseInt(req.params.id);
        const result = database_1.db.prepare(`
      DELETE FROM exemption_applications WHERE id = ?
    `).run(applicationId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json({ message: 'Application deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete exemption application:', error);
        res.status(500).json({ error: 'Failed to delete application' });
    }
});
router.get('/exemption/stats', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
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
router.get('/exemption/:id/document', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const applicationId = parseInt(req.params.id);
        if (isNaN(applicationId)) {
            return res.status(400).json({ error: 'Invalid application ID' });
        }
        const application = database_1.db.prepare(`
      SELECT * FROM exemption_applications WHERE id = ?
    `).get(applicationId);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        const docBuffer = (0, exemption_document_1.generateExemptionDocument)({
            name: application.name,
            gender: application.gender || '',
            birth_date: application.birth_date || '',
            address: application.address || '',
            preferred_date: application.preferred_date,
            email: application.email || '',
            phone: application.phone || '',
            license: application.license,
            course_type: application.course_type || '',
            created_at: application.created_at || '',
        });
        const fileName = encodeURIComponent(`면제교육신청서_${application.name}.docx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${fileName}`);
        res.send(docBuffer);
    }
    catch (error) {
        console.error('Failed to generate exemption document:', error);
        res.status(500).json({ error: 'Failed to generate document' });
    }
});
router.get('/cruise/:id/document', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const applicationId = parseInt(req.params.id);
        if (isNaN(applicationId)) {
            return res.status(400).json({ error: 'Invalid application ID' });
        }
        const application = database_1.db.prepare(`
      SELECT * FROM cruise_applications WHERE id = ?
    `).get(applicationId);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        let companions = [];
        let representative = {};
        try {
            if (application.special_requests) {
                const parsed = JSON.parse(application.special_requests);
                if (parsed && typeof parsed === 'object') {
                    companions = parsed.companions || [];
                    representative = parsed.representative || {};
                }
            }
        }
        catch {
        }
        const docBuffer = (0, boarding_document_1.generateBoardingDocument)({
            name: application.name,
            birth_date: representative.birthDate || '',
            gender: representative.gender || '',
            address: `${application.address_do || ''} ${application.address_sigungu || ''}`.trim(),
            phone: application.phone || '',
            experience_date: application.experience_date || '',
            companions: companions,
            created_at: application.created_at || '',
        });
        const fileName = encodeURIComponent(`승선체험신청서_${application.name}.docx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${fileName}`);
        res.send(docBuffer);
    }
    catch (error) {
        console.error('Failed to generate boarding document:', error);
        res.status(500).json({ error: 'Failed to generate document' });
    }
});
router.get('/exemption/:id/practical-document', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const applicationId = parseInt(req.params.id);
        if (isNaN(applicationId)) {
            return res.status(400).json({ error: 'Invalid application ID' });
        }
        const application = database_1.db.prepare(`
      SELECT * FROM exemption_applications WHERE id = ?
    `).get(applicationId);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        const docBuffer = (0, practical_document_1.generatePracticalDocument)({
            name: application.name,
            gender: application.gender || '',
            birth_date: application.birth_date || '',
            address: application.address || '',
            preferred_date: application.preferred_date,
            email: application.email || '',
            phone: application.phone || '',
            license: application.license,
            created_at: application.created_at || '',
        });
        const fileName = encodeURIComponent(`실기연수신청서_${application.name}.docx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${fileName}`);
        res.send(docBuffer);
    }
    catch (error) {
        console.error('Failed to generate practical document:', error);
        res.status(500).json({ error: 'Failed to generate document' });
    }
});
router.post('/education', auth_1.authenticateToken, (req, res) => {
    try {
        const { name, phone, email, birthDate, gender, address, license, courseType, preferredDates, discountEligibility, experience, motivation } = req.body;
        if (!name || !phone || !birthDate || !gender || !address || !courseType) {
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
router.get('/my-education', auth_1.authenticateToken, (req, res) => {
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
router.get('/education', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
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
router.patch('/education/:id/status', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
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
router.patch('/education/:id/payment', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    const { payment_status } = req.body;
    if (!['pending', 'confirmed'].includes(payment_status)) {
        return res.status(400).json({ error: 'Invalid payment_status' });
    }
    const result = database_1.db.prepare(`UPDATE education_applications SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(payment_status, parseInt(req.params.id));
    if (result.changes === 0)
        return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Payment status updated' });
});
router.delete('/education/:id', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
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
router.get('/education/stats', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
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
router.get('/education/export', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
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
router.get('/education/:id/document', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const applicationId = parseInt(req.params.id);
        if (isNaN(applicationId)) {
            return res.status(400).json({ error: 'Invalid application ID' });
        }
        const application = database_1.db.prepare(`
      SELECT * FROM education_applications WHERE id = ?
    `).get(applicationId);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        const docBuffer = (0, education_document_1.generateEducationDocument)({
            name: application.name,
            gender: application.gender || '',
            birth_date: application.birth_date || '',
            address: application.address || '',
            preferred_date: application.preferred_dates,
            email: application.email || '',
            phone: application.phone || '',
            license: application.license,
            course_type: application.course_type || '',
            created_at: application.created_at || '',
        });
        const fileName = encodeURIComponent(`요트교육신청서_${application.name}.docx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${fileName}`);
        res.send(docBuffer);
    }
    catch (error) {
        console.error('Failed to generate education document:', error);
        res.status(500).json({ error: 'Failed to generate document' });
    }
});
router.get('/stats', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
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
router.patch('/cruise/:id', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const applicationId = parseInt(req.params.id);
        const updates = req.body;
        if (isNaN(applicationId)) {
            return res.status(400).json({ error: 'Invalid application ID' });
        }
        const allowedFields = [
            'name', 'phone', 'email', 'experience_type', 'desired_date', 'participants',
            'address_do', 'address_sigungu', 'adult_male', 'adult_female',
            'youth_male', 'youth_female', 'status', 'special_requests',
            'infant_male', 'infant_female', 'teens_male', 'teens_female',
            'twenties_male', 'twenties_female', 'thirties_male', 'thirties_female',
            'forties_male', 'forties_female', 'fifties_plus_male', 'fifties_plus_female'
        ];
        const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        const setClause = updateFields.map(field => `${field} = ?`).join(', ');
        const values = updateFields.map(field => updates[field]);
        values.push(applicationId);
        const stmt = database_1.db.prepare(`
      UPDATE cruise_applications
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
        const result = stmt.run(...values);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        const updated = database_1.db.prepare('SELECT * FROM cruise_applications WHERE id = ?').get(applicationId);
        res.json(updated);
    }
    catch (error) {
        console.error('Failed to update cruise application:', error);
        res.status(500).json({ error: 'Failed to update application' });
    }
});
router.patch('/exemption/:id', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const applicationId = parseInt(req.params.id);
        const updates = req.body;
        if (isNaN(applicationId)) {
            return res.status(400).json({ error: 'Invalid application ID' });
        }
        const allowedFields = ['name', 'phone', 'email', 'birth_date', 'gender', 'address', 'license', 'selected_date'];
        const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        const setClause = updateFields.map(field => `${field} = ?`).join(', ');
        const values = updateFields.map(field => updates[field]);
        values.push(applicationId);
        const stmt = database_1.db.prepare(`
      UPDATE exemption_applications
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
        const result = stmt.run(...values);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        const updated = database_1.db.prepare('SELECT * FROM exemption_applications WHERE id = ?').get(applicationId);
        res.json(updated);
    }
    catch (error) {
        console.error('Failed to update exemption application:', error);
        res.status(500).json({ error: 'Failed to update application' });
    }
});
router.patch('/education/:id', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const applicationId = parseInt(req.params.id);
        const updates = req.body;
        if (isNaN(applicationId)) {
            return res.status(400).json({ error: 'Invalid application ID' });
        }
        const allowedFields = ['name', 'phone', 'email', 'course_type', 'start_date', 'status'];
        const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        const setClause = updateFields.map(field => `${field} = ?`).join(', ');
        const values = updateFields.map(field => updates[field]);
        values.push(applicationId);
        const stmt = database_1.db.prepare(`
      UPDATE education_applications
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
        const result = stmt.run(...values);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        const updated = database_1.db.prepare('SELECT * FROM education_applications WHERE id = ?').get(applicationId);
        res.json(updated);
    }
    catch (error) {
        console.error('Failed to update education application:', error);
        res.status(500).json({ error: 'Failed to update application' });
    }
});
exports.default = router;
//# sourceMappingURL=applications.js.map