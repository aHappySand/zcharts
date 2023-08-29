import { Vue, Vuex } from 'examples/config';
import app from './modules/app';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    app,
  },
});
