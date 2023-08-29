import { registerAsyncComponent } from '@/config';

registerAsyncComponent({
  name: 'ZMap1',
  component: () => import(/* webpackChunkName: "ZMap1" */ './ZMap1.vue'),
});
