import { registerAsyncComponent } from '@/config';

registerAsyncComponent({
  name: 'LodashPlugin',
  component: () => import(/* webpackChunkName: "LodashPlugin" */ './LodashPlugin.vue'),
});
