import ZScatter from './src/scatter';

/* istanbul ignore next */
ZScatter.install = function install(Vue) {
	Vue.component(ZScatter.name, ZScatter);
};

export default ZScatter;
