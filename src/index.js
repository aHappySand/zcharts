
import ZCheckbox from '../packages/checkbox';
import ZMap from '../packages/map';

import { version } from '../package.json';

const components = [
  ZCheckbox,
  ZMap,
];

const install = (Vue) => {
  // 判断是否安装
  if (install.installed) return;
  install.installed = true;
  // 遍历注册全局组件
  components.map(component => Vue.component(component.name, component));
};

// 判断是否是直接引入文件
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export {
  ZCheckbox,
  ZMap,
};


export default {
  version,
  install
};
