import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Font Awesome CSS
import '@fortawesome/fontawesome-free/css/all.min.css'

// 글로벌 스타일
import './assets/styles/global.css'

const app = createApp(App)

app.use(router)
app.mount('#app')