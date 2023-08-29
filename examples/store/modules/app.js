import menus from '@/config/menu';
import { MD5 } from 'crypto-js';

let asideCollapse = 2;

// eslint-disable-next-line no-restricted-globals
const initShowMode = location.hash.includes('viewOnly=true') || location.hash.includes('token=') ? 4 : 2;

const menuMap = Object.create(null);

// eslint-disable-next-line no-shadow
function formatMenus(menus) {
  menus = JSON.parse(JSON.stringify(menus));
  let id = 10000;
  const walk = (ms, preMenu) => {
    ms.forEach(menu => {
      menu.id = id++;
      menu.parentIds = preMenu ? [...preMenu.parentIds, preMenu.id] : [];
      if (menu.children) {
        walk(menu.children, menu);
      } else {
        menu.fullPath = `/demo/${menu.id}?name=${menu.path}&title=${menu.title}`;
        menuMap[MD5(menu.fullPath)] = menu.parentIds;
      }
    });
  };
  walk(menus);
  return menus;
}

const getSecondMenus = (state) => {
  if (state.parentMenuIds && state.parentMenuIds.length) {
    const parent = state.menus.find(menu => menu.id === state.parentMenuIds[0]);
    return parent.children;
  }
  return [];
};

const setSecondMenus = (state) => {
  state.secondMenus = getSecondMenus(state);
  if (state.secondMenus.length === 0) {
    state.asideShowMode = 1;
  } else {
    state.asideShowMode = 2;
  }
};

export default {
  namespaced: true,
  state: {
    asideShowMode: initShowMode,
    visitedViews: [], // 访问过的页面
    menus: formatMenus(menus),
    secondMenus: [],
    parentMenuIds: [], // 从上级往下级
    mapQueue: [],
  },
  mutations: {
    SET_ASIDE_SHOW_MODE: (state, asideShowMode) => {
      // -1代表回到之前的侧边栏显示状态
      if (asideShowMode === -1) {
        if (!state.asideShowMode) {
          state.asideShowMode = asideCollapse;
        }
        return;
      }

      if (state.asideShowMode) {
        asideCollapse = state.asideShowMode;
      }

      state.asideShowMode = asideShowMode;
    },

    ADD_VISITED_VIEW: (state, fullPath) => {
      console.log(state.visitedViews, fullPath, 'sssssss');
      if (state.visitedViews.includes(fullPath)) {
        return;
      }

      state.visitedViews.push(fullPath);
    },
    DEL_VISITED_VIEW: (state, fullPath) => {
      const visitedViews = JSON.parse(JSON.stringify(state.visitedViews));
      for (const i in visitedViews) {
        const v = visitedViews[i];
        if (v === fullPath) {
          visitedViews.splice(i, 1);
          break;
        }
      }
      state.visitedViews = visitedViews;
    },
    DEL_OTHERS_VIEWS: (state, fullPath) => {
      state.visitedViews = [];
      state.visitedViews.push(fullPath);
    },
    DEL_ALL_VIEWS: (state) => {
      state.visitedViews = [];
    },
    CHECK_CURRENT_PATH: (state, fullPath) => {
      const pathMD5 = MD5(decodeURIComponent(fullPath));
      state.parentMenuIds = menuMap[pathMD5] || [];
      setSecondMenus(state);
    },
    SET_PARENT_MENU_ID: (state, ids) => {
      state.parentMenuIds = ids;
      setSecondMenus(state);
    },
    PUSH_MAP: (state, id) => {
      state.mapQueue.push(id);
    },
    POP_MAP: (state) => state.mapQueue.pop()
  },
  actions: {
    setAside({ commit }, showMode) {
      commit('SET_ASIDE_SHOW_MODE', showMode);
    },
    addVisitedView({ commit }, fullPath) {
      commit('ADD_VISITED_VIEW', fullPath);
    },
    delVisitedView({ commit }, fullPath) {
      commit('DEL_VISITED_VIEW', fullPath);
    },
    delOtherViews({ commit }, fullPath) {
      commit('DEL_OTHERS_VIEWS', fullPath);
    },
    delAllViews({ commit }) {
      commit('DEL_ALL_VIEWS');
    },
    findParentMenu({ commit }, fullPath) {
      commit('CHECK_CURRENT_PATH', fullPath);
    },
    setParentMenuId: ({ commit }, ids) => {
      commit('SET_PARENT_MENU_ID', ids);
    },
    pushMap: ({ commit }, id) => {
      commit('PUSH_MAP', id);
    },
    popMap: ({ commit }) => {
      commit('POP_MAP');
    }
  },
};
