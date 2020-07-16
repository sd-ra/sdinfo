import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 13.07.20 ra
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';

Vue.config.productionTip = false

new Vue({
  router,
  render: function (h) { return h(App) }
}).$mount('#app')
