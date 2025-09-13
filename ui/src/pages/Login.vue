<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>{{ isLogin ? '로그인' : '회원가입' }}</h1>
        <p>{{ isLogin ? '통영요트학교에 오신것을 환영합니다' : '통영요트학교와 함께하세요' }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <!-- 로그인 폼 -->
        <div v-if="isLogin">
          <div class="form-group">
            <label for="username">아이디 또는 이메일</label>
            <input 
              v-model="loginForm.username" 
              type="text" 
              id="username" 
              required 
              placeholder="아이디 또는 이메일을 입력하세요"
            >
          </div>
          
          <div class="form-group">
            <label for="password">비밀번호</label>
            <input 
              v-model="loginForm.password" 
              type="password" 
              id="password" 
              required 
              placeholder="비밀번호를 입력하세요"
            >
          </div>

          <button type="submit" class="auth-button" :disabled="authStore.state.isLoading">
            {{ authStore.state.isLoading ? '로그인 중...' : '로그인' }}
          </button>
        </div>

        <!-- 회원가입 폼 -->
        <div v-else>
          <div class="form-row">
            <div class="form-group">
              <label for="reg-username">아이디*</label>
              <input 
                v-model="registerForm.username" 
                type="text" 
                id="reg-username" 
                required 
                placeholder="아이디를 입력하세요"
              >
            </div>
            <div class="form-group">
              <label for="reg-email">이메일*</label>
              <input 
                v-model="registerForm.email" 
                type="email" 
                id="reg-email" 
                required 
                placeholder="이메일을 입력하세요"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="reg-password">비밀번호*</label>
              <input 
                v-model="registerForm.password" 
                type="password" 
                id="reg-password" 
                required 
                placeholder="비밀번호를 입력하세요"
              >
            </div>
            <div class="form-group">
              <label for="confirm-password">비밀번호 확인*</label>
              <input 
                v-model="registerForm.confirmPassword" 
                type="password" 
                id="confirm-password" 
                required 
                placeholder="비밀번호를 다시 입력하세요"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="full-name">이름*</label>
            <input 
              v-model="registerForm.fullName" 
              type="text" 
              id="full-name" 
              required 
              placeholder="이름을 입력하세요"
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="phone">전화번호</label>
              <input 
                v-model="registerForm.phone" 
                type="tel" 
                id="phone" 
                placeholder="전화번호를 입력하세요"
              >
            </div>
            <div class="form-group">
              <label for="birth-date">생년월일</label>
              <input 
                v-model="registerForm.birthDate" 
                type="date" 
                id="birth-date"
              >
            </div>
          </div>

          <div class="form-group">
            <label>성별</label>
            <div class="radio-group">
              <label class="radio-label">
                <input v-model="registerForm.gender" type="radio" value="male">
                남성
              </label>
              <label class="radio-label">
                <input v-model="registerForm.gender" type="radio" value="female">
                여성
              </label>
              <label class="radio-label">
                <input v-model="registerForm.gender" type="radio" value="other">
                기타
              </label>
            </div>
          </div>

          <div class="agreement-section">
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input v-model="registerForm.termsAgreed" type="checkbox" required>
                <router-link to="/terms" target="_blank">이용약관</router-link>에 동의합니다 (필수)
              </label>
            </div>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input v-model="registerForm.privacyAgreed" type="checkbox" required>
                <router-link to="/privacy" target="_blank">개인정보처리방침</router-link>에 동의합니다 (필수)
              </label>
            </div>
          </div>

          <button type="submit" class="auth-button" :disabled="authStore.state.isLoading">
            {{ authStore.state.isLoading ? '가입 중...' : '회원가입' }}
          </button>
        </div>
      </form>

      <div class="auth-toggle">
        <p v-if="isLogin">
          계정이 없으신가요? 
          <button @click="toggleMode" class="toggle-button">회원가입</button>
        </p>
        <p v-else>
          이미 계정이 있으신가요? 
          <button @click="toggleMode" class="toggle-button">로그인</button>
        </p>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import authStore from '../stores/auth.js';

export default {
  name: 'Login',
  data() {
    return {
      isLogin: true,
      errorMessage: '',
      authStore,
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: '',
        birthDate: '',
        gender: '',
        termsAgreed: false,
        privacyAgreed: false
      }
    };
  },
  methods: {
    toggleMode() {
      this.isLogin = !this.isLogin;
      this.errorMessage = '';
      this.resetForms();
    },
    resetForms() {
      this.loginForm = {
        username: '',
        password: ''
      };
      this.registerForm = {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: '',
        birthDate: '',
        gender: '',
        termsAgreed: false,
        privacyAgreed: false
      };
    },
    async handleSubmit() {
      this.errorMessage = '';
      
      if (this.isLogin) {
        await this.login();
      } else {
        await this.register();
      }
    },
    async login() {
      const result = await authStore.login(this.loginForm);
      
      if (result.success) {
        this.$router.push('/');
      } else {
        this.errorMessage = result.error;
      }
    },
    async register() {
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.errorMessage = '비밀번호가 일치하지 않습니다.';
        return;
      }

      if (!this.registerForm.termsAgreed || !this.registerForm.privacyAgreed) {
        this.errorMessage = '약관에 동의해주세요.';
        return;
      }

      const result = await authStore.register(this.registerForm);

      if (result.success) {
        this.isLogin = true;
        this.resetForms();
        this.errorMessage = '';
        // 자동으로 로그인 폼으로 전환되며 성공 메시지는 화면에 표시
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      } else {
        this.errorMessage = result.error;
      }
    }
  }
};
</script>

<style scoped>
.auth-container {
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  padding-top: 90px; /* 네비게이션 바 높이만큼 여백 추가 */
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  color: #2c5aa0;
  margin-bottom: 10px;
  font-size: 2rem;
}

.auth-header p {
  color: #666;
  font-size: 1.1rem;
}

.auth-form {
  margin-bottom: 30px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #2c5aa0;
}

.radio-group {
  display: flex;
  gap: 15px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  width: auto;
  margin: 0;
}

.agreement-section {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.checkbox-group {
  margin-bottom: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.95rem;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.checkbox-label a {
  color: #2c5aa0;
  text-decoration: underline;
}

.auth-button {
  width: 100%;
  padding: 15px;
  background: #2c5aa0;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.auth-button:hover:not(:disabled) {
  background: #1e3d6f;
}

.auth-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.auth-toggle {
  text-align: center;
  margin-bottom: 20px;
}

.toggle-button {
  background: none;
  border: none;
  color: #2c5aa0;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.toggle-button:hover {
  color: #1e3d6f;
}

.error-message {
  background: #ffe6e6;
  color: #d63384;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  font-weight: 500;
}

@media (max-width: 768px) {
  .auth-container {
    padding-top: 80px; /* 모바일에서 네비게이션 바 높이 조정 */
  }

  .auth-card {
    padding: 20px;
    margin: 10px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 10px;
  }
}
</style>