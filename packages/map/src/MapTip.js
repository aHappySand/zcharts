import Vue from 'vue';
import _MapTip from './MapTip.vue';

const Component = Vue.extend(_MapTip);

let instance = null;

function MapTip(options) {
  // 单例模式，先判断实例是否存在，保证页面上只存在一个实例组件
  if (!instance) {
    instance = new Component({
      el: document.createElement('div'),
      data() {
        return options;
      }
    });
    document.body.appendChild(instance.$el);
    // 上一步刚挂载dom，因此使用nextick确保dom已更新
    Vue.nextTick(() => {
      instance.visible = true;
    });
  } else {
    // 存在实例，则合并options，更新视图
    instance.visible = true;
    Object.assign(instance, options);
  }
}

// 提供close方法，方便直接调用
MapTip.close = () => {
  if (instance) {
    instance.visible = false;
  }
};

export default {
  // 提供install方法，便于Vue.use()注册。将方法挂载在Vue原型上，方便全局使用。
  install() {
    Vue.prototype.$mapTip = MapTip;
  }
};
