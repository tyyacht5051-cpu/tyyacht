import Database from 'better-sqlite3';
import path from 'path';
import { config } from '../config/env';
import { ensureDirectory } from '../utils/fileSystem';

// 데이터베이스 경로 설정 (config에서 가져옴)
const dbPath = path.resolve(config.DATABASE_PATH);
console.log(`💾 Database path: ${dbPath}`);

// 데이터베이스 디렉토리 생성
const dbDir = path.dirname(dbPath);
ensureDirectory(dbDir);

// 안전한 데이터베이스 연결
let db: Database.Database;
try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL'); // 성능 향상
  db.pragma('foreign_keys = ON'); // 외래키 제약조건 활성화
  console.log('Database connected successfully');
} catch (error) {
  console.error('Database connection failed:', error);
  throw error;
}

export { db };

export function initDatabase() {
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

    -- 포토갤러리 테이블 (갤러리 그룹)
    CREATE TABLE IF NOT EXISTS photo_galleries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category_id VARCHAR(50) NOT NULL,
      author_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    -- 개별 사진 테이블
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gallery_id INTEGER NOT NULL,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INTEGER NOT NULL,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (gallery_id) REFERENCES photo_galleries(id) ON DELETE CASCADE
    );

    CREATE TRIGGER IF NOT EXISTS update_photo_galleries_updated_at
    AFTER UPDATE ON photo_galleries
    BEGIN
      UPDATE photo_galleries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
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
      experience_type VARCHAR(50) DEFAULT '크루즈요트',
      desired_date DATE,
      address_do VARCHAR(50),
      address_sigungu VARCHAR(50),
      adult_male INTEGER DEFAULT 0,
      adult_female INTEGER DEFAULT 0,
      adult_total INTEGER DEFAULT 0,
      youth_male INTEGER DEFAULT 0,
      youth_female INTEGER DEFAULT 0,
      youth_total INTEGER DEFAULT 0,
      total_participants INTEGER DEFAULT 0,
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

    -- 기존 테이블에 새 컬럼 추가 (존재하지 않는 경우에만)
    PRAGMA table_info(cruise_applications);
  `);

  // 새 컬럼들을 추가하는 ALTER TABLE 명령들
  const newColumns = [
    'ALTER TABLE cruise_applications ADD COLUMN experience_type VARCHAR(50) DEFAULT \'크루즈요트\'',
    'ALTER TABLE cruise_applications ADD COLUMN desired_date DATE',
    'ALTER TABLE cruise_applications ADD COLUMN address_do VARCHAR(50)',
    'ALTER TABLE cruise_applications ADD COLUMN address_sigungu VARCHAR(50)',
    'ALTER TABLE cruise_applications ADD COLUMN adult_male INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN adult_female INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN adult_total INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN youth_male INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN youth_female INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN youth_total INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN total_participants INTEGER DEFAULT 0',
    // 세분화된 연령대별 성별 필드
    'ALTER TABLE cruise_applications ADD COLUMN infant_male INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN infant_female INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN teens_male INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN teens_female INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN twenties_male INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN twenties_female INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN thirties_male INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN thirties_female INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN forties_male INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN forties_female INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN fifties_plus_male INTEGER DEFAULT 0',
    'ALTER TABLE cruise_applications ADD COLUMN fifties_plus_female INTEGER DEFAULT 0'
  ];

  // 각 컬럼을 안전하게 추가
  for (const alterQuery of newColumns) {
    try {
      db.exec(alterQuery);
    } catch (error: any) {
      // 컬럼이 이미 존재하는 경우는 무시
      if (!error.message.includes('duplicate column name')) {
        console.warn('Error adding column:', error.message);
      }
    }
  }

  db.exec(`

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
  
  // 최고 관리자 계정 생성 (super_admin)
  const superAdminExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('super_admin') as { count: number };
  if (superAdminExists.count === 0) {
    const bcrypt = require('bcrypt');

    // 환경변수에서 관리자 비밀번호 가져오기, 없으면 기본값 사용
    const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'tyyacht-admin-2024';

    if (!process.env.ADMIN_PASSWORD && process.env.NODE_ENV === 'production') {
      console.warn('⚠️  ADMIN_PASSWORD not set in production environment');
    }

    const adminPassword = bcrypt.hashSync(defaultAdminPassword, 12);

    // 기존 admin 계정을 super_admin으로 업그레이드
    const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ? AND role = ?').get('admin', 'admin');
    if (existingAdmin) {
      db.prepare('UPDATE users SET role = ? WHERE id = ?').run('super_admin', (existingAdmin as any).id);
      console.log('✅ Existing admin account upgraded to super_admin');
    } else {
      // 새로운 super_admin 계정 생성
      db.prepare(`
        INSERT INTO users (username, email, password_hash, full_name, role, is_active, terms_agreed, privacy_agreed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run('admin', 'admin@tyyacht.com', adminPassword, '통영요트학교 최고관리자', 'super_admin', 1, 1, 1);

      console.log('✅ Super admin account created');
    }

    if (!process.env.ADMIN_PASSWORD) {
      console.log('⚠️  Using default admin password. Please set ADMIN_PASSWORD environment variable.');
    }
  }
  
  // 기존 테이블에 누락된 컬럼이 있는지 확인하고 추가
  try {
    // notices 테이블에 published 컬럼이 없는 경우 추가
    db.exec(`
      ALTER TABLE notices ADD COLUMN published BOOLEAN DEFAULT 1;
    `);
    console.log('Added published column to notices table');
  } catch (error) {
    // 컬럼이 이미 존재하는 경우 무시
  }

  try {
    // exemption_applications 테이블에 gender 컬럼이 없는 경우 추가
    db.exec(`
      ALTER TABLE exemption_applications ADD COLUMN gender VARCHAR(10);
    `);
    console.log('Added gender column to exemption_applications table');
  } catch (error) {
    // 컬럼이 이미 존재하는 경우 무시
  }

  try {
    // exemption_schedules 테이블에 is_closed 컬럼이 없는 경우 추가
    db.exec(`
      ALTER TABLE exemption_schedules ADD COLUMN is_closed BOOLEAN DEFAULT 0;
    `);
    console.log('Added is_closed column to exemption_schedules table');
  } catch (error) {
    // 컬럼이 이미 존재하는 경우 무시
  }

  try {
    // exemption_applications 테이블에 preferred_date 컬럼이 없는 경우 추가
    db.exec(`
      ALTER TABLE exemption_applications ADD COLUMN preferred_date TEXT;
    `);
    console.log('Added preferred_date column to exemption_applications table');
  } catch (error) {
    // 컬럼이 이미 존재하는 경우 무시
  }


  // 초기 스케줄 데이터 생성 (스케줄이 없을 때만)
  try {
    const existingSchedules = db.prepare('SELECT COUNT(*) as count FROM exemption_schedules').get() as { count: number };
    
    if (existingSchedules.count === 0) {
      // 9월 스케줄 추가 (관리자가 정한 날짜: 19, 20, 21, 27, 28)
      const septemberDates = ["2025-09-19", "2025-09-20", "2025-09-21", "2025-09-27", "2025-09-28"];
      db.prepare(`
        INSERT INTO exemption_schedules (month, dates, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run('2025-09', JSON.stringify(septemberDates));
      console.log('9월 면제교육 스케줄이 추가되었습니다:', septemberDates);

      // 10월 스케줄 추가 (관리자가 정한 날짜: 19, 20, 21, 27, 28)
      const octoberDates = ["2025-10-19", "2025-10-20", "2025-10-21", "2025-10-27", "2025-10-28"];
      db.prepare(`
        INSERT INTO exemption_schedules (month, dates, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run('2025-10', JSON.stringify(octoberDates));
      console.log('10월 면제교육 스케줄이 추가되었습니다:', octoberDates);
      
      console.log('초기 면제교육 스케줄이 생성되었습니다.');
    } else {
      console.log('기존 면제교육 스케줄이 존재하여 건너뜁니다.');
    }
  } catch (error) {
    console.error('Error initializing schedules:', error);
  }

  console.log('Exemption schedules initialized');

  // 후기게시판 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      category_id VARCHAR(50) NOT NULL,
      rating INTEGER DEFAULT 5,
      author_id INTEGER NOT NULL,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TRIGGER IF NOT EXISTS update_reviews_updated_at
    AFTER UPDATE ON reviews
    BEGIN
      UPDATE reviews SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  // 크루모집게시판 테이블 - 기존 테이블 삭제 후 재생성
  try {
    db.exec('DROP TABLE IF EXISTS crew_recruitments;');
    console.log('Dropped existing crew_recruitments table');
  } catch (error) {
    console.log('No existing crew_recruitments table to drop');
  }

  db.exec(`
    CREATE TABLE crew_recruitments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      recruitment_type VARCHAR(50) NOT NULL,
      vessel_name VARCHAR(255),
      vessel_model VARCHAR(255),
      preferred_gender VARCHAR(10),
      preferred_age VARCHAR(100),
      yacht_license VARCHAR(10),
      competition_history TEXT,
      target_competition VARCHAR(255),
      max_crew INTEGER,
      current_crew INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'recruiting',
      author_id INTEGER NOT NULL,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TRIGGER update_crew_recruitments_updated_at
    AFTER UPDATE ON crew_recruitments
    BEGIN
      UPDATE crew_recruitments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  // 크루 참가 신청 테이블
  db.exec(`
    DROP TABLE IF EXISTS crew_applications;
    CREATE TABLE crew_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recruitment_id INTEGER NOT NULL,
      applicant_name VARCHAR(100) NOT NULL,
      applicant_phone VARCHAR(20) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recruitment_id) REFERENCES crew_recruitments(id) ON DELETE CASCADE
    );
  `);

  console.log('Database initialized successfully');
}