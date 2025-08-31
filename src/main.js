import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhTw from 'element-plus/dist/locale/zh-tw.mjs'
import App from './App.vue'
import router from './router'
import './styles/global.css'

const app = createApp(App)
const pinia = createPinia()

// 註冊所有 Element Plus 圖標
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus, {
    locale: zhTw
})

app.mount('#app')