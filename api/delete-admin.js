const Database = require('better-sqlite3');
const db = new Database('/var/lib/tyyacht/database.db');

// ========== 여기를 수정하세요 ==========
const username = 'admin5';  // 삭제할 아이디
// =======================================

const user = db.prepare('SELECT role FROM users WHERE username = ?').get(username);

if (!user) {
  console.log(`❌ 사용자 ${username}를 찾을 수 없습니다.`);
} else {
  const result = db.prepare('DELETE FROM users WHERE username = ?').run(username);

  if (result.changes > 0) {
    console.log(`✅ ${username} 삭제 완료`);
  }
}

db.close();
