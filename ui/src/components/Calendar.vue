<template>
  <div class="calendar">
    <!-- 현재 월 표시 -->
    <div class="calendar-header">
      <button @click="previousMonth" class="nav-btn">&lt;</button>
      <h3 class="current-month">{{ currentMonthText }}</h3>
      <button @click="nextMonth" class="nav-btn">&gt;</button>
    </div>
    
    <!-- 요일 헤더 -->
    <div class="weekdays">
      <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
    </div>
    
    <!-- 날짜 그리드 -->
    <div class="calendar-grid">
      <div 
        v-for="date in calendarDates" 
        :key="date.id"
        :class="['date-cell', {
          'other-month': !date.isCurrentMonth,
          'today': date.isToday,
          'has-event': date.hasEvent,
          'fully-booked': date.events.some(event => event.isFullyBooked)
        }]"
        @click="selectDate(date)"
      >
        <span class="date-number">{{ date.day }}</span>
        <div v-if="date.events.length > 0" class="event-dots">
          <div 
            v-for="(event, index) in date.events.slice(0, 3)" 
            :key="index"
            :class="['event-dot', `event-${event.type}`]"
            :title="`${event.title}${event.applicantCount > 0 ? ` (신청자 ${event.applicantCount}명)` : ''}`"
          >
            <span v-if="event.applicantCount > 0" class="applicant-count">{{ event.applicantCount }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 이벤트 목록 -->
    <div class="event-list">
      <h4>이번 달 일정</h4>
      <div v-if="currentMonthEvents.length === 0" class="no-events">
        등록된 일정이 없습니다.
      </div>
      <div v-else>
        <div 
          v-for="event in currentMonthEvents" 
          :key="event.id"
          :class="['event-item', `event-${event.type}`]"
          @click="$emit('event-click', event)"
        >
          <div class="event-date">{{ formatEventDate(event.date) }}</div>
          <div class="event-title">
            {{ event.title }}
            <span v-if="event.applicantCount !== undefined" class="event-count">
              ({{ event.applicantCount }}{{ event.maxCapacity ? `/${event.maxCapacity}` : '' }}명)
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Calendar',
  props: {
    events: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentDate: new Date(),
      weekdays: ['일', '월', '화', '수', '목', '금', '토']
    }
  },
  computed: {
    currentMonthText() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth() + 1
      return `${year}년 ${month}월`
    },
    calendarDates() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      
      // 달력 시작일 (이전 달 마지막 주 포함)
      const firstDay = new Date(year, month, 1)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      // 달력 종료일 (다음 달 첫 주 포함)
      const lastDay = new Date(year, month + 1, 0)
      const endDate = new Date(lastDay)
      const remainingDays = 6 - lastDay.getDay()
      endDate.setDate(endDate.getDate() + remainingDays)
      
      const dates = []
      const current = new Date(startDate)
      
      while (current <= endDate) {
        const dateStr = this.formatDate(current)
        const dayEvents = this.events.filter(event => event.date === dateStr)
        
        dates.push({
          id: dateStr,
          day: current.getDate(),
          date: new Date(current),
          isCurrentMonth: current.getMonth() === month,
          isToday: this.isToday(current),
          hasEvent: dayEvents.length > 0,
          events: dayEvents
        })
        
        current.setDate(current.getDate() + 1)
      }
      
      return dates
    },
    currentMonthEvents() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      
      return this.events.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate.getFullYear() === year && eventDate.getMonth() === month
      }).sort((a, b) => new Date(a.date) - new Date(b.date))
    }
  },
  methods: {
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
    },
    selectDate(date) {
      if (date.events.length > 0) {
        this.$emit('event-click', date.events[0])
      }
    },
    formatDate(date) {
      return date.toISOString().split('T')[0]
    },
    formatEventDate(dateStr) {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}/${date.getDate()}`
    },
    isToday(date) {
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }
  }
}
</script>

<style scoped>
.calendar {
  width: 100%;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.nav-btn {
  background: #2c5aa0;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.nav-btn:hover {
  background: #1e3d6f;
}

.current-month {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c5aa0;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 10px;
}

.weekday {
  text-align: center;
  font-weight: bold;
  color: #666;
  padding: 10px 0;
  background: #f8f9fa;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #ddd;
  border: 1px solid #ddd;
  margin-bottom: 20px;
}

.date-cell {
  background: white;
  padding: 8px;
  min-height: 60px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.date-cell:hover {
  background: #f0f8ff;
}

.date-cell.other-month {
  background: #f8f9fa;
  color: #ccc;
}

.date-cell.today {
  background: #e3f2fd;
  font-weight: bold;
}

.date-cell.has-event {
  background: #fff3e0;
}

.date-cell.fully-booked {
  background: #ffebee;
  color: #d32f2f;
}

.date-number {
  display: block;
  text-align: center;
  margin-bottom: 5px;
}

.event-dots {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
}

.event-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.event-dot.event-education {
  background: #2c5aa0;
}

.event-dot.event-experience {
  background: #4caf50;
}

.event-dot.event-competition {
  background: #ff9800;
}

.applicant-count {
  color: white;
  font-size: 10px;
  font-weight: bold;
  line-height: 1;
}

.event-count {
  color: #666;
  font-size: 0.9rem;
  margin-left: 5px;
}

.event-list {
  margin-top: 20px;
}

.event-list h4 {
  color: #2c5aa0;
  margin-bottom: 15px;
}

.no-events {
  text-align: center;
  color: #999;
  padding: 20px;
  font-style: italic;
}

.event-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid;
}

.event-item:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.event-item.event-education {
  border-left-color: #2c5aa0;
  background: #f3f8ff;
}

.event-item.event-experience {
  border-left-color: #4caf50;
  background: #f8fff8;
}

.event-item.event-competition {
  border-left-color: #ff9800;
  background: #fff8f0;
}

.event-date {
  font-weight: bold;
  margin-right: 15px;
  min-width: 40px;
  color: #666;
}

.event-title {
  color: #333;
}

@media (max-width: 768px) {
  .date-cell {
    min-height: 40px;
    padding: 4px;
  }
  
  .event-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .event-date {
    margin-right: 0;
    margin-bottom: 5px;
  }
}
</style>