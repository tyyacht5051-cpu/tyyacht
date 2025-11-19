const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

try {
  console.log('🔄 super_admin을 admin으로 변경 중...');

  // super_admin을 모두 admin으로 변경
  const result = db.prepare(`
    UPDATE users
    SET role = 'admin', updated_at = CURRENT_TIMESTAMP
    WHERE role = 'super_admin'
  `).run();

  console.log(`✅ ${result.changes}개의 계정이 admin으로 변경되었습니다.`);

  // 변경 후 확인
  console.log('\n=== 현재 관리자 목록 ===');
  const admins = db.prepare(`
    SELECT id, username, email, role, full_name, is_active
    FROM users
    WHERE role = 'admin'
    ORDER BY id
  `).all();

  admins.forEach(admin => {
    console.log(`ID: ${admin.id} | ${admin.username} (${admin.full_name}) | ${admin.email}`);
  });

  console.log('\n✅ 모든 관리자가 admin 역할로 통일되었습니다.');

} catch (error) {
  console.error('❌ 오류 발생:', error);
  process.exit(1);
} finally {
  db.close();
}
