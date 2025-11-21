<template>
  <div v-if="currentPopup" class="popup-overlay" @click="handleOverlayClick">
    <div class="popup-modal" @click.stop>
      <!-- 닫기 버튼 -->
      <button class="close-btn" @click="closePopup" title="닫기">×</button>

      <!-- 팝업 내용 -->
      <div class="popup-content">
        <!-- 링크가 있으면 전체를 링크로 감싸기 -->
        <a
          v-if="currentPopup.link_url"
          :href="currentPopup.link_url"
          class="popup-link"
          @click="handleLinkClick"
        >
          <!-- 이미지 -->
          <div v-if="currentPopup.image_url" class="popup-image">
            <img :src="getImageUrl(currentPopup.image_url)" :alt="currentPopup.title">
          </div>

          <!-- 제목과 내용 -->
          <div class="popup-text">
            <h2 class="popup-title">{{ currentPopup.title }}</h2>
            <p v-if="currentPopup.content" class="popup-description">{{ currentPopup.content }}</p>
          </div>
        </a>

        <!-- 링크가 없으면 일반 컨텐츠 -->
        <template v-else>
          <!-- 이미지 -->
          <div v-if="currentPopup.image_url" class="popup-image">
            <img :src="getImageUrl(currentPopup.image_url)" :alt="currentPopup.title">
          </div>

          <!-- 제목과 내용 -->
          <div class="popup-text">
            <h2 class="popup-title">{{ currentPopup.title }}</h2>
            <p v-if="currentPopup.content" class="popup-description">{{ currentPopup.content }}</p>
          </div>
        </template>
      </div>

      <!-- 하단 버튼 -->
      <div class="popup-footer">
        <label class="dont-show-today">
          <input
            type="checkbox"
            v-model="dontShowToday"
            @change="handleDontShowTodayChange"
          >
          <span>오늘 하루 보지 않기</span>
        </label>

        <!-- 여러 팝업이 있을 때 네비게이션 -->
        <div v-if="popups.length > 1" class="popup-navigation">
          <button
            @click="previousPopup"
            :disabled="currentIndex === 0"
            class="nav-btn prev-btn"
          >
            ◀ 이전
          </button>
          <span class="popup-counter">{{ currentIndex + 1 }} / {{ popups.length }}</span>
          <button
            @click="nextPopup"
            :disabled="currentIndex === popups.length - 1"
            class="nav-btn next-btn"
          >
            다음 ▶
          </button>
        </div>

        <button @click="closePopup" class="close-btn-bottom">닫기</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default {
  name: 'PopupModal',
  props: {
    popups: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentIndex: 0,
      dontShowToday: false,
      closedPopupIds: [] // 오늘 하루 보지 않기로 설정한 팝업 ID들
    };
  },
  computed: {
    currentPopup() {
      if (this.popups.length === 0 || this.currentIndex >= this.popups.length) {
        return null;
      }
      return this.popups[this.currentIndex];
    }
  },
  watch: {
    currentPopup(newPopup) {
      if (newPopup) {
        // 현재 팝업이 "오늘 하루 보지 않기"로 설정되어 있는지 확인
        this.dontShowToday = this.isDontShowToday(newPopup.id);
      }
    }
  },
  mounted() {
    // 쿠키에서 오늘 하루 보지 않기로 설정된 팝업 ID들 로드
    this.loadClosedPopups();

    // ESC 키로 닫기
    window.addEventListener('keydown', this.handleEscapeKey);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleEscapeKey);
  },
  methods: {
    getImageUrl(url) {
      if (url.startsWith('http')) {
        return url;
      }
      return `${API_BASE_URL}${url}`;
    },

    closePopup() {
      if (this.dontShowToday && this.currentPopup) {
        this.setDontShowToday(this.currentPopup.id);
      }
      this.$emit('close');
    },

    handleOverlayClick() {
      // 오버레이 클릭 시 닫기 (선택사항)
      this.closePopup();
    },

    handleEscapeKey(e) {
      if (e.key === 'Escape') {
        this.closePopup();
      }
    },

    handleLinkClick() {
      // 링크 클릭 시에도 "오늘 하루 보지 않기" 저장
      if (this.dontShowToday && this.currentPopup) {
        this.setDontShowToday(this.currentPopup.id);
      }
    },

    handleDontShowTodayChange() {
      // 체크박스 상태 변경 시
      if (this.dontShowToday && this.currentPopup) {
        this.setDontShowToday(this.currentPopup.id);
      } else if (this.currentPopup) {
        this.removeDontShowToday(this.currentPopup.id);
      }
    },

    nextPopup() {
      if (this.currentIndex < this.popups.length - 1) {
        this.currentIndex++;
      }
    },

    previousPopup() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    },

    // 쿠키 관련 메서드
    setCookie(name, value, hours) {
      const date = new Date();
      date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
      const expires = "expires=" + date.toUTCString();
      document.cookie = name + "=" + value + ";" + expires + ";path=/";
    },

    getCookie(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },

    deleteCookie(name) {
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    },

    setDontShowToday(popupId) {
      const closedPopups = this.getClosedPopupsFromCookie();
      if (!closedPopups.includes(popupId)) {
        closedPopups.push(popupId);
        this.setCookie('closedPopups', JSON.stringify(closedPopups), 24);
        this.closedPopupIds = closedPopups;
      }
    },

    removeDontShowToday(popupId) {
      const closedPopups = this.getClosedPopupsFromCookie();
      const filtered = closedPopups.filter(id => id !== popupId);
      this.setCookie('closedPopups', JSON.stringify(filtered), 24);
      this.closedPopupIds = filtered;
    },

    isDontShowToday(popupId) {
      return this.closedPopupIds.includes(popupId);
    },

    getClosedPopupsFromCookie() {
      const cookie = this.getCookie('closedPopups');
      if (cookie) {
        try {
          return JSON.parse(cookie);
        } catch (e) {
          return [];
        }
      }
      return [];
    },

    loadClosedPopups() {
      this.closedPopupIds = this.getClosedPopupsFromCookie();
    }
  }
};
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.popup-modal {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: rotate(90deg);
}

.popup-content {
  flex: 1;
  overflow-y: auto;
}

.popup-link {
  text-decoration: none;
  color: inherit;
  display: block;
  cursor: pointer;
}

.popup-link:hover .popup-image img {
  transform: scale(1.02);
}

.popup-image {
  width: 100%;
  overflow: hidden;
  background: #f5f5f5;
}

.popup-image img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s;
}

.popup-text {
  padding: 30px;
}

.popup-title {
  font-size: 24px;
  font-weight: bold;
  color: #2c5aa0;
  margin: 0 0 15px 0;
}

.popup-description {
  font-size: 16px;
  line-height: 1.6;
  color: #555;
  white-space: pre-wrap;
  margin: 0;
}

.popup-footer {
  border-top: 1px solid #e0e0e0;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  flex-wrap: wrap;
  background: #f9f9f9;
}

.dont-show-today {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  user-select: none;
}

.dont-show-today input[type="checkbox"] {
  cursor: pointer;
}

.popup-navigation {
  display: flex;
  align-items: center;
  gap: 10px;
}

.popup-counter {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.nav-btn {
  background: #2c5aa0;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.nav-btn:hover:not(:disabled) {
  background: #1e3d6f;
}

.nav-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.close-btn-bottom {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.close-btn-bottom:hover {
  background: #5a6268;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .popup-modal {
    max-width: 95%;
    max-height: 95vh;
  }

  .popup-text {
    padding: 20px;
  }

  .popup-title {
    font-size: 20px;
  }

  .popup-description {
    font-size: 14px;
  }

  .popup-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .dont-show-today {
    order: 1;
  }

  .popup-navigation {
    order: 2;
    justify-content: center;
  }

  .close-btn-bottom {
    order: 3;
    width: 100%;
  }
}
</style>
