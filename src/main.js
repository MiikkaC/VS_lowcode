import { createApp } from 'vue'
import App from './App.vue'
import 'element-plus/theme-chalk/index.css' ;
import ElementPlus from 'element-plus'


createApp(App).mount('#app')
createApp(App).use(ElementPlus)

