import { getStorage } from 'examples/utils/storage';
import vue from 'vue';
import vuex from 'vuex';

export const Vue = vue;
export const Vuex = vuex;

// 注册异步组件
export const registerAsyncComponent = ({ name, component }) => {
  Vue.component(name, component);
};

// 注册第三方插件
export const registerPlugin = ({ name, instance, type }) => {
  if (type === 'use') {
    Vue.use(instance);
  } else {
    Vue.prototype[`$${name}`] = instance;
  }
};

export const language = getStorage('language') || 'zh-CN';

export const isCn = language.startsWith('zh');
