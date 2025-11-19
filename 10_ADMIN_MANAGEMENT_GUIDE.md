# 관리자 계정 관리 가이드

## 📋 관리자 권한 체계

### 역할 구분
- **admin**: 관리자 - 모든 관리 권한
- **user**: 일반 사용자

---

## 1️⃣ 관리자 목록 조회

### 현재 관리자 확인
```bash
cd /home/test-tyyacht/api

node -e "
const Database = require('better-sqlite3');
const db = new Database('/var/lib/tyyacht/database.db');

console.log('=== 관리자 목록 ===');
const admins = db.prepare(\"SELECT id, username, email, role, full_name, is_active, last_login FROM users WHERE role = 'admin' ORDER BY id\").all();

admins.forEach(admin => {
  console.log(\`
ID: \${admin.id}
아이디: \${admin.username}
역할: \${admin.role}
이름: \${admin.full_name}
이메일: \${admin.email}
상태: \${admin.is_active ? '활성' : '비활성'}
마지막 로그인: \${admin.last_login || '없음'}
---\`);
});

db.close();
"
```

---

## 2️⃣ 관리자 추가

### 새 관리자 생성
```bash
node -e "
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const db = new Database('/var/lib/tyyacht/database.db');

// ========== 여기를 수정하세요 ==========
const newAdmin = {
  username: 'admin6',              // 아이디
  email: 'admin6@tyyacht.com',     // 이메일
  full_name: '관리자6',            // 이름
  password: 'admin1234!'           // 비밀번호
};
// =======================================

const hashedPassword = bcrypt.hashSync(newAdmin.password, 12);

try {
  const stmt = db.prepare(\`
    INSERT INTO users (username, email, password_hash, full_name, role, is_active, terms_agreed, privacy_agreed)
    VALUES (?, ?, ?, ?, 'admin', 1, 1, 1)
  \`);

  const result = stmt.run(
    newAdmin.username,
    newAdmin.email,
    hashedPassword,
    newAdmin.full_name
  );

  console.log('✅ 관리자 생성 완료');
  console.log(\`ID: \${result.lastInsertRowid}\`);
  console.log(\`아이디: \${newAdmin.username}\`);
  console.log(\`비밀번호: \${newAdmin.password}\`);

} catch (e) {
  console.error('❌ 생성 실패:', e.message);
}

db.close();
"
```

---

## 3️⃣ 비밀번호 변경

### 관리자 비밀번호 재설정
```bash
node -e "
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const db = new Database('/var/lib/tyyacht/database.db');

// ========== 여기를 수정하세요 ==========
const username = 'admin1';           // 아이디
const newPassword = 'newpass1234!';  // 새 비밀번호
// =======================================

const hashedPassword = bcrypt.hashSync(newPassword, 12);

try {
  const result = db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?')
    .run(hashedPassword, username);

  if (result.changes > 0) {
    console.log(\`✅ \${username} 비밀번호 변경 완료\`);
    console.log(\`새 비밀번호: \${newPassword}\`);
  } else {
    console.log(\`❌ 사용자 \${username}를 찾을 수 없습니다.\`);
  }
} catch (e) {
  console.error('❌ 변경 실패:', e.message);
}

db.close();
"
```

---

## 4️⃣ 관리자 정보 수정

### 이름, 이메일, 전화번호 수정
```bash
node -e "
const Database = require('better-sqlite3');
const db = new Database('/var/lib/tyyacht/database.db');

// ========== 여기를 수정하세요 ==========
const username = 'admin1';
const updates = {
  full_name: '새이름',
  email: 'newemail@tyyacht.com',
  phone: '010-1234-5678'
};
// =======================================

try {
  const result = db.prepare(\`
    UPDATE users
    SET full_name = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
    WHERE username = ?
  \`).run(updates.full_name, updates.email, updates.phone, username);

  if (result.changes > 0) {
    console.log(\`✅ \${username} 정보 수정 완료\`);

    const updated = db.prepare('SELECT username, full_name, email, phone FROM users WHERE username = ?').get(username);
    console.log(updated);
  } else {
    console.log(\`❌ 사용자 \${username}를 찾을 수 없습니다.\`);
  }
} catch (e) {
  console.error('❌ 수정 실패:', e.message);
}

db.close();
"
```

---

## 5️⃣ 계정 활성화/비활성화

### 관리자 계정 비활성화 (로그인 차단)
```bash
node -e "
const Database = require('better-sqlite3');
const db = new Database('/var/lib/tyyacht/database.db');

// ========== 여기를 수정하세요 ==========
const username = 'admin5';
const isActive = false;  // true: 활성화, false: 비활성화
// =======================================

try {
  const result = db.prepare('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?')
    .run(isActive ? 1 : 0, username);

  if (result.changes > 0) {
    console.log(\`✅ \${username} 계정 \${isActive ? '활성화' : '비활성화'} 완료\`);
  } else {
    console.log(\`❌ 사용자 \${username}를 찾을 수 없습니다.\`);
  }
} catch (e) {
  console.error('❌ 변경 실패:', e.message);
}

db.close();
"
```

---

## 6️⃣ 관리자 삭제

### 관리자 계정 완전 삭제 (주의!)
```bash
node -e "
const Database = require('better-sqlite3');
const db = new Database('/var/lib/tyyacht/database.db');

// ========== 여기를 수정하세요 ==========
const username = 'admin5';  // 삭제할 아이디
// =======================================

const user = db.prepare('SELECT role FROM users WHERE username = ?').get(username);

if (!user) {
  console.log(\`❌ 사용자 \${username}를 찾을 수 없습니다.\`);
} else {
  const result = db.prepare('DELETE FROM users WHERE username = ?').run(username);

  if (result.changes > 0) {
    console.log(\`✅ \${username} 삭제 완료\`);
  }
}

db.close();
"
```

---

## 7️⃣ 일괄 관리

### 여러 관리자 한번에 생성
```bash
node -e "
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const db = new Database('/var/lib/tyyacht/database.db');

// ========== 여기를 수정하세요 ==========
const admins = [
  { username: 'manager1', email: 'manager1@tyyacht.com', full_name: '매니저1', password: 'pass1234!' },
  { username: 'manager2', email: 'manager2@tyyacht.com', full_name: '매니저2', password: 'pass1234!' },
  { username: 'manager3', email: 'manager3@tyyacht.com', full_name: '매니저3', password: 'pass1234!' }
];
// =======================================

const stmt = db.prepare(\`
  INSERT INTO users (username, email, password_hash, full_name, role, is_active, terms_agreed, privacy_agreed)
  VALUES (?, ?, ?, ?, 'admin', 1, 1, 1)
\`);

admins.forEach(admin => {
  try {
    const hashedPassword = bcrypt.hashSync(admin.password, 12);
    stmt.run(admin.username, admin.email, hashedPassword, admin.full_name);
    console.log(\`✅ \${admin.full_name} (\${admin.username}) 생성 완료\`);
  } catch (e) {
    console.log(\`⚠️  \${admin.username}: \${e.message}\`);
  }
});

db.close();
"
```

---

## 💡 유용한 팁

### 1. 모든 계정의 비밀번호를 동일하게 초기화
```bash
node -e "
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const db = new Database('/var/lib/tyyacht/database.db');

const defaultPassword = 'reset1234!';
const hashedPassword = bcrypt.hashSync(defaultPassword, 12);

const result = db.prepare(\"UPDATE users SET password_hash = ? WHERE role = 'admin'\")
  .run(hashedPassword);

console.log(\`✅ \${result.changes}명의 관리자 비밀번호 초기화 완료\`);
console.log(\`새 비밀번호: \${defaultPassword}\`);

db.close();
"
```

### 2. 로그인 기록 확인
```bash
node -e "
const Database = require('better-sqlite3');
const db = new Database('/var/lib/tyyacht/database.db');

const admins = db.prepare(\"SELECT username, full_name, last_login FROM users WHERE role = 'admin' ORDER BY last_login DESC\").all();

console.log('=== 관리자 로그인 기록 ===');
admins.forEach(admin => {
  console.log(\`\${admin.username} (\${admin.full_name}): \${admin.last_login || '로그인 기록 없음'}\`);
});

db.close();
"
```

---

## ⚠️ 주의사항

1. **관리자는 최소 1명 유지** 필수
2. **비밀번호는 안전하게 보관**하고 주기적으로 변경
3. **삭제 전 반드시 확인** - 삭제된 계정은 복구 불가
4. 모든 명령 실행 전 **데이터베이스 백업** 권장

---

## 📂 데이터베이스 위치
- 운영 서버: `/var/lib/tyyacht/database.db`
- 테스트 서버: `/home/test-tyyacht/api/database.db`

## 🔗 관련 문서
- [환경 설정 가이드](./2_ENVIRONMENT_CHECKLIST.md)
- [배포 가이드](./3_DEPLOYMENT_MASTER_GUIDE.md)
- [보안 설정 가이드](./1_SECURITY_SETUP_GUIDE.md)
