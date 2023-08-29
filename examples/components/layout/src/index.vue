<template>
	<div class="zp-container fill">
		<LayoutLeft></LayoutLeft>
		<div class="zp-right" :style="{width}">
			<LayoutHeader></LayoutHeader>
			<LayoutTags ref="tags"></LayoutTags>
			<div class="zp-main">
				<transition name="fade-transform" mode="out-in">
					<div class="main-box">
						<keep-alive>
							<router-view :key="fullPath" ref="routerView" />
						</keep-alive>
					</div>
				</transition>
<!--				<LayoutFooter></LayoutFooter>-->
			</div>
		</div>
	</div>
</template>

<script>
	import { Vuex } from '@/config';
	const { mapState, mapActions } = Vuex;

	export default {
		name: "index",
		computed: {
			...mapState('app', ['visitedViews', 'asideShowMode']),
			fullPath() {
				return this.$route.fullPath;
			},
			width() {
				switch (this.asideShowMode) {
					case 0:
						return '100%';
					case 1:
						return `calc(100% - 64px)`
					case 2:
						return `calc(100% - 260px)`
				}
			},
			visitedLen() {
				return this.visitedViews.length;
			}
		},
		watch: {
			visitedLen(pre, old){
				if(pre <= old) {
					this.destroyInstance();
				}
			}
		},
		methods: {
			destroyInstance() {
				// 清理kepp-alive缓存
				if (this.$refs.routerView) {
					const visitedTags = this.visitedViews;
					const cacheKeys = [...visitedTags, this.$route.fullPath];
					const {cache, keys} = this.$refs.routerView.$vnode.parent.componentInstance;
					for (const key of [...keys]) {
						if (!cacheKeys.includes(key)) {
							cache[key].componentInstance.$destroy();
							delete cache[key];
							const index = keys.indexOf(key);
							if (index > -1) {
								keys.splice(index, 1);
							}
						}
					}
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.zp-container {
	display: flex;

	.zp-right {
		flex: 1;
		display: flex;
		flex-direction: column;

		.zp-main {
			position: relative;
			flex: 1;
			height: calc(100% - 82px);
		}

		.main-box {
			position: relative;
			height: calc(100% - 40px);
			padding: 10px;
			overflow: auto;
		}
	}
}
</style>
