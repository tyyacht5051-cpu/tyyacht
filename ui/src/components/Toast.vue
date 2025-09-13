<template>
  <Teleport to="body">
    <div class="toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
        @click="removeToast(toast.id)"
      >
        <div class="toast-icon">
          <div v-if="toast.type === 'success'" class="icon-circle success-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div v-else-if="toast.type === 'error'" class="icon-circle error-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div v-else-if="toast.type === 'warning'" class="icon-circle warning-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9v4M12 17h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div v-else class="icon-circle info-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16v-4M12 8h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div class="toast-content">
          <div class="toast-title" v-if="toast.title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" @click="removeToast(toast.id)">×</button>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { reactive } from 'vue'

// 전역 토스트 상태
const toastState = reactive({
  toasts: []
})

let toastId = 0

export const useToast = () => {
  const addToast = (message, type = 'info', title = '', duration = 4000) => {
    const id = ++toastId
    const toast = { id, message, type, title, duration }
    
    toastState.toasts.push(toast)
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }
  
  const removeToast = (id) => {
    const index = toastState.toasts.findIndex(t => t.id === id)
    if (index > -1) {
      toastState.toasts.splice(index, 1)
    }
  }
  
  const success = (message, title = '성공', duration = 4000) => addToast(message, 'success', title, duration)
  const error = (message, title = '오류', duration = 5000) => addToast(message, 'error', title, duration)
  const warning = (message, title = '경고', duration = 4500) => addToast(message, 'warning', title, duration)
  const info = (message, title = '정보', duration = 4000) => addToast(message, 'info', title, duration)
  
  // 특별한 스타일의 알림들
  const celebrate = (message, title = '축하합니다! 🎉') => addToast(message, 'success', title, 6000)
  const urgent = (message, title = '긴급! ⚡') => addToast(message, 'error', title, 8000)
  const tip = (message, title = '💡 팁') => addToast(message, 'info', title, 5000)
  
  return {
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    celebrate,
    urgent,
    tip
  }
}

export default {
  name: 'Toast',
  setup() {
    const { removeToast } = useToast()
    
    return {
      toasts: toastState.toasts,
      removeToast
    }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 450px;
}

.toast {
  display: flex;
  align-items: flex-start;
  padding: 24px;
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  min-width: 380px;
  position: relative;
  overflow: hidden;
}

.toast::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: subtract;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: subtract;
}

.toast:hover {
  transform: translateX(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.toast-success {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 50%, #86efac 100%);
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);
}

.toast-error {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 50%, #fca5a5 100%);
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
}

.toast-warning {
  background: linear-gradient(135deg, #fffbeb 0%, #fed7aa 50%, #fdba74 100%);
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);
}

.toast-info {
  background: linear-gradient(135deg, #eff6ff 0%, #bfdbfe 50%, #93c5fd 100%);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
}

.toast-icon {
  margin-right: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}

.icon-circle {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: iconPulse 0.6s ease-out;
  position: relative;
}

.icon-circle svg {
  width: 24px;
  height: 24px;
  color: white;
}

.success-icon {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
}

.success-icon::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  opacity: 0.3;
  animation: ripple 1.5s infinite;
}

.error-icon {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
}

.error-icon::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  opacity: 0.3;
  animation: ripple 1.5s infinite;
}

.warning-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.warning-icon::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  opacity: 0.3;
  animation: ripple 1.5s infinite;
}

.info-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.info-icon::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  opacity: 0.3;
  animation: ripple 1.5s infinite;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 6px;
  color: #374151;
}

.toast-message {
  font-size: 16px;
  color: #4b5563;
  line-height: 1.5;
  word-wrap: break-word;
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  margin-left: 12px;
  flex-shrink: 0;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #374151;
}

@keyframes slideInBounce {
  0% {
    transform: translateX(120%) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: translateX(-10%) scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes iconPulse {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .toast-container {
    left: 20px;
    right: 20px;
    max-width: none;
  }
  
  .toast {
    min-width: auto;
  }
}
</style>