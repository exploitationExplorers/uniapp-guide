
import App from './App'
import AppNavBar from './components/app-nav-bar.vue'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'  
Vue.config.productionTip = false
Vue.component('app-nav-bar', AppNavBar)
App.mpType = 'app'
const app = new Vue({
  ...App
})
     
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  app.component('app-nav-bar', AppNavBar)
  return {
    app
  }
}
// #endif