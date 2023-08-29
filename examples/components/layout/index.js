import { registerAsyncComponent } from 'examples/config/index';

registerAsyncComponent({
	name: 'Layout',
	component: () => import(/* webpackChunkName: "Layout" */ './src/index'),
});
registerAsyncComponent({
	name: 'LayoutHeader',
	component: () => import(/* webpackChunkName: "LayoutHeader" */ './src/Header'),
});
registerAsyncComponent({
	name: 'LayoutLeft',
	component: () => import(/* webpackChunkName: "LayoutLeft" */ './src/Left'),
});
registerAsyncComponent({
	name: 'LayoutTags',
	component: () => import(/* webpackChunkName: "LayoutTags" */ './src/Tags'),
});
registerAsyncComponent({
	name: 'LayoutFooter',
	component: () => import(/* webpackChunkName: "LayoutTags" */ './src/Footer'),
});
