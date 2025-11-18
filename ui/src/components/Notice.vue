<template>
  <div class="notice-list">
    <!-- 공지사항 헤더 -->
    <div class="notice-header">
      <div class="notice-categories">
        <button 
          v-for="category in categories" 
          :key="category"
          :class="['category-btn', { active: selectedCategory === category }]"
          @click="selectCategory(category)"
        >
          {{ category }}
        </button>
      </div>
      <router-link to="/notice" class="more-link">더보기</router-link>
    </div>

    <!-- 공지사항 목록 -->
    <div class="notice-items">
      <div v-if="filteredNotices.length === 0" class="no-notices">
        공지사항이 없습니다.
      </div>
      <div v-else>
        <div
          v-for="notice in displayNotices"
          :key="notice.id"
          class="notice-item"
          :class="{ 'important-row': notice.important }"
          @click="$emit('notice-click', notice)"
        >
          <div class="notice-category">
            <span :class="['category-badge', getCategoryClass(notice.category)]">
              {{ notice.category }}
            </span>
          </div>
          <div class="notice-content">
            <h4 class="notice-title" :class="{ 'important-title': notice.important }">{{ notice.title }}</h4>
            <p class="notice-date">{{ formatDate(notice.date) }}</p>
          </div>
          <div class="notice-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 최신 공지사항 배지 -->
    <div v-if="hasNewNotices" class="new-notice-badge">
      <i class="fas fa-bell"></i>
      새 공지 {{ newNoticesCount }}개
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoticeList',
  props: {
    notices: {
      type: Array,
      default: () => []
    },
    maxDisplay: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      selectedCategory: '전체',
      categories: ['전체', '면제교육', '크루즈요트', '딩기요트', '채용', '기타']
    }
  },
  computed: {
    filteredNotices() {
      if (this.selectedCategory === '전체') {
        return this.notices
      }
      return this.notices.filter(notice => notice.category === this.selectedCategory)
    },
    displayNotices() {
      return this.filteredNotices
        .sort((a, b) => {
          // 중요 공지사항 우선 정렬
          if (a.important && !b.important) return -1;
          if (!a.important && b.important) return 1;
          // 같은 중요도면 날짜로 정렬
          return new Date(b.date) - new Date(a.date);
        })
        .slice(0, this.maxDisplay)
    },
    hasNewNotices() {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      
      return this.notices.some(notice => new Date(notice.date) > threeDaysAgo)
    },
    newNoticesCount() {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      
      return this.notices.filter(notice => new Date(notice.date) > threeDaysAgo).length
    }
  },
  methods: {
    selectCategory(category) {
      this.selectedCategory = category
    },
    formatDate(dateStr) {
      const date = new Date(dateStr)
      const today = new Date()
      const diffTime = Math.abs(today - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return '오늘'
      } else if (diffDays === 1) {
        return '어제'
      } else if (diffDays < 7) {
        return `${diffDays}일 전`
      } else {
        return `${date.getMonth() + 1}/${date.getDate()}`
      }
    },
    getCategoryClass(category) {
      const categoryMap = {
        '면제교육': 'exemption',
        '크루즈요트': 'cruise',
        '딩기요트': 'dinghy',
        '채용': 'recruitment',
        '기타': 'others'
      }
      return categoryMap[category] || 'default'
    },
    isNewNotice(dateStr) {
      const noticeDate = new Date(dateStr)
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      return noticeDate > threeDaysAgo
    }
  }
}
</script>

<style scoped>
.notice-list {
  position: relative;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.notice-categories {
  display: flex;
  gap: 10px;
}

.category-btn {
  background: transparent;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
  font-size: 14px;
}

.category-btn:hover {
  background: #f0f0f0;
}

.category-btn.active {
  background: #2c5aa0;
  color: white;
  border-color: #2c5aa0;
}

.more-link {
  color: #2c5aa0;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.more-link:hover {
  color: #1e3d6f;
}

.notice-items {
  min-height: 200px;
}

.no-notices {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-style: italic;
}

.notice-item {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.notice-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #2c5aa0;
}

.notice-item.important-row {
  background: linear-gradient(to right, #fff9e6, #ffffff);
  border-left: 4px solid #ffc107;
  font-weight: 500;
}

.notice-item.important-row:hover {
  background: linear-gradient(to right, #fff3cd, #f8f9fa);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);
}

.notice-category {
  margin-right: 15px;
}

.category-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  min-width: 50px;
}

.category-badge.exemption {
  background: #e8f5e8;
  color: #2e7d32;
}

.category-badge.cruise {
  background: #e3f2fd;
  color: #1976d2;
}

.category-badge.dinghy {
  background: #e0f7fa;
  color: #00796b;
}

.category-badge.recruitment {
  background: #f3e5f5;
  color: #7b1fa2;
}

.category-badge.others {
  background: #fff3e0;
  color: #ef6c00;
}

.category-badge.default {
  background: #f5f5f5;
  color: #666;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
  line-height: 1.4;
}

.notice-title.important-title {
  color: #d97706;
  font-weight: 600;
}

.notice-date {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.notice-arrow {
  color: #ccc;
  transition: all 0.3s;
}

.notice-item:hover .notice-arrow {
  color: #2c5aa0;
  transform: translateX(3px);
}

.new-notice-badge {
  position: absolute;
  top: -35px;
  right: 15px;
  background: #ff4444;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  animation: pulse 2s infinite;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(255, 68, 68, 0.3);
}

.new-notice-badge i {
  margin-right: 5px;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* 새 공지사항 표시 */
.notice-item.new-notice::before {
  content: 'NEW';
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4444;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .notice-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .notice-categories {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .notice-item {
    padding: 12px;
  }
  
  .notice-title {
    font-size: 14px;
  }
  
  .category-badge {
    min-width: 40px;
    font-size: 11px;
  }

  .new-notice-badge {
    top: -30px;
    right: 10px;
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>