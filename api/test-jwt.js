const jwt = require('jsonwebtoken');

// 현재 localStorage에 있는 토큰 (예제)
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYWxzcmwxOTIiLCJpYXQiOjE3MzEyMzg5MjksImV4cCI6MTczMTMyNTMyOX0.LzFcxGZU6Lz_u8JmP3LMvMdHGkEqy6pzKGFy4KbMzB8'; // 실제 토큰을 여기 붙여넣으세요

console.log('Testing JWT secrets...');

// 로그인 시 사용하는 시크릿
const loginSecret = 'tyyacht-jwt-secret-key-2024';
// 기존 applications.ts에서 사용하던 시크릿  
const oldSecret = 'your-secret-key';

console.log('\n1. Testing with login secret (tyyacht-jwt-secret-key-2024):');
try {
  const decoded1 = jwt.verify(token, loginSecret);
  console.log('✅ SUCCESS:', decoded1);
} catch (error) {
  console.log('❌ FAILED:', error.message);
}

console.log('\n2. Testing with old secret (your-secret-key):');
try {
  const decoded2 = jwt.verify(token, oldSecret);
  console.log('✅ SUCCESS:', decoded2);
} catch (error) {
  console.log('❌ FAILED:', error.message);
}