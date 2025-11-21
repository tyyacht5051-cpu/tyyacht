const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

try {
    console.log('🔄 popups 테이블 생성 중...');

    // popups 테이블 생성
    db.exec(`
        CREATE TABLE IF NOT EXISTS popups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(200) NOT NULL,
            content TEXT,
            image_url VARCHAR(500),
            link_url VARCHAR(500),
            is_active BOOLEAN DEFAULT 1,
            display_order INTEGER DEFAULT 0,
            start_date DATETIME,
            end_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    console.log('✅ popups 테이블 생성 완료!');

    // 테이블 확인
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='popups'").all();
    console.log('\n생성된 테이블:', tables);

    // 샘플 데이터 삽입 (테스트용)
    const insert = db.prepare(`
        INSERT INTO popups (title, content, is_active, display_order, start_date, end_date)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now', '+30 days'))
    `);

    insert.run('환영합니다!', '통영요트학교에 오신 것을 환영합니다. 다양한 요트 프로그램을 만나보세요!', 1, 1);

    console.log('✅ 샘플 팝업 데이터 추가 완료!');

    // 삽입된 데이터 확인
    const popups = db.prepare('SELECT * FROM popups').all();
    console.log('\n현재 팝업 목록:', popups);

} catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
} finally {
    db.close();
    console.log('\n데이터베이스 연결 종료');
}
