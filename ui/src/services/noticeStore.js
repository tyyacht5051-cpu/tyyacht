import { reactive } from 'vue';

// 전역 공지사항 저장소
const noticeStore = reactive({
  notices: [],
  
  // 공지사항 전체 목록 가져오기
  getAllNotices() {
    return this.notices;
  },
  
  // 카테고리별 공지사항 가져오기
  getNoticesByCategory(category) {
    return this.notices.filter(notice => notice.category === category);
  },
  
  // 최신 공지사항 가져오기 (홈페이지용)
  getRecentNotices(limit = 5) {
    return this.notices
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit)
      .map(notice => ({
        ...notice,
        category: this.getCategoryDisplayName(notice.category)
      }));
  },
  
  // 새 공지사항 추가
  addNotice(notice, category = 'others') {
    const newNotice = {
      ...notice,
      category: category,
      source: this.getCategorySource(category)
    };
    
    this.notices.unshift(newNotice);
    this.sortNotices();
  },
  
  // 공지사항 업데이트
  updateNotice(id, updatedNotice) {
    const index = this.notices.findIndex(notice => notice.id === id);
    if (index !== -1) {
      this.notices[index] = { ...this.notices[index], ...updatedNotice };
      this.sortNotices();
    }
  },
  
  // 공지사항 삭제
  deleteNotice(id) {
    const index = this.notices.findIndex(notice => notice.id === id);
    if (index !== -1) {
      this.notices.splice(index, 1);
    }
  },
  
  // 카테고리별 초기 데이터 로드
  loadCategoryNotices(category, notices) {
    // 기존 해당 카테고리 공지사항 제거
    this.notices = this.notices.filter(notice => notice.category !== category);
    
    // 새 공지사항 추가 (카테고리 정보 포함)
    const categoryNotices = notices.map(notice => ({
      ...notice,
      category: category,
      source: this.getCategorySource(category)
    }));
    
    this.notices.push(...categoryNotices);
    this.sortNotices();
  },
  
  // 공지사항 정렬 (날짜 기준 내림차순)
  sortNotices() {
    this.notices.sort((a, b) => new Date(b.date) - new Date(a.date));
  },
  
  // 카테고리 소스 매핑
  getCategorySource(category) {
    const sourceMap = {
      'exemption': '/notice/exemption',
      'cruise': '/notice/cruise',
      'dinghy': '/notice/dinghy', 
      'recruitment': '/notice/recruitment',
      'others': '/notice/others'
    };
    return sourceMap[category] || '/notice';
  },
  
  // 카테고리 표시명 매핑
  getCategoryDisplayName(category) {
    const displayMap = {
      'exemption': '면제교육',
      'cruise': '크루저요트',
      'dinghy': '딩기요트',
      'recruitment': '채용',
      'others': '기타'
    };
    return displayMap[category] || '일반';
  },
  
  // 새 공지사항 체크 (3일 이내)
  isNewNotice(date) {
    const noticeDate = new Date(date);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return noticeDate > threeDaysAgo;
  },
  
  // 초기화 (개발용)
  reset() {
    this.notices = [];
  }
});

export default noticeStore;