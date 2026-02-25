<template>
    <div class="exemption-form">
        <form @submit.prevent="submitForm" class="form-container">
            <div class="form-header">
                <h2>실기연수 신청서</h2>
                <p>요트 실기연수 신청을 위한 정보를 입력해주세요</p>
            </div>

            <!-- 개인정보 섹션 -->
            <div class="form-section">
                <h3>개인정보</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="name">성명 *</label>
                        <input
                            type="text"
                            id="name"
                            v-model="form.name"
                            required
                            placeholder="예: 김요트"
                        />
                    </div>
                    <div class="form-group">
                        <label for="birthDate">생년월일 *</label>
                        <input type="date" id="birthDate" v-model="form.birthDate" required />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="gender">성별 *</label>
                        <select id="gender" v-model="form.gender" required>
                            <option value="">선택해주세요</option>
                            <option value="male">남성</option>
                            <option value="female">여성</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="phone">연락처 *</label>
                        <input
                            type="tel"
                            id="phone"
                            v-model="form.phone"
                            @input="handlePhoneInput"
                            required
                            placeholder="010-1234-5678"
                            maxlength="13"
                        />
                    </div>
                </div>

                <div class="form-group">
                    <label for="email">이메일</label>
                    <input
                        type="email"
                        id="email"
                        v-model="form.email"
                        placeholder="example@email.com (선택사항)"
                    />
                </div>

                <div class="form-group">
                    <label for="address">주소 *</label>
                    <input
                        type="text"
                        id="address"
                        v-model="form.address"
                        required
                        placeholder="전체 주소를 입력해주세요"
                    />
                </div>
            </div>

            <!-- 교육과정 섹션 - 실기연수 고정 -->
            <div class="form-section">
                <h3>신청 교육과정</h3>
                <div class="course-fixed">
                    <div class="course-info-fixed">
                        <strong>실기연수</strong>
                        <span class="course-price">50만원</span>
                        <p>2일 과정 (12시간, 실기 위주)</p>
                    </div>
                </div>
            </div>

            <!-- 교육일정 섹션 -->
            <div class="form-section">
                <h3>교육일정</h3>
                <div class="contact-info-box">
                    <p class="contact-message">
                        <i class="fas fa-phone"></i>
                        교육일정은 <strong>055-641-5051~2</strong>로 문의바랍니다.
                    </p>
                </div>
            </div>

            <!-- 개인정보 동의 섹션 -->
            <div class="form-section">
                <h3>개인정보 처리 동의</h3>
                <div class="agreement-box">
                    <label class="checkbox-group">
                        <input type="checkbox" v-model="form.privacyAgreed" required />
                        <span>개인정보 수집 및 이용에 동의합니다 *</span>
                    </label>
                    <div class="agreement-details">
                        <p><strong>수집 목적:</strong> 실기연수 신청 접수 및 처리</p>
                        <p><strong>수집 항목:</strong> 성명, 생년월일, 연락처, 이메일, 주소</p>
                        <p><strong>보유 기간:</strong> 교육 완료 후 1년</p>
                    </div>
                </div>
            </div>

            <!-- 제출 버튼 -->
            <div class="form-actions">
                <button type="button" class="btn-cancel" @click="resetForm">초기화</button>
                <button type="submit" class="btn-submit" :disabled="isSubmitting">
                    {{ isSubmitting ? '제출 중...' : '신청서 제출' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useToast } from './Toast.vue';
import { API_BASE_URL } from '../config/env.js';
import axios from 'axios';

// Toast 알림
const toast = useToast();

// 폼 데이터
const form = reactive({
    name: '',
    birthDate: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    courseType: 'practical',
    privacyAgreed: false,
});

// 제출 상태
const isSubmitting = ref(false);

// 폼 제출
const submitForm = async () => {
    if (!validateForm()) {
        return;
    }

    isSubmitting.value = true;

    try {
        // 백엔드 API가 기대하는 필드명으로 변환
        const submitData = {
            name: form.name,
            phone: form.phone,
            email: form.email,
            birthDate: form.birthDate,
            gender: form.gender,
            address: form.address,
            courseType: form.courseType,
        };

        const response = await axios.post(`${API_BASE_URL}/api/applications/exemption`, submitData);

        if (response.status === 201 && response.data.id) {
            toast.success(
                response.data.message || '실기연수 신청이 성공적으로 접수되었습니다!',
                '신청 완료'
            );
            resetForm();
        }
    } catch (error: any) {
        if (error.response?.status === 401) {
            toast.error('비회원은 신청이 불가합니다. 회원가입 후 시도해주세요.', '로그인 필요');
        } else {
            toast.error('신청 중 오류가 발생했습니다. 다시 시도해주세요.', '신청 오류');
        }
    } finally {
        isSubmitting.value = false;
    }
};

// 폼 검증
const validateForm = (): boolean => {
    if (!form.name.trim()) {
        toast.error('성명을 입력해주세요.');
        return false;
    }

    if (!form.birthDate) {
        toast.error('생년월일을 선택해주세요.');
        return false;
    }

    if (!form.gender) {
        toast.error('성별을 선택해주세요.');
        return false;
    }

    if (!form.phone.trim()) {
        toast.error('연락처를 입력해주세요.');
        return false;
    }

    const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;
    if (!phoneRegex.test(form.phone.replace(/-/g, ''))) {
        toast.error('올바른 연락처 형식으로 입력해주세요.');
        return false;
    }

    if (!form.address.trim()) {
        toast.error('주소를 입력해주세요.');
        return false;
    }

    // 이메일이 입력된 경우에만 형식 검증
    if (form.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            toast.error('올바른 이메일 형식으로 입력해주세요.');
            return false;
        }
    }

    if (!form.privacyAgreed) {
        toast.error('개인정보 처리 동의가 필요합니다.');
        return false;
    }

    return true;
};

// 폼 초기화
const resetForm = () => {
    Object.assign(form, {
        name: '',
        birthDate: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        courseType: 'practical',
        privacyAgreed: false,
    });
    toast.info('폼이 초기화되었습니다.');
};

// 전화번호 자동 하이픈 포맷팅
const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, '');

    if (numbers.length <= 3) {
        return numbers;
    } else if (numbers.length <= 7) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 11) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    } else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
};

const handlePhoneInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const formatted = formatPhoneNumber(target.value);
    form.phone = formatted;
};
</script>

<style scoped>
.exemption-form {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.form-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 40px;
}

.form-header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;
}

.form-header h2 {
    color: #2c5aa0;
    font-size: 2rem;
    margin-bottom: 10px;
}

.form-header p {
    color: #666;
    font-size: 1.1rem;
}

.form-section {
    margin-bottom: 35px;
}

.form-section h3 {
    color: #2c5aa0;
    font-size: 1.3rem;
    margin-bottom: 20px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e0e0e0;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    transition:
        border-color 0.3s,
        box-shadow 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #2c5aa0;
    box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
}

.course-options {
    display: grid;
    gap: 15px;
}

.course-option {
    display: flex;
    align-items: flex-start;
    padding: 20px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
}

.course-option:hover {
    border-color: #2c5aa0;
    background: rgba(44, 90, 160, 0.02);
}

.course-option input[type='radio'] {
    width: auto;
    margin: 4px 16px 0 0;
}

.course-info {
    flex: 1;
}

.course-info strong {
    display: block;
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 5px;
}

.course-price {
    display: inline-block;
    background: #2c5aa0;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 8px;
}

.course-info p {
    color: #666;
    margin: 0;
    font-size: 0.95rem;
}

/* 고정 교육과정 스타일 */
.course-fixed {
    padding: 20px;
    border: 2px solid #2c5aa0;
    border-radius: 12px;
    background: rgba(44, 90, 160, 0.05);
}

.course-info-fixed {
    text-align: center;
}

.course-info-fixed strong {
    display: block;
    font-size: 1.3rem;
    color: #2c5aa0;
    margin-bottom: 10px;
    font-weight: 700;
}

.course-info-fixed .course-price {
    display: inline-block;
    background: #2c5aa0;
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 10px;
}

.course-info-fixed p {
    color: #666;
    margin: 0;
    font-size: 1rem;
}

/* 연락처 안내 박스 */
.contact-info-box {
    padding: 25px;
    background: #f8f9fa;
    border: 2px solid #2c5aa0;
    border-radius: 12px;
    text-align: center;
}

.contact-message {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.contact-message i {
    color: #2c5aa0;
    font-size: 1.3rem;
}

.contact-message strong {
    color: #2c5aa0;
    font-size: 1.2rem;
}

.agreement-box {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
}

.checkbox-group {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    cursor: pointer;
}

.checkbox-group input[type='checkbox'] {
    width: auto;
    margin-right: 12px;
    cursor: pointer;
}

.agreement-details {
    font-size: 0.9rem;
    color: #666;
    line-height: 1.6;
}

.agreement-details p {
    margin: 5px 0;
}

.form-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;
    padding-top: 30px;
    border-top: 1px solid #e0e0e0;
}

.btn-cancel,
.btn-submit {
    padding: 15px 30px;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s;
    min-width: 140px;
}

.btn-cancel {
    background: white;
    color: #666;
    border: 2px solid #ddd;
}

.btn-cancel:hover {
    background: #f8f9fa;
    border-color: #2c5aa0;
    color: #2c5aa0;
}

.btn-submit {
    background: #2c5aa0;
    color: white;
    border: 2px solid #2c5aa0;
}

.btn-submit:hover:not(:disabled) {
    background: #1e3d6f;
    border-color: #1e3d6f;
    transform: translateY(-2px);
}

.btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

/* 모바일 반응형 */
/* 달력 스타일 */
.calendar-container {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
}

.month-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
}

.nav-btn {
    background: #2c5aa0;
    color: white;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-btn:hover {
    background: #1e3d6f;
}

.month-navigation h4 {
    margin: 0;
    color: #2c5aa0;
    font-size: 1.1rem;
}

.calendar {
    padding: 15px;
}

.calendar-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    margin-bottom: 8px;
}

.day-header {
    text-align: center;
    font-weight: bold;
    padding: 8px;
    color: #2c5aa0;
    font-size: 0.9rem;
}

.calendar-body {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
}

.calendar-day {
    padding: 10px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    border-radius: 4px;
    font-weight: 500;
}

.calendar-day:hover:not(.disabled) {
    background: #e3f2fd;
}

.calendar-day.other-month {
    color: #ccc;
    background: transparent;
}

.calendar-day.available {
    background: #e8f5e8;
    color: #2e7d2e;
    border: 1px solid #4caf50;
}

.calendar-day.available:hover {
    background: #c8e6c9;
}

.calendar-day.selected {
    background: #2c5aa0 !important;
    color: white;
}

.calendar-day.disabled {
    color: #ccc;
    cursor: not-allowed;
    background: #f8f9fa;
}

.selected-dates {
    padding: 15px;
    border-top: 1px solid #e0e0e0;
    background: #f8f9fa;
}

.selected-dates h5 {
    color: #2c5aa0;
    margin: 0 0 10px 0;
    font-size: 0.9rem;
}

.date-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.date-tag {
    background: #2c5aa0;
    color: white;
    padding: 6px 10px;
    border-radius: 16px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 0.3s;
    display: flex;
    align-items: center;
    gap: 4px;
}

.date-tag:hover {
    background: #1e3d6f;
}

.remove-btn {
    font-size: 1rem;
    font-weight: bold;
    margin-left: 4px;
}

@media (max-width: 768px) {
    .exemption-form {
        padding: 10px;
    }

    .form-container {
        padding: 25px;
    }

    .form-row {
        grid-template-columns: 1fr;
        gap: 0;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn-cancel,
    .btn-submit {
        width: 100%;
    }

    .calendar {
        padding: 10px;
    }

    .calendar-day {
        padding: 8px;
        min-height: 36px;
        font-size: 0.85rem;
    }

    .month-navigation {
        padding: 10px 15px;
    }

    .month-navigation h4 {
        font-size: 1rem;
    }

    .date-tags {
        gap: 6px;
    }

    .date-tag {
        font-size: 0.75rem;
        padding: 5px 8px;
    }
}
</style>
