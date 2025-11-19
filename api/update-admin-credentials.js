const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

async function updateAdminCredentials() {
  try {
    const newUsername = 'tyyacht';
    const newPassword = 'ty!@pass#$';

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 기존 admin 계정 찾기 (role이 admin인 첫 번째 계정)
    const adminUser = db.prepare(`
      SELECT * FROM users WHERE role = 'admin' ORDER BY id LIMIT 1
    `).get();

    if (!adminUser) {
      console.log('❌ Admin 계정을 찾을 수 없습니다.');
      process.exit(1);
    }

    console.log('📋 현재 Admin 계정:', adminUser.username);

    // 새 username이 이미 존재하는지 확인 (자기 자신 제외)
    const existingUser = db.prepare(`
      SELECT * FROM users WHERE username = ? AND id != ?
    `).get(newUsername, adminUser.id);

    if (existingUser) {
      console.log('❌ 새 아이디가 이미 존재합니다:', newUsername);
      process.exit(1);
    }

    // Admin 계정 업데이트
    const result = db.prepare(`
      UPDATE users
      SET username = ?, password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newUsername, hashedPassword, adminUser.id);

    if (result.changes > 0) {
      console.log('✅ Admin 계정이 성공적으로 업데이트되었습니다!');
      console.log('   새 아이디:', newUsername);
      console.log('   새 비밀번호: ty!@pass#$');
      console.log('');
      console.log('⚠️  보안을 위해 이 비밀번호를 안전한 곳에 보관하세요!');
    } else {
      console.log('❌ 업데이트 실패');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

updateAdminCredentials();
