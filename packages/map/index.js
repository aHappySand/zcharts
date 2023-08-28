import ZMap from './src/index';

/* istanbul ignore next */
ZMap.install = function install(Vue) {
  Vue.component(ZMap.name, ZMap);
};

export default ZMap;
