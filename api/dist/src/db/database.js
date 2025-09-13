"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initDatabase = initDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
let dbPath;
if (isProduction) {
    dbPath = process.env.DATABASE_PATH || '/var/lib/tyyacht/database.db';
    const dbDir = path_1.default.dirname(dbPath);
    if (!fs_1.default.existsSync(dbDir)) {
        try {
            fs_1.default.mkdirSync(dbDir, { recursive: true, mode: 0o755 });
            console.log(`Created database directory: ${dbDir}`);
        }
        catch (error) {
            console.error(`Failed to create database directory: ${error}`);
            dbPath = path_1.default.join(process.cwd(), 'database.db');
        }
    }
}
else {
    dbPath = path_1.default.join(__dirname, '../../database.db');
}
console.log(`Database path: ${dbPath}`);
let db;
try {
    exports.db = db = new better_sqlite3_1.default(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    console.log('Database connected successfully');
}
catch (error) {
    console.error('Database connection failed:', error);
    throw error;
}
function initDatabase() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS home_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TRIGGER IF NOT EXISTS update_home_data_updated_at
    AFTER UPDATE ON home_data
    BEGIN
      UPDATE home_data SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
    
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      birth_date DATE,
      gender VARCHAR(10),
      role VARCHAR(20) DEFAULT 'user',
      is_active BOOLEAN DEFAULT 1,
      terms_agreed BOOLEAN DEFAULT 0,
      privacy_agreed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );
    
    CREATE TRIGGER IF NOT EXISTS update_users_updated_at
    AFTER UPDATE ON users
    BEGIN
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    -- 공지사항 테이블
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      category_id VARCHAR(50) NOT NULL,
      important BOOLEAN DEFAULT 0,
      views INTEGER DEFAULT 0,
      author_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TRIGGER IF NOT EXISTS update_notices_updated_at
    AFTER UPDATE ON notices
    BEGIN
      UPDATE notices SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    -- 공지사항 첨부 이미지 테이블
    CREATE TABLE IF NOT EXISTS notice_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notice_id INTEGER NOT NULL,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE
    );

    -- 포토갤러리 테이블
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category_id VARCHAR(50) NOT NULL,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TRIGGER IF NOT EXISTS update_photos_updated_at
    AFTER UPDATE ON photos
    BEGIN
      UPDATE photos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    -- 동영상갤러리 테이블
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category_id VARCHAR(50) NOT NULL,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INTEGER NOT NULL,
      thumbnail_path VARCHAR(500),
      duration VARCHAR(10),
      views INTEGER DEFAULT 0,
      author_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TRIGGER IF NOT EXISTS update_videos_updated_at
    AFTER UPDATE ON videos
    BEGIN
      UPDATE videos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    -- 승선체험 신청 테이블
    CREATE TABLE IF NOT EXISTS cruise_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(100) NOT NULL,
      experience_date DATE NOT NULL,
      participants INTEGER NOT NULL,
      special_requests TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TRIGGER IF NOT EXISTS update_cruise_applications_updated_at
    AFTER UPDATE ON cruise_applications
    BEGIN
      UPDATE cruise_applications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    -- 면제교육 신청 테이블
    CREATE TABLE IF NOT EXISTS exemption_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(100) NOT NULL,
      birth_date DATE NOT NULL,
      gender VARCHAR(10),
      address TEXT NOT NULL,
      license VARCHAR(50),
      course_type VARCHAR(50) NOT NULL,
      preferred_dates TEXT,
      discount_eligibility VARCHAR(50),
      status VARCHAR(20) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TRIGGER IF NOT EXISTS update_exemption_applications_updated_at
    AFTER UPDATE ON exemption_applications
    BEGIN
      UPDATE exemption_applications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    -- 면제교육 일정 테이블
    CREATE TABLE IF NOT EXISTS exemption_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      dates TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(month)
    );

    CREATE TRIGGER IF NOT EXISTS update_exemption_schedules_updated_at
    AFTER UPDATE ON exemption_schedules
    BEGIN
      UPDATE exemption_schedules SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    -- 요트교육 신청 테이블
    CREATE TABLE IF NOT EXISTS education_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(100) NOT NULL,
      birth_date DATE NOT NULL,
      gender VARCHAR(10) NOT NULL,
      address TEXT NOT NULL,
      license VARCHAR(50),
      course_type VARCHAR(50) NOT NULL,
      preferred_dates TEXT,
      discount_eligibility VARCHAR(50),
      experience VARCHAR(50) DEFAULT 'none',
      motivation TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TRIGGER IF NOT EXISTS update_education_applications_updated_at
    AFTER UPDATE ON education_applications
    BEGIN
      UPDATE education_applications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);
    const adminExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin');
    if (adminExists.count === 0) {
        const bcrypt = require('bcrypt');
        const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'tyyacht-admin-2024';
        if (!process.env.ADMIN_PASSWORD && process.env.NODE_ENV === 'production') {
            console.warn('⚠️  ADMIN_PASSWORD not set in production environment');
        }
        const adminPassword = bcrypt.hashSync(defaultAdminPassword, 12);
        db.prepare(`
      INSERT INTO users (username, email, password_hash, full_name, role, is_active, terms_agreed, privacy_agreed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('admin', 'admin@tyyacht.com', adminPassword, '통영요트학교 관리자', 'admin', 1, 1, 1);
        console.log('✅ Admin account created');
        if (!process.env.ADMIN_PASSWORD) {
            console.log('⚠️  Using default admin password. Please set ADMIN_PASSWORD environment variable.');
        }
    }
    try {
        db.exec(`
      ALTER TABLE exemption_applications ADD COLUMN gender VARCHAR(10);
    `);
        console.log('Added gender column to exemption_applications table');
    }
    catch (error) {
    }
    try {
        const existingSchedules = db.prepare('SELECT COUNT(*) as count FROM exemption_schedules').get();
        if (existingSchedules.count === 0) {
            const septemberDates = ["2025-09-19", "2025-09-20", "2025-09-21", "2025-09-27", "2025-09-28"];
            db.prepare(`
        INSERT INTO exemption_schedules (month, dates, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run('2025-09', JSON.stringify(septemberDates));
            console.log('9월 면제교육 스케줄이 추가되었습니다:', septemberDates);
            const octoberDates = ["2025-10-19", "2025-10-20", "2025-10-21", "2025-10-27", "2025-10-28"];
            db.prepare(`
        INSERT INTO exemption_schedules (month, dates, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run('2025-10', JSON.stringify(octoberDates));
            console.log('10월 면제교육 스케줄이 추가되었습니다:', octoberDates);
            console.log('초기 면제교육 스케줄이 생성되었습니다.');
        }
        else {
            console.log('기존 면제교육 스케줄이 존재하여 건너뜁니다.');
        }
    }
    catch (error) {
        console.error('Error initializing schedules:', error);
    }
    console.log('Exemption schedules initialized');
    console.log('Database initialized successfully');
}
//# sourceMappingURL=database.js.map