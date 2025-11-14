<template>
  <div class="excel-manager">
    <div class="excel-header">
      <h3>📊 엑셀 파일 관리</h3>
      <div class="export-options">
        <select v-model="selectedCategory" @change="loadCategoryData">
          <option value="">카테고리 선택</option>
          <option value="cruise">승선체험 신청서</option>
          <option value="exemption">면제교육 신청서</option>
          <option value="education">요트교육 신청서</option>
        </select>
        <button
          @click="exportData"
          :disabled="!selectedCategory || loading"
          class="export-btn"
        >
          {{ loading ? '생성 중...' : '📥 엑셀 다운로드' }}
        </button>
      </div>
    </div>

    <div v-if="selectedCategory" class="data-preview">
      <div class="category-info">
        <h4>{{ getCategoryTitle(selectedCategory) }}</h4>
        <p>총 {{ totalRecords }}건의 데이터</p>
      </div>

      <!-- 필터링 옵션 -->
      <div class="filters">
        <div class="filter-group">
          <label>기간 필터:</label>
          <input
            type="date"
            v-model="filters.startDate"
            @change="applyFilters"
          >
          <span>~</span>
          <input
            type="date"
            v-model="filters.endDate"
            @change="applyFilters"
          >
        </div>

        <div class="filter-group" v-if="selectedCategory !== 'exemption'">
          <label>상태 필터:</label>
          <select v-model="filters.status" @change="applyFilters">
            <option value="">전체</option>
            <option value="pending">대기중</option>
            <option value="approved">승인</option>
            <option value="rejected">거부</option>
          </select>
        </div>
      </div>

      <!-- 데이터 미리보기 테이블 -->
      <div class="data-table">
        <div class="table-controls">
          <button @click="selectAll" class="select-btn">전체 선택</button>
          <button @click="deselectAll" class="select-btn">선택 해제</button>
          <button @click="toggleEditMode" :class="['edit-btn', { active: editMode }]">
            {{ editMode ? '편집 완료' : '편집 모드' }}
          </button>
          <button v-if="editMode && hasChanges" @click="saveChanges" class="save-btn">
            변경사항 저장
          </button>
          <button v-if="editMode && hasChanges" @click="cancelChanges" class="cancel-btn">
            취소
          </button>
          <span class="selected-count">{{ selectedRecords.length }}개 선택됨</span>
          <span v-if="editMode && hasChanges" class="changes-count">{{ Object.keys(editedData).length }}개 수정됨</span>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" @change="toggleAll" ref="selectAllCheckbox"></th>
                <th v-for="column in tableColumns" :key="column.key">{{ column.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in paginatedData" :key="record.id">
                <td>
                  <input
                    type="checkbox"
                    :value="record.id"
                    v-model="selectedRecords"
                    @change="updateSelectAll"
                  >
                </td>
                <td v-for="column in tableColumns" :key="column.key" :class="{ 'editable-cell': editMode && isEditableColumn(column.key) }">
                  <div v-if="editMode && isEditableColumn(column.key)" class="edit-cell">
                    <input
                      v-if="getColumnType(column.key) === 'text'"
                      type="text"
                      :value="getEditValue(record.id, column.key)"
                      @input="updateEditValue(record.id, column.key, $event.target.value)"
                      @blur="validateInput(record.id, column.key, $event.target.value)"
                      class="cell-input"
                    >
                    <input
                      v-else-if="getColumnType(column.key) === 'date'"
                      type="date"
                      :value="getEditValue(record.id, column.key)"
                      @input="updateEditValue(record.id, column.key, $event.target.value)"
                      class="cell-input"
                    >
                    <select
                      v-else-if="getColumnType(column.key) === 'select'"
                      :value="getEditValue(record.id, column.key)"
                      @change="updateEditValue(record.id, column.key, $event.target.value)"
                      class="cell-select"
                    >
                      <option v-for="option in getSelectOptions(column.key)" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                    <input
                      v-else-if="getColumnType(column.key) === 'number'"
                      type="number"
                      :value="getEditValue(record.id, column.key)"
                      @input="updateEditValue(record.id, column.key, $event.target.value)"
                      class="cell-input"
                    >
                    <input
                      v-else
                      type="text"
                      :value="getEditValue(record.id, column.key)"
                      @input="updateEditValue(record.id, column.key, $event.target.value)"
                      class="cell-input"
                    >
                  </div>
                  <span v-else :class="{ 'changed-cell': hasChanged(record.id, column.key) }">
                    {{ getColumnValue(record, column.key) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 페이지네이션 -->
        <div class="pagination">
          <button
            @click="currentPage--"
            :disabled="currentPage <= 1"
          >이전</button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
          >다음</button>
        </div>
      </div>
    </div>

    <!-- 엑셀 히스토리 -->
    <div class="excel-history" v-if="exportHistory.length > 0">
      <h4>📋 엑셀 다운로드 히스토리</h4>
      <div class="history-list">
        <div
          v-for="history in exportHistory"
          :key="history.id"
          class="history-item"
        >
          <div class="history-info">
            <span class="category">{{ getCategoryTitle(history.category) }}</span>
            <span class="date">{{ formatDate(history.createdAt) }}</span>
            <span class="count">{{ history.recordCount }}건</span>
          </div>
          <div class="history-actions">
            <button @click="redownload(history)" class="redownload-btn">재다운로드</button>
            <button @click="deleteHistory(history.id)" class="delete-btn">삭제</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4001'

export default {
  name: 'ExcelManager',
  props: {
    authToken: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      selectedCategory: '',
      loading: false,
      data: [],
      filteredData: [],
      selectedRecords: [],
      totalRecords: 0,
      currentPage: 1,
      pageSize: 10,
      filters: {
        startDate: '',
        endDate: '',
        status: ''
      },
      exportHistory: [],
      tableColumns: [],
      editMode: false,
      editedData: {}, // { recordId: { columnKey: newValue } }
      originalData: {}
    }
  },
  computed: {
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredData.slice(start, start + this.pageSize)
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.pageSize)
    },
    hasChanges() {
      return Object.keys(this.editedData).length > 0
    }
  },
  methods: {
    getCategoryTitle(category) {
      const titles = {
        cruise: '승선체험 신청서',
        exemption: '면제교육 신청서',
        education: '요트교육 신청서'
      }
      return titles[category] || category
    },

    async loadCategoryData() {
      if (!this.selectedCategory) return

      console.log('Loading category data:', this.selectedCategory)
      console.log('Auth token:', this.authToken ? 'Present' : 'Missing')

      this.loading = true
      try {
        const url = `${API_BASE_URL}/api/applications/${this.selectedCategory}/export`
        console.log('API URL:', url)

        const response = await axios.get(url, {
          headers: { 'Authorization': `Bearer ${this.authToken}` }
        })

        this.data = response.data
        this.applyFilters()
        this.setupTableColumns()
      } catch (error) {
        console.error('Failed to load data:', error)
        let errorMessage = '데이터 로드에 실패했습니다.'

        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = '인증이 필요합니다. 다시 로그인해주세요.'
          } else if (error.response.status === 403) {
            errorMessage = '관리자 권한이 필요합니다.'
          } else if (error.response.data?.error) {
            errorMessage = error.response.data.error
          }
        } else if (error.request) {
          errorMessage = '서버에 연결할 수 없습니다.'
        }

        this.$emit('error', errorMessage)
      } finally {
        this.loading = false
      }
    },

    setupTableColumns() {
      const columnMaps = {
        cruise: [
          { key: 'experienceType', label: '구분' },
          { key: 'desiredDate', label: '신청날짜' },
          { key: 'name', label: '대표자 명' },
          { key: 'phone', label: '연락처' },
          { key: 'address_do', label: '도' },
          { key: 'address_sigungu', label: '시/군' },
          { key: 'adult_male', label: '성인(남)' },
          { key: 'adult_female', label: '성인(여)' },
          { key: 'adult_total', label: '성인(계)' },
          { key: 'youth_male', label: '청소년(남)' },
          { key: 'youth_female', label: '청소년(여)' },
          { key: 'youth_total', label: '청소년(계)' },
          { key: 'total_participants', label: '총계' },
          { key: 'teens_male', label: '10대(남)' },
          { key: 'teens_female', label: '10대(여)' },
          { key: 'twenties_male', label: '20대(남)' },
          { key: 'twenties_female', label: '20대(여)' },
          { key: 'thirties_male', label: '30대(남)' },
          { key: 'thirties_female', label: '30대(여)' },
          { key: 'forties_male', label: '40대(남)' },
          { key: 'forties_female', label: '40대(여)' },
          { key: 'fifties_plus_male', label: '50대~(남)' },
          { key: 'fifties_plus_female', label: '50대~(여)' }
        ],
        exemption: [
          { key: 'name', label: '이름' },
          { key: 'phone', label: '연락처' },
          { key: 'email', label: '이메일' },
          { key: 'selected_date', label: '선택날짜' },
          { key: 'license', label: '면허종류' },
          { key: 'created_at', label: '신청일' }
        ],
        education: [
          { key: 'name', label: '이름' },
          { key: 'phone', label: '연락처' },
          { key: 'email', label: '이메일' },
          { key: 'course_type', label: '과정유형' },
          { key: 'start_date', label: '시작일' },
          { key: 'status', label: '상태' }
        ]
      }
      this.tableColumns = columnMaps[this.selectedCategory] || []
    },

    getColumnValue(record, key) {
      const value = record[key]
      if (key.includes('date') || key.includes('_at')) {
        return this.formatDate(value)
      }
      if (key === 'participants') {
        return value + '명'
      }
      return value || '-'
    },

    applyFilters() {
      this.filteredData = this.data.filter(record => {
        // 날짜 필터
        if (this.filters.startDate && record.created_at < this.filters.startDate) return false
        if (this.filters.endDate && record.created_at > this.filters.endDate) return false

        // 상태 필터
        if (this.filters.status && record.status !== this.filters.status) return false

        return true
      })

      this.totalRecords = this.filteredData.length
      this.currentPage = 1
    },

    selectAll() {
      this.selectedRecords = this.filteredData.map(record => record.id)
      this.updateSelectAll()
    },

    deselectAll() {
      this.selectedRecords = []
      this.updateSelectAll()
    },

    toggleAll(event) {
      if (event.target.checked) {
        this.selectAll()
      } else {
        this.deselectAll()
      }
    },

    updateSelectAll() {
      if (this.$refs.selectAllCheckbox) {
        const totalVisible = this.filteredData.length
        const selectedVisible = this.selectedRecords.length
        this.$refs.selectAllCheckbox.indeterminate = selectedVisible > 0 && selectedVisible < totalVisible
        this.$refs.selectAllCheckbox.checked = selectedVisible === totalVisible && totalVisible > 0
      }
    },

    async exportData() {
      if (!this.selectedCategory) return

      this.loading = true
      try {
        // 선택된 데이터만 내보내기 (선택된 것이 없으면 필터링된 전체)
        const dataToExport = this.selectedRecords.length > 0
          ? this.data.filter(record => this.selectedRecords.includes(record.id))
          : this.filteredData

        const csvContent = this.generateCSV(dataToExport)
        const BOM = '\uFEFF'
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${this.getCategoryTitle(this.selectedCategory)}_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)

        // 히스토리에 저장
        await this.saveExportHistory(dataToExport.length)
        await this.loadExportHistory()

        this.$emit('success', `${dataToExport.length}건의 데이터가 다운로드되었습니다.`)
      } catch (error) {
        console.error('Export failed:', error)
        this.$emit('error', '엑셀 다운로드에 실패했습니다.')
      } finally {
        this.loading = false
      }
    },

    generateCSV(data) {
      if (data.length === 0) return ''

      const headers = this.tableColumns.map(col => col.label)
      const rows = data.map(record =>
        this.tableColumns.map(col => {
          const value = this.getColumnValue(record, col.key)
          return `"${String(value).replace(/"/g, '""')}"`
        })
      )

      return [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')
    },

    async saveExportHistory(recordCount) {
      try {
        await axios.post(`${API_BASE_URL}/api/excel/history`, {
          category: this.selectedCategory,
          recordCount,
          filters: this.filters
        }, {
          headers: { 'Authorization': `Bearer ${this.authToken}` }
        })
      } catch (error) {
        console.warn('Failed to save export history:', error)
      }
    },

    async loadExportHistory() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/excel/history`, {
          headers: { 'Authorization': `Bearer ${this.authToken}` }
        })
        this.exportHistory = response.data
      } catch (error) {
        console.warn('Failed to load export history:', error)
      }
    },

    async deleteHistory(historyId) {
      try {
        await axios.delete(`${API_BASE_URL}/api/excel/history/${historyId}`, {
          headers: { 'Authorization': `Bearer ${this.authToken}` }
        })
        await this.loadExportHistory()
        this.$emit('success', '히스토리가 삭제되었습니다.')
      } catch (error) {
        this.$emit('error', '히스토리 삭제에 실패했습니다.')
      }
    },

    async redownload(history) {
      this.selectedCategory = history.category
      this.filters = history.filters || {}
      await this.loadCategoryData()
      await this.exportData()
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleDateString('ko-KR')
    },

    // 편집 기능 관련 메소드들
    toggleEditMode() {
      if (this.editMode && this.hasChanges) {
        if (!confirm('편집 중인 내용이 있습니다. 저장하지 않고 나가시겠습니까?')) {
          return
        }
      }

      this.editMode = !this.editMode

      if (this.editMode) {
        // 편집 모드 진입 시 원본 데이터 백업
        this.backupOriginalData()
      } else {
        // 편집 모드 종료 시 변경사항 초기화
        this.editedData = {}
        this.originalData = {}
      }
    },

    backupOriginalData() {
      this.originalData = {}
      this.data.forEach(record => {
        this.originalData[record.id] = { ...record }
      })
    },

    isEditableColumn(columnKey) {
      // ID, 날짜, 자동계산 필드는 편집 불가
      const nonEditableColumns = [
        'id', 'created_at', 'updated_at', 'adult_total', 'youth_total', 'total_participants',
        'infant_male', 'infant_female', 'teens_male', 'teens_female',
        'twenties_male', 'twenties_female', 'thirties_male', 'thirties_female',
        'forties_male', 'forties_female', 'fifties_plus_male', 'fifties_plus_female'
      ]
      return !nonEditableColumns.includes(columnKey)
    },

    getColumnType(columnKey) {
      const typeMap = {
        'name': 'text',
        'phone': 'text',
        'email': 'text',
        'message': 'text',
        'address': 'text',
        'address_do': 'select',
        'address_sigungu': 'text',
        'desiredDate': 'date',
        'selected_date': 'date',
        'start_date': 'date',
        'participants': 'number',
        'adult_male': 'number',
        'adult_female': 'number',
        'adult_total': 'number',
        'youth_male': 'number',
        'youth_female': 'number',
        'youth_total': 'number',
        'total_participants': 'number',
        'status': 'select',
        'experienceType': 'select',
        'course_type': 'select',
        'license': 'select',
        'gender': 'select'
      }
      return typeMap[columnKey] || 'text'
    },

    getSelectOptions(columnKey) {
      const optionsMap = {
        'status': [
          { value: 'pending', label: '대기중' },
          { value: 'approved', label: '승인' },
          { value: 'confirmed', label: '확정' },
          { value: 'rejected', label: '거부' },
          { value: 'cancelled', label: '취소' }
        ],
        'experienceType': [
          { value: 'cruise', label: '크루즈 체험' },
          { value: 'dinghy', label: '딩기 체험' },
          { value: 'paddleboard', label: '패들보드 체험' }
        ],
        'address_do': [
          { value: '서울특별시', label: '서울특별시' },
          { value: '부산광역시', label: '부산광역시' },
          { value: '대구광역시', label: '대구광역시' },
          { value: '인천광역시', label: '인천광역시' },
          { value: '광주광역시', label: '광주광역시' },
          { value: '대전광역시', label: '대전광역시' },
          { value: '울산광역시', label: '울산광역시' },
          { value: '세종특별자치시', label: '세종특별자치시' },
          { value: '경기도', label: '경기도' },
          { value: '강원도', label: '강원도' },
          { value: '충청북도', label: '충청북도' },
          { value: '충청남도', label: '충청남도' },
          { value: '전라북도', label: '전라북도' },
          { value: '전라남도', label: '전라남도' },
          { value: '경상북도', label: '경상북도' },
          { value: '경상남도', label: '경상남도' },
          { value: '제주특별자치도', label: '제주특별자치도' }
        ],
        'course_type': [
          { value: 'basic', label: '기초 과정' },
          { value: 'intermediate', label: '중급 과정' },
          { value: 'advanced', label: '고급 과정' }
        ],
        'license': [
          { value: '1급', label: '1급' },
          { value: '2급', label: '2급' },
          { value: '3급', label: '3급' }
        ],
        'gender': [
          { value: 'M', label: '남성' },
          { value: 'F', label: '여성' }
        ]
      }
      return optionsMap[columnKey] || []
    },

    getEditValue(recordId, columnKey) {
      if (this.editedData[recordId] && this.editedData[recordId][columnKey] !== undefined) {
        return this.editedData[recordId][columnKey]
      }

      const record = this.data.find(r => r.id === recordId)
      if (!record) return ''

      let value = record[columnKey]

      // 날짜 필드인 경우 ISO 형식으로 변환
      if (this.getColumnType(columnKey) === 'date' && value) {
        return new Date(value).toISOString().split('T')[0]
      }

      return value || ''
    },

    updateEditValue(recordId, columnKey, newValue) {
      if (!this.editedData[recordId]) {
        this.$set(this.editedData, recordId, {})
      }

      this.$set(this.editedData[recordId], columnKey, newValue)

      // 인구통계 자동 계산 로직
      if (this.selectedCategory === 'cruise') {
        this.calculateDemographicTotals(recordId, columnKey)
      }
    },

    calculateDemographicTotals(recordId, changedColumn) {
      if (!this.editedData[recordId]) return

      const editedRecord = { ...this.editedData[recordId] }
      const originalRecord = this.data.find(r => r.id === recordId) || {}

      // 현재 레코드의 값들 가져오기 (편집된 값 우선)
      const getValue = (key) => {
        return editedRecord[key] !== undefined ? parseInt(editedRecord[key] || 0) : parseInt(originalRecord[key] || 0)
      }

      // 성인 계산
      if (['adult_male', 'adult_female'].includes(changedColumn)) {
        const adultMale = getValue('adult_male')
        const adultFemale = getValue('adult_female')
        const adultTotal = adultMale + adultFemale
        this.$set(this.editedData[recordId], 'adult_total', adultTotal)
      }

      // 청소년 계산
      if (['youth_male', 'youth_female'].includes(changedColumn)) {
        const youthMale = getValue('youth_male')
        const youthFemale = getValue('youth_female')
        const youthTotal = youthMale + youthFemale
        this.$set(this.editedData[recordId], 'youth_total', youthTotal)
      }

      // 전체 총계 계산
      if (['adult_male', 'adult_female', 'youth_male', 'youth_female'].includes(changedColumn)) {
        const adultTotal = getValue('adult_total')
        const youthTotal = getValue('youth_total')
        const totalParticipants = adultTotal + youthTotal
        this.$set(this.editedData[recordId], 'total_participants', totalParticipants)
      }
    },

    validateInput(recordId, columnKey, value) {
      if (columnKey === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          this.$emit('error', '올바른 이메일 형식이 아닙니다.')
          return false
        }
      }

      if (columnKey === 'phone' && value) {
        const phoneRegex = /^[\d-]{10,13}$/
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          this.$emit('error', '올바른 전화번호 형식이 아닙니다.')
          return false
        }
      }

      return true
    },

    hasChanged(recordId, columnKey) {
      return this.editedData[recordId] && this.editedData[recordId][columnKey] !== undefined
    },

    async saveChanges() {
      if (!this.hasChanges) return

      try {
        this.loading = true

        // 변경된 레코드들을 API로 전송
        for (const recordId of Object.keys(this.editedData)) {
          const changes = this.editedData[recordId]

          await axios.patch(`${API_BASE_URL}/api/applications/${this.selectedCategory}/${recordId}`,
            changes,
            {
              headers: { 'Authorization': `Bearer ${this.authToken}` }
            }
          )
        }

        // 로컬 데이터 업데이트
        for (const recordId of Object.keys(this.editedData)) {
          const record = this.data.find(r => r.id == recordId)
          if (record) {
            Object.assign(record, this.editedData[recordId])
          }
        }

        // 편집 상태 초기화
        this.editedData = {}
        this.originalData = {}

        this.$emit('success', '변경사항이 저장되었습니다.')
      } catch (error) {
        console.error('Failed to save changes:', error)
        this.$emit('error', '변경사항 저장에 실패했습니다.')
      } finally {
        this.loading = false
      }
    },

    cancelChanges() {
      if (!confirm('편집 중인 모든 변경사항이 취소됩니다. 계속하시겠습니까?')) {
        return
      }

      this.editedData = {}
      this.originalData = {}
      this.$emit('success', '편집이 취소되었습니다.')
    }
  },

  async mounted() {
    await this.loadExportHistory()
  }
}
</script>

<style scoped>
.excel-manager {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.excel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
}

.excel-header h3 {
  margin: 0;
  color: #1f2937;
}

.export-options {
  display: flex;
  gap: 12px;
  align-items: center;
}

.export-options select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
}

.export-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.export-btn:hover:not(:disabled) {
  background: #2563eb;
}

.export-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.data-preview {
  margin-bottom: 32px;
}

.category-info {
  margin-bottom: 16px;
}

.category-info h4 {
  margin: 0 0 4px 0;
  color: #1f2937;
}

.category-info p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.filters {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
}

.filter-group input,
.filter-group select {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.table-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.select-btn {
  padding: 6px 12px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.select-btn:hover {
  background: #e5e7eb;
}

.selected-count {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.table-wrapper {
  max-height: 400px;
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  position: sticky;
  top: 0;
}

tbody tr:hover {
  background: #f9fafb;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:hover:not(:disabled) {
  background: #f3f4f6;
}

.pagination button:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.excel-history {
  border-top: 1px solid #e5e7eb;
  padding-top: 24px;
}

.excel-history h4 {
  margin: 0 0 16px 0;
  color: #1f2937;
}

.history-list {
  space-y: 8px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 8px;
}

.history-info {
  display: flex;
  gap: 16px;
}

.history-info .category {
  font-weight: 600;
  color: #1f2937;
}

.history-info .date,
.history-info .count {
  color: #6b7280;
  font-size: 14px;
}

.history-actions {
  display: flex;
  gap: 8px;
}

.redownload-btn {
  padding: 4px 8px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.redownload-btn:hover {
  background: #2563eb;
}

.delete-btn {
  padding: 4px 8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn:hover {
  background: #dc2626;
}

/* 편집 기능 스타일 */
.edit-btn {
  padding: 6px 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.edit-btn:hover {
  background: #059669;
}

.edit-btn.active {
  background: #f59e0b;
}

.edit-btn.active:hover {
  background: #d97706;
}

.save-btn {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn:hover {
  background: #2563eb;
}

.cancel-btn {
  padding: 6px 12px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn:hover {
  background: #4b5563;
}

.changes-count {
  color: #f59e0b;
  font-size: 14px;
  font-weight: 500;
  margin-left: 16px;
}

.editable-cell {
  background: #fef3c7;
  position: relative;
}

.editable-cell:hover {
  background: #fde68a;
}

.edit-cell {
  width: 100%;
}

.cell-input,
.cell-select {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.cell-input:focus,
.cell-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.changed-cell {
  background: #dbeafe;
  font-weight: 600;
  color: #1e40af;
}

.changed-cell::after {
  content: " *";
  color: #f59e0b;
  font-weight: bold;
}

tbody tr:hover .editable-cell {
  background: #fcd34d;
}

tbody tr:hover .changed-cell {
  background: #bfdbfe;
}
</style>