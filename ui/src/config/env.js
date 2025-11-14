// 환경별 설정
const config = {
  development: {
    API_BASE_URL: 'http://localhost:4001',
    API_TIMEOUT: 10000,
    DEBUG: true
  },
  test: {
    API_BASE_URL: 'http://test-tyyacht.com',
    API_TIMEOUT: 10000,
    DEBUG: true
  },
  production: {
    API_BASE_URL: 'https://tyyacht.com',
    API_TIMEOUT: 10000,
    DEBUG: false
  }
}

// 환경 판별 로직 수정
const getEnvironment = () => {
  if (typeof window === 'undefined') return 'development'
  
  const hostname = window.location.hostname
  
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost')) {
    return 'development'
  } else if (hostname === 'test-tyyacht.com') {
    return 'test'
  } else {
    return 'production'
  }
}

const ENV = getEnvironment()

export const {
  API_BASE_URL,
  API_TIMEOUT,
  DEBUG
} = config[ENV]

export default config[ENV]
