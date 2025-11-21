<template>
    <div class="page-content">
        <div class="container">
            <div class="experience-apply">
                <!-- 페이지 헤더 -->
                <div class="page-header">
                    <h1 class="section-title">체험 프로그램 신청</h1>
                    <p class="section-subtitle">다양한 해양 체험 프로그램에 참여하세요</p>
                </div>

                <!-- 승선체험 프로그램 안내 -->
                <div class="info-section">
                    <div class="card">
                        <div class="card-header">
                            <h3>체험 프로그램 소개</h3>
                        </div>
                        <div class="card-body">
                            <div class="grid grid-3">
                                <div class="qualification-item">
                                    <div class="qualification-icon">
                                        <i class="fas fa-ship"></i>
                                    </div>
                                    <h4>크루져 요트 체험</h4>
                                    <p>대형 요트에서 편안한 크루져 체험</p>
                                </div>
                                <div class="qualification-item">
                                    <div class="qualification-icon">
                                        <i class="fas fa-sailboat"></i>
                                    </div>
                                    <h4>딩기 요트 체험</h4>
                                    <p>소형 요트로 직접 조종해보는 실전 체험</p>
                                </div>
                                <div class="qualification-item">
                                    <div class="qualification-icon">
                                        <i class="fas fa-water"></i>
                                    </div>
                                    <h4>패들보드 체험</h4>
                                    <p>초보자도 쉬게 운동할 수 있는 SUP 체험</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 신청 폼 -->
                <div class="form-section">
                    <div class="card">
                        <div class="card-header">
                            <h3>신청서 작성</h3>
                        </div>
                        <div class="card-body">
                            <form @submit.prevent="submitApplication" class="application-form">
                                <!-- 대표자 정보 섹션 -->
                                <div class="form-section-title">
                                    <h4>대표자 정보</h4>
                                </div>

                                <div class="grid grid-3">
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

                                    <div class="form-group">
                                        <label class="form-label">성별 *</label>
                                        <select
                                            v-model="form.gender"
                                            class="form-control form-select"
                                            :class="{ error: errors.gender }"
                                            required
                                        >
                                            <option value="">선택하세요</option>
                                            <option value="M">남성</option>
                                            <option value="F">여성</option>
                                        </select>
                                        <div v-if="errors.gender" class="form-error">
                                            {{ errors.gender }}
                                        </div>
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

                                <!-- 체험 프로그램 정보 섹션 -->
                                <div class="form-section-title">
                                    <h4>체험 프로그램</h4>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">희망 체험 프로그램 *</label>
                                    <select
                                        v-model="form.programType"
                                        class="form-control form-select"
                                        :class="{ error: errors.programType }"
                                        @change="onProgramTypeChange"
                                        required
                                    >
                                        <option value="">선택하세요</option>
                                        <option value="크루져요트체험">크루져 요트 체험</option>
                                        <option value="딩기요트체험">딩기 요트 체험</option>
                                        <option value="패들보드체험">패들보드 체험</option>
                                    </select>
                                    <div v-if="errors.programType" class="form-error">
                                        {{ errors.programType }}
                                    </div>
                                </div>

                                <div v-if="form.programType" class="form-group">
                                    <label class="form-label">세부 프로그램 *</label>
                                    <select
                                        v-model="form.subProgram"
                                        class="form-control form-select"
                                        :class="{ error: errors.subProgram }"
                                        required
                                    >
                                        <option value="">선택하세요</option>
                                        <option 
                                            v-for="subProgram in getSubPrograms(form.programType)" 
                                            :key="subProgram.value" 
                                            :value="subProgram.value"
                                        >
                                            {{ subProgram.label }}
                                        </option>
                                    </select>
                                    <div v-if="errors.subProgram" class="form-error">
                                        {{ errors.subProgram }}
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">희망 체험 날짜 *</label>
                                    <input
                                        type="date"
                                        v-model="form.preferredDate"
                                        class="form-control"
                                        :class="{ error: errors.preferredDate }"
                                        :min="new Date().toISOString().split('T')[0]"
                                        required
                                    />
                                    <div v-if="errors.preferredDate" class="form-error">
                                        {{ errors.preferredDate }}
                                    </div>
                                </div>

                                <div class="grid grid-1">
                                    <div class="form-group">
                                        <label class="form-label">총 참가 인원 (대표자 포함) *</label>
                                        <select
                                            v-model="form.participants"
                                            class="form-control form-select"
                                            :class="{ error: errors.participants }"
                                            required
                                        >
                                            <option value="">선택하세요</option>
                                            <option v-for="n in 31" :key="n" :value="n">{{ n }}명</option>
                                        </select>
                                        <div v-if="errors.participants" class="form-error">
                                            {{ errors.participants }}
                                        </div>
                                    </div>
                                </div>

                                <!-- 동승자 정보 섹션 -->
                                <div class="form-section-title">
                                    <h4>동승자 정보</h4>
                                    <p class="section-description">대표자를 제외한 동승자 정보를 입력해주세요 (최대 30명)</p>
                                </div>

                                <div class="companions-section">
                                    <div 
                                        v-for="(companion, index) in form.companions" 
                                        :key="index" 
                                        class="companion-item"
                                    >
                                        <div class="companion-header">
                                            <h5>동승자 {{ index + 1 }}</h5>
                                            <button 
                                                type="button" 
                                                @click="removeCompanion(index)"
                                                class="remove-companion-btn"
                                            >
                                                <i class="fas fa-times"></i> 삭제
                                            </button>
                                        </div>
                                        <div class="grid grid-3">
                                            <div class="form-group">
                                                <label class="form-label">이름 *</label>
                                                <input
                                                    type="text"
                                                    v-model="companion.name"
                                                    class="form-control"
                                                    :class="{ error: errors[`companion_${index}_name`] }"
                                                    placeholder="이름을 입력하세요"
                                                    required
                                                />
                                                <div v-if="errors[`companion_${index}_name`]" class="form-error">
                                                    {{ errors[`companion_${index}_name`] }}
                                                </div>
                                            </div>
                                            <div class="form-group">
                                                <label class="form-label">생년월일 *</label>
                                                <input
                                                    type="date"
                                                    v-model="companion.birthDate"
                                                    class="form-control"
                                                    :class="{ error: errors[`companion_${index}_birthDate`] }"
                                                    required
                                                />
                                                <div v-if="errors[`companion_${index}_birthDate`]" class="form-error">
                                                    {{ errors[`companion_${index}_birthDate`] }}
                                                </div>
                                            </div>
                                            <div class="form-group">
                                                <label class="form-label">성별 *</label>
                                                <select
                                                    v-model="companion.gender"
                                                    class="form-control form-select"
                                                    :class="{ error: errors[`companion_${index}_gender`] }"
                                                    required
                                                >
                                                    <option value="">선택하세요</option>
                                                    <option value="M">남성</option>
                                                    <option value="F">여성</option>
                                                </select>
                                                <div v-if="errors[`companion_${index}_gender`]" class="form-error">
                                                    {{ errors[`companion_${index}_gender`] }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="add-companion-section">
                                        <button 
                                            type="button" 
                                            @click="addCompanion"
                                            class="btn btn-outline-primary"
                                            :disabled="form.companions.length >= 30"
                                        >
                                            <i class="fas fa-plus"></i> 동승자 추가 ({{ form.companions.length }}/30)
                                        </button>
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
                                    <button
                                        type="submit"
                                        class="btn btn-primary"
                                        :disabled="isSubmitting"
                                        @click="action"
                                    >
                                        <span v-if="isSubmitting" class="loading-spinner"></span>
                                        {{ isSubmitting ? '제출 중...' : '체험 신청' }}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { API_BASE_URL } from '../config/env.js';

import { useToast } from '../components/Toast.vue'

export default {
    name: 'ExperienceApply',
    setup() {
        const toast = useToast()
        return { toast }
    },
    data() {
        return {
            form: {
                name: '',
                birthDate: '',
                gender: '',
                phone: '',
                location: '',
                programType: '',
                subProgram: '',
                preferredDate: '',
                participants: '',
                companions: [],
                privacyAgreed: false,
            },
            errors: {},
            isSubmitting: false,
            subPrograms: {
                '크루져요트체험': [
                    { value: '한산대첩승전항로1', label: '한산대첩 승전항로 (1시간) - 25,000원' },
                    { value: '한산대첩승전항로2', label: '한산대첩 승전항로 연장 (1시간 30분) - 30,000원' },
                    { value: '이순신역사탐방', label: '이순신 역사 탐방 (2시간) - 35,000원' },
                    { value: '힐링섬탐방1', label: '힐링 섬 탐방 (4시간) - 80,000원' },
                    { value: '힐링섬탐방2', label: '힐링 섬 탐방 하루종일 (8시간) - 120,000원' },
                    { value: '선셈체험', label: '선셋 체험 (1시간 30분) - 35,000원' }
                ],
                '딩기요트체험': [
                    { value: '호비겟어웨이체험', label: '호비 겟어웨이 체험 (2-4시간)' },
                    { value: '토파즈오메가체험', label: '토파즈 오메가 체험 (2-4시간)' }
                ],
                '패들보드체험': [
                    { value: '6인용패들보드체험', label: '6인용 패들보드 체험 (2시간)' },
                    { value: '1-2인용패들보드체험', label: '1-2인용 패들보드 체험 (2시간)' }
                ]
            },
        };
    },
    methods: {
        validateForm() {
            this.errors = {};

            if (!this.form.name.trim()) {
                this.errors.name = '이름을 입력해주세요';
            }

            if (!this.form.birthDate) {
                this.errors.birthDate = '생년월일을 선택해주세요';
            }

            if (!this.form.gender) {
                this.errors.gender = '성별을 선택해주세요';
            }

            if (!this.form.phone.trim()) {
                this.errors.phone = '연락처를 입력해주세요';
            } else if (!/^010-\d{4}-\d{4}$/.test(this.form.phone)) {
                this.errors.phone = '올바른 연락처 형식이 아닙니다';
            }


            if (!this.form.programType) {
                this.errors.programType = '체험 프로그램을 선택해주세요';
            }

            if (this.form.programType && !this.form.subProgram) {
                this.errors.subProgram = '세부 프로그램을 선택해주세요';
            }

            if (!this.form.preferredDate) {
                this.errors.preferredDate = '희망 날짜를 선택해주세요';
            } else {
                const selectedDate = new Date(this.form.preferredDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate < today) {
                    this.errors.preferredDate = '오늘 이후 날짜를 선택해주세요';
                }
            }

            if (!this.form.participants) {
                this.errors.participants = '참가 인원을 선택해주세요';
            }

            if (!this.form.location.trim()) {
                this.errors.location = '소재지를 입력해주세요';
            }

            // 동승자 정보 검증
            this.form.companions.forEach((companion, index) => {
                if (!companion.name.trim()) {
                    this.errors[`companion_${index}_name`] = '이름을 입력해주세요';
                }
                if (!companion.birthDate) {
                    this.errors[`companion_${index}_birthDate`] = '생년월일을 선택해주세요';
                }
                if (!companion.gender) {
                    this.errors[`companion_${index}_gender`] = '성별을 선택해주세요';
                }
            });

            if (!this.form.privacyAgreed) {
                this.errors.privacyAgreed = '개인정보 처리 동의는 필수입니다';
            }

            return Object.keys(this.errors).length === 0;
        },

        async submitApplication() {
            if (!this.validateForm()) {
                this.scrollToFirstError();
                return;
            }

            this.isSubmitting = true;

            try {
                // 대표자와 동승자 정보를 포함한 신청서 정보 - 서버에서 실제 demographic 계산
                const applicationData = {
                    name: this.form.name,
                    phone: this.form.phone,
                    email: '', // ExperienceApply 폼에는 이메일 필드가 없음 - 추가 필요
                    experience_date: this.form.preferredDate,
                    participants: parseInt(this.form.participants) || 1,
                    experience_type: this.form.programType || '크루즈요트',
                    // 대표자 정보 포함
                    representative: {
                        name: this.form.name,
                        birthDate: this.form.birthDate,
                        gender: this.form.gender
                    },
                    // 동승자 정보 포함
                    companions: this.form.companions,
                    // 소재지 정보
                    location: this.form.location,
                    special_requests: `프로그램: ${this.form.programType} - ${this.form.subProgram}\n소재지: ${this.form.location}\n동승자: ${this.form.companions.length}명`
                };
                
                const response = await axios.post(`${API_BASE_URL}/api/applications/cruise`, applicationData);

                if (response.status === 201 && response.data.id) {
                    this.toast.celebrate(response.data.message || '체험 프로그램 신청이 성공적으로 접수되었습니다!');
                    this.$router.push('/');
                }
            } catch (error) {
                console.error('신청 중 오류:', error);
                this.toast.error('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
            } finally {
                this.isSubmitting = false;
            }
        },

        resetForm() {
            this.form = {
                name: '',
                birthDate: '',
                phone: '',
                location: '',
                programType: '',
                subProgram: '',
                preferredDate: '',
                participants: '',
                companions: [],
                privacyAgreed: false,
            };
            this.errors = {};
        },

        addCompanion() {
            if (this.form.companions.length < 30) {
                this.form.companions.push({
                    name: '',
                    birthDate: '',
                    gender: ''
                });
            }
        },

        removeCompanion(index) {
            this.form.companions.splice(index, 1);
            // 동승자 삭제 시 관련 에러 메시지도 삭제
            const errorKeys = Object.keys(this.errors).filter(key => key.startsWith(`companion_${index}_`));
            errorKeys.forEach(key => delete this.errors[key]);
        },

        onProgramTypeChange() {
            // 메인 프로그램 변경 시 세부 프로그램 초기화
            this.form.subProgram = '';
            delete this.errors.subProgram;
        },

        getSubPrograms(programType) {
            return this.subPrograms[programType] || [];
        },

        scrollToFirstError() {
            this.$nextTick(() => {
                const firstError = document.querySelector('.form-control.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        },
    },
    computed: {
        availableSubPrograms() {
            return this.getSubPrograms(this.form.programType);
        }
    },
    watch: {
        'form.participants': function(newVal, oldVal) {
            const totalParticipants = parseInt(newVal) || 0;
            const currentCompanions = this.form.companions.length;
            const neededCompanions = totalParticipants - 1; // 대표자 제외

            if (neededCompanions > currentCompanions) {
                // 동승자 추가
                for (let i = currentCompanions; i < neededCompanions && i < 30; i++) {
                    this.addCompanion();
                }
            } else if (neededCompanions < currentCompanions) {
                // 동승자 제거
                this.form.companions.splice(neededCompanions);
            }
        },
        'form.programType': function(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.form.subProgram = '';
                delete this.errors.subProgram;
            }
        }
    },
};
</script>

<style scoped>
.experience-apply {
    max-width: 1000px;
    margin: 0 auto;
}

.page-header {
    text-align: center;
    margin-bottom: 3rem;
}

.info-section {
    margin-bottom: 3rem;
}

.qualification-item {
    text-align: center;
    padding: 20px;
}

.qualification-icon {
    font-size: 3rem;
    color: #2c5aa0;
    margin-bottom: 1rem;
}

.qualification-item h4 {
    color: #2c5aa0;
    margin-bottom: 0.5rem;
}

.form-section-title {
    margin: 2rem 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #2c5aa0;
}

.form-section-title h4 {
    color: #2c5aa0;
    margin: 0;
}

.checkbox-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.checkbox-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: background 0.3s;
}

.checkbox-item:hover {
    background: #f8f9fa;
}

.checkbox-item input[type='checkbox'] {
    display: none;
}

.checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid #ddd;
    border-radius: 4px;
    margin-right: 10px;
    position: relative;
    transition: all 0.3s;
}

.checkbox-item input[type='checkbox']:checked + .checkmark {
    background: #2c5aa0;
    border-color: #2c5aa0;
}

.checkbox-item input[type='checkbox']:checked + .checkmark::after {
    content: '✓';
    position: absolute;
    color: white;
    font-size: 14px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.privacy-agreement {
    font-weight: 500;
    color: #333;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #f8f9fa;
}

.file-info {
    margin-top: 5px;
}

.uploaded-files {
    margin-top: 15px;
}

.file-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 4px;
    margin-bottom: 5px;
}

.file-item i {
    margin-right: 8px;
    color: #2c5aa0;
}

.file-item span {
    flex: 1;
    font-size: 14px;
}

.remove-btn {
    background: none;
    border: none;
    color: #dc3545;
    cursor: pointer;
    padding: 2px 5px;
    border-radius: 3px;
    transition: background 0.3s;
}

.remove-btn:hover {
    background: #dc3545;
    color: white;
}

.form-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #eee;
}

.section-description {
    font-size: 14px;
    color: #666;
    margin-top: 5px;
    margin-bottom: 0;
}

.companions-section {
    margin-top: 20px;
}

.companion-item {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    background: #f9f9f9;
}

.companion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e0e0e0;
}

.companion-header h5 {
    margin: 0;
    color: #2c5aa0;
    font-weight: 600;
}

.remove-companion-btn {
    background: #dc3545;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.3s;
}

.remove-companion-btn:hover {
    background: #c82333;
}

.add-companion-section {
    text-align: center;
    margin-top: 20px;
    padding: 20px;
    border: 2px dashed #ddd;
    border-radius: 8px;
}

.btn-outline-primary {
    background: transparent;
    color: #2c5aa0;
    border: 2px solid #2c5aa0;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-outline-primary:hover {
    background: #2c5aa0;
    color: white;
}

.btn-outline-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-outline-primary:disabled:hover {
    background: transparent;
    color: #2c5aa0;
}

.calculated-field {
    background-color: #f8f9fa !important;
    color: #666 !important;
    cursor: not-allowed !important;
}

.demographic-section {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    margin: 20px 0;
}

.grid-4 {
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
}

@media (max-width: 768px) {
    .form-actions {
        flex-direction: column;
    }

    .checkbox-group {
        grid-template-columns: 1fr;
    }

    .companion-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .grid-4 {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 992px) and (min-width: 769px) {
    .grid-4 {
        grid-template-columns: 1fr 1fr;
    }
}
</style>
