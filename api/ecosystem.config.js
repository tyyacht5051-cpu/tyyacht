module.exports = {
  apps: [
    {
      name: 'tyyacht-api',
      script: 'dist/index.js',
      instances: 1, // 개발서버에서는 단일 인스턴스 사용
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_test: {
        NODE_ENV: 'development',
        PORT: 3001,
        TZ: 'Asia/Seoul'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        TZ: 'Asia/Seoul'
      },
      // 로그 설정 (개발서버용 로컬 경로)
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 재시작 설정
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      
      // 모니터링
      monitoring: false,
      
      // 환경별 설정
      node_args: '--max-old-space-size=1024',
      
      // 헬스체크
      health_check_grace_period: 3000
    }
  ],

  // 배포 설정 (필요시 사용)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'your-git-repo',
      path: '/var/www/tyyacht-api',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};