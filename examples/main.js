import { Vue, isCn, language } from './config';
import App from './App';
import router from './router';
import './plugins';
import './components';
import store from './store';

// 全局样式
import './assets/css/main.scss';

Vue.config.productionTip = false;

Vue.prototype.$isCn = isCn;
Vue.prototype.$language = language;

const init = async () => {
  new Vue({
    router,
    store,
    render: (h) => h(App),
    mounted() {
      // document.body.removeChild(document.body.querySelector('.init-box'));
    },
  }).$mount('#app');
};
init();
