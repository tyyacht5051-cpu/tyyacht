<template>
  <div v-if="popups.length > 0" class="popup-overlay">
    <div class="popup-container">
      <!-- 각 팝업을 개별적으로 표시 -->
      <div
        v-for="popup in popups"
        :key="popup.id"
        class="popup-modal"
        @click.stop
      >
        <!-- 닫기 버튼 -->
        <button class="close-btn" @click="closePopup(popup.id)" title="닫기">×</button>

        <!-- 팝업 내용 -->
        <div class="popup-content">
          <!-- 링크가 있으면 전체를 링크로 감싸기 -->
          <a
            v-if="popup.link_url"
            :href="popup.link_url"
            class="popup-link"
            @click="handleLinkClick(popup.id)"
          >
            <!-- 이미지 -->
            <div v-if="popup.image_url" class="popup-image">
              <img :src="getImageUrl(popup.image_url)" :alt="popup.title">
            </div>

            <!-- 내용 -->
            <div v-if="popup.content" class="popup-text">
              <p class="popup-description">{{ popup.content }}</p>
            </div>
          </a>

          <!-- 링크가 없으면 일반 컨텐츠 -->
          <template v-else>
            <!-- 이미지 -->
            <div v-if="popup.image_url" class="popup-image">
              <img :src="getImageUrl(popup.image_url)" :alt="popup.title">
            </div>

            <!-- 내용 -->
            <div v-if="popup.content" class="popup-text">
              <p class="popup-description">{{ popup.content }}</p>
            </div>
          </template>
        </div>

        <!-- 하단 버튼 -->
        <div class="popup-footer">
          <label class="dont-show-today">
            <input
              type="checkbox"
              :checked="dontShowToday[popup.id]"
              @change="handleDontShowTodayChange(popup.id, $event)"
            >
            <span>오늘 하루 보지 않기</span>
          </label>

          <button @click="closePopup(popup.id)" class="close-btn-bottom">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { API_BASE_URL } from '../config/env.js';

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
      dontShowToday: {}, // 각 팝업별 "오늘 하루 보지 않기" 상태
      closedPopupIds: [] // 오늘 하루 보지 않기로 설정한 팝업 ID들
    };
  },
  mounted() {
    // 쿠키에서 오늘 하루 보지 않기로 설정된 팝업 ID들 로드
    this.loadClosedPopups();

    // 각 팝업의 초기 체크박스 상태 설정
    this.popups.forEach(popup => {
      this.$set(this.dontShowToday, popup.id, this.isDontShowToday(popup.id));
    });

    // ESC 키로 모든 팝업 닫기
    window.addEventListener('keydown', this.handleEscapeKey);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleEscapeKey);
  },
  methods: {
    getImageUrl(url) {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return `${API_BASE_URL}${url}`;
    },

    closePopup(popupId) {
      if (this.dontShowToday[popupId]) {
        this.setDontShowToday(popupId);
      }
      this.$emit('close', popupId);
    },

    handleEscapeKey(e) {
      if (e.key === 'Escape') {
        // 모든 팝업 닫기
        this.$emit('close-all');
      }
    },

    handleLinkClick(popupId) {
      // 링크 클릭 시에도 "오늘 하루 보지 않기" 저장
      if (this.dontShowToday[popupId]) {
        this.setDontShowToday(popupId);
      }
    },

    handleDontShowTodayChange(popupId, event) {
      // 체크박스 상태 변경 시
      const checked = event.target.checked;
      this.$set(this.dontShowToday, popupId, checked);

      if (checked) {
        this.setDontShowToday(popupId);
      } else {
        this.removeDontShowToday(popupId);
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
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  z-index: 10000;
  padding: 20px;
  pointer-events: none;
  overflow-x: auto;
  overflow-y: hidden;
}

.popup-container {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 0 20px;
  pointer-events: none;
}

.popup-modal {
  background: white;
  border-radius: 8px;
  width: 400px;
  max-width: 400px;
  min-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  pointer-events: auto;
  flex-shrink: 0;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
  border-color: #999;
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  /* 스크롤바 숨기기 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE, Edge */
}

.popup-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
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
  background: #fff;
}

.popup-image img {
  width: 100%;
  height: auto;
  display: block;
}

.popup-text {
  padding: 25px;
}

.popup-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.popup-description {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  white-space: pre-wrap;
  margin: 0;
}

.popup-footer {
  border-top: 1px solid #e0e0e0;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  flex-wrap: wrap;
  background: #fafafa;
}

.dont-show-today {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  user-select: none;
}

.dont-show-today input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.close-btn-bottom {
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.2s;
}

.close-btn-bottom:hover {
  background: #f5f5f5;
  border-color: #999;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .popup-overlay {
    padding: 10px;
  }

  .popup-container {
    padding: 0 10px;
  }

  .popup-modal {
    width: 320px;
    max-width: 320px;
    min-width: 320px;
    max-height: 85vh;
  }

  .popup-text {
    padding: 20px;
  }

  .popup-description {
    font-size: 13px;
  }

  .popup-footer {
    padding: 12px 15px;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .dont-show-today {
    order: 1;
    font-size: 12px;
  }

  .close-btn-bottom {
    order: 2;
    width: 100%;
  }
}
</style>
