import ZCheckbox from './src/index';

/* istanbul ignore next */
ZCheckbox.install = function install(Vue) {
  Vue.component(ZCheckbox.name, ZCheckbox);
};

export default ZCheckbox;
