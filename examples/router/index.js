import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

// 公共路由
export const constantRoutes = [
  {
    path: '/404',
    component: () => import('examples/views/error/404.vue'),
    hidden: true
  },
  {
    path: '/500',
    component: () => import('examples/views/error/500.vue'),
    hidden: true
  },
  {
      path: '/',
      component: () => import('examples/components/layout/src/index.vue'),
      children: [
        {
          path: '/demo/:id?',
          name: 'demo',
          component: () => import('examples/views/Main.vue'),
          meta: {
            custom: true,
            title: 'Custom',
            keepAlive: true,
          },
          query: {
            name: '',
            title: 'Custom'
          },
        },
      ]
    }
  ];

const router = new Router({
  // base: '/',
  routes: constantRoutes,
  mode: 'history',
  // scrollBehavior (to, from, savedPosition) {
  //   if (to.hash) {
  //     return {
  //       el: '#main',
  //       behavior: 'smooth',
  //     }
  //   }
  // }
});
export default router;
