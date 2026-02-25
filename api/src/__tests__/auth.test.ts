import request from 'supertest';
import app from '../../app';

describe('POST /api/auth/register', () => {
  // registerLimiter: IP당 최대 3번 허용 → 테스트 3개 이내로 유지

  it('중복 사용자 가입 시 409 반환 (admin은 initDatabase에서 생성됨)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'admin',
      email: 'admin@tyyacht.com',
      password: 'password123',
      fullName: '관리자',
      termsAgreed: true,
      privacyAgreed: true,
    });
    expect(res.status).toBe(409);
  });

  it('필수 필드 누락 시 400 반환', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'testuser',
      // email, password, fullName 누락
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('정상 회원가입 시 201 반환', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'testuser',
      email: 'test@test.com',
      password: 'password123',
      fullName: '테스트유저',
      termsAgreed: true,
      privacyAgreed: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.message).toBeDefined();
  });
});

describe('POST /api/auth/login', () => {
  it('필수 필드 누락 시 400 반환', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'testuser',
      // password 누락
    });
    expect(res.status).toBe(400);
  });

  it('잘못된 비밀번호 시 401 반환', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'testuser',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  it('정상 로그인 시 token 반환', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'testuser',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
  });
});
