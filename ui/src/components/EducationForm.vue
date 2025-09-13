<template>
    <form @submit.prevent="submitApplication" class="application-form">
        <!-- 대표자 정보 섹션 -->
        <div class="form-section-title">
            <h4>대표자 정보</h4>
        </div>

        <div class="grid grid-2">
            <div class="form-group">
                <label class="form-label">이름 *</label>
                <input
                    type="text"
                    v-model="form.name"
                    class="form-control"
                    :class="{ error: errors.name }"
                    placeholder="대표자 성함을 입력하세요"
                    required
                />
                <div v-if="errors.name" class="form-error">
                    {{ errors.name }}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">생년월일 *</label>
                <input
                    type="date"
                    v-model="form.birthDate"
                    class="form-control"
                    :class="{ error: errors.birthDate }"
                    required
                />
                <div v-if="errors.birthDate" class="form-error">
                    {{ errors.birthDate }}
                </div>
            </div>
        </div>

        <div class="grid grid-2">
            <div class="form-group">
                <label class="form-label">성별 *</label>
                <select
                    v-model="form.gender"
                    class="form-control form-select"
                    :class="{ error: errors.gender }"
                    required
                >
                    <option value="">선택하세요</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                </select>
                <div v-if="errors.gender" class="form-error">
                    {{ errors.gender }}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">연락처 *</label>
                <input
                    type="tel"
                    v-model="form.phone"
                    class="form-control"
                    :class="{ error: errors.phone }"
                    placeholder="010-0000-0000"
                    required
                />
                <div v-if="errors.phone" class="form-error">
                    {{ errors.phone }}
                </div>
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">이메일</label>
            <input
                type="email"
                v-model="form.email"
                class="form-control"
                :class="{ error: errors.email }"
                placeholder="example@email.com (선택사항)"
            />
            <div v-if="errors.email" class="form-error">
                {{ errors.email }}
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">소재지 *</label>
            <input
                type="text"
                v-model="form.location"
                class="form-control"
                :class="{ error: errors.location }"
                placeholder="예: 경상남도 통영시"
                required
            />
            <div v-if="errors.location" class="form-error">
                {{ errors.location }}
            </div>
        </div>

        <!-- 교육 프로그램 정보 섹션 -->
        <div class="form-section-title">
            <h4>교육 프로그램</h4>
        </div>

        <div class="form-group">
            <label class="form-label">신청 교육과정 *</label>
            <select
                v-model="form.courseType"
                class="form-control form-select"
                :class="{ error: errors.courseType }"
                @change="onCourseTypeChange"
                required
            >
                <option value="">선택하세요</option>
                <option value="크루즈요트교육">크루즈 요트 교육</option>
                <option value="딩기요트교육">딩기 요트 교육</option>
            </select>
            <div v-if="errors.courseType" class="form-error">
                {{ errors.courseType }}
            </div>
        </div>

        <div v-if="form.courseType" class="form-group">
            <label class="form-label">세부 교육과정 *</label>
            <select
                v-model="form.subCourse"
                class="form-control form-select"
                :class="{ error: errors.subCourse }"
                required
            >
                <option value="">선택하세요</option>
                <option
                    v-for="subCourse in getSubCourses(form.courseType)"
                    :key="subCourse.value"
                    :value="subCourse.value"
                >
                    {{ subCourse.label }}
                </option>
            </select>
            <div v-if="errors.subCourse" class="form-error">
                {{ errors.subCourse }}
            </div>
        </div>

        <!-- 개인정보 동의 -->
        <div class="form-group">
            <label class="checkbox-item privacy-agreement">
                <input
                    type="checkbox"
                    v-model="form.privacyAgreed"
                    :class="{ error: errors.privacyAgreed }"
                    required
                />
                <span class="checkmark"></span>
                개인정보 수집 및 이용에 동의합니다 *
            </label>
            <div v-if="errors.privacyAgreed" class="form-error">
                개인정보 처리 동의는 필수입니다
            </div>
        </div>

        <!-- 제출 버튼 -->
        <div class="form-actions">
            <button
                type="button"
                @click="resetForm"
                class="btn btn-secondary"
                :disabled="isSubmitting"
            >
                초기화
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="loading-spinner"></span>
                {{ isSubmitting ? '제출 중...' : '교육 신청' }}
            </button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useToast } from './Toast.vue';
import { API_BASE_URL } from '../config/env.js';
import axios from 'axios';

const toast = useToast();

// 폼 데이터
const form = reactive({
    name: '',
    birthDate: '',
    gender: '',
    phone: '',
    email: '',
    location: '',
    courseType: '',
    subCourse: '',
    privacyAgreed: false,
});

// 에러 상태
const errors = ref<Record<string, string>>({});

// 제출 상태
const isSubmitting = ref(false);

// 교육과정별 세부과정 정보
const courseSubOptions = {
    크루즈요트교육: [
        { value: '크루즈-초급과정', label: '초급과정 (10만원)' },
        { value: '크루즈-중급과정', label: '중급과정 (20만원)' },
        { value: '크루즈-고급과정', label: '고급과정 (30만원)' },
        { value: '섬간항해보육', label: '섬 간(코스탈 레이스) 항해교육 1박2일(30만원)' },
        { value: '섬간항해보육', label: '섬 간(코스탈 레이스) 항해교육 2박3일(45만원)' },
    ],
    딩기요트교육: [
        { value: '딩기요트-토파즈 우노 기초', label: '토파즈 우노 기초 (7만원, 7시간)' },
        { value: '딩기요트-토파즈 우노 중급', label: '토파즈 우노 중급 (7만원, 7시간)' },
        { value: '딩기요트-토파즈 우노 고급', label: '토파즈 우노 고급 (7만원, 7시간)' },
        { value: '딩기요트-토파즈 오메가', label: '토파즈 오메가 (문의 필요)' },
        { value: '딩기요트-호비 겟어웨이', label: '호비 겟어웨이 (문의 필요)' },
    ],
};

// 세부과정 옵션 가져오기
const getSubCourses = (courseType: string) => {
    return courseSubOptions[courseType as keyof typeof courseSubOptions] || [];
};

// 교육과정 변경 시 세부과정 초기화
const onCourseTypeChange = () => {
    form.subCourse = '';
    delete errors.value.subCourse;
};

// 폼 제출
const submitApplication = async () => {
    if (!validateForm()) {
        return;
    }

    isSubmitting.value = true;

    try {
        const submitData = {
            name: form.name,
            phone: form.phone,
            email: form.email || '',
            birthDate: form.birthDate,
            gender: form.gender,
            address: form.location,
            license: '',
            courseType: form.subCourse || form.courseType,
            preferredDates: [],
            discountEligibility: '',
            experience: 'none',
            motivation: '',
        };

        const response = await axios.post(`${API_BASE_URL}/api/applications/education`, submitData);

        if (response.status === 201) {
            toast.success(
                response.data.message || '요트교육 신청이 성공적으로 접수되었습니다!',
                '신청 완료'
            );
            resetForm();
        }
    } catch (error: any) {
        console.error('Education application error:', error);

        if (error.response?.status === 400) {
            const errorMessage = error.response.data?.error || '입력 정보를 확인해주세요.';
            toast.error(errorMessage, '입력 오류');
        } else if (error.response?.status === 500) {
            toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', '서버 오류');
        } else {
            toast.error('신청 중 오류가 발생했습니다. 다시 시도해주세요.', '신청 오류');
        }
    } finally {
        isSubmitting.value = false;
    }
};

// 폼 검증
const validateForm = (): boolean => {
    errors.value = {};
    let isValid = true;

    // 필수 필드 검증
    if (!form.name.trim()) {
        errors.value.name = '이름을 입력해주세요.';
        isValid = false;
    }

    if (!form.birthDate) {
        errors.value.birthDate = '생년월일을 선택해주세요.';
        isValid = false;
    }

    if (!form.gender) {
        errors.value.gender = '성별을 선택해주세요.';
        isValid = false;
    }

    if (!form.phone.trim()) {
        errors.value.phone = '연락처를 입력해주세요.';
        isValid = false;
    } else {
        const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;
        if (!phoneRegex.test(form.phone.replace(/-/g, ''))) {
            errors.value.phone = '올바른 연락처 형식으로 입력해주세요.';
            isValid = false;
        }
    }

    // 이메일은 선택사항이므로 입력된 경우에만 검증
    if (form.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            errors.value.email = '올바른 이메일 형식으로 입력해주세요.';
            isValid = false;
        }
    }

    if (!form.location.trim()) {
        errors.value.location = '소재지를 입력해주세요.';
        isValid = false;
    }

    if (!form.courseType) {
        errors.value.courseType = '교육과정을 선택해주세요.';
        isValid = false;
    }

    if (form.courseType && !form.subCourse) {
        errors.value.subCourse = '세부 교육과정을 선택해주세요.';
        isValid = false;
    }

    if (!form.privacyAgreed) {
        errors.value.privacyAgreed = '개인정보 처리 동의는 필수입니다.';
        isValid = false;
    }

    if (!isValid) {
        toast.error('입력 정보를 확인해주세요.', '입력 오류');
    }

    return isValid;
};

// 폼 초기화
const resetForm = () => {
    Object.assign(form, {
        name: '',
        birthDate: '',
        gender: '',
        phone: '',
        email: '',
        location: '',
        courseType: '',
        subCourse: '',
        privacyAgreed: false,
    });
    errors.value = {};
};
</script>

<style scoped>
/* 폼 스타일은 global.css의 application-form 스타일을 사용 */
</style>
