<template>
	<div class="zp-left" :class="{
		unfold: asideShowMode === 2,
		fold: asideShowMode === 1,
		hide: asideShowMode === 0,
	}">
		<div class="logo-box">
<!--			<img src="data:image/png;base64,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" alt="">-->
		</div>
		<el-menu
			class="menu-list"
			:default-active="activeMenu"
			:collapse="asideShowMode === 1"
			:collapse-transition="false"
			text-color="#fff"
			active-text-color="#fff"
			background-color="#2F3646"
			:menu-trigger="'click'"
		>
			<template v-for="(menu, index) in secondMenus">
				<MenuItem :menu="menu" :key="`${menu.id}`"></MenuItem>
			</template>
		</el-menu>
	</div>
</template>

<script>
	import { Vuex } from 'examples/config';
	const { mapState } = Vuex;
	import MenuItem from './MenuItem.vue';
	import { removeUrlAnchor } from '@/utils';

	export default {
		name: "Left",
		components: {
			MenuItem
		},
		provide() {
			return {
				toPage: this.handleClickMenu2,
			}
		},
		computed: {
			...mapState('app', ['asideShowMode', 'secondMenus', 'setAside']),
			activeMenu() {
				return decodeURIComponent(removeUrlAnchor(this.$route.fullPath));
			}
		},
		data() {
			return {
			};
		},
		methods: {
			handleClickMenu2(menu) {
				const params = menu.params || {};
				const query = menu.query || {};
				const route = {
					name: 'demo',
					query: {
						...query,
						name: menu.path,
						title: menu.title,
					},
					params: {
						...params,
						id: menu.id,

					},
				}
				this.$router.push(route);
				return false;
			}
		}
	}
</script>

<style lang="scss" scoped>
.zp-left {
	box-shadow: 1px 0px 4px 0px #ccc;
	transition: width 0.5s;

	.logo-box {
		display: flex;
		height: 40px;
		background-color: #2f3646;
		align-items: center;
		justify-content: center;

		img {
			object-fit: contain;
			max-width: 100%;
			max-height: 100%;
		}
	}

	&.unfold {
		width: 260px;
	}

	&.fold {
		width: 64px;
	}

	&.hide {
		width: 0;
	}

	::v-deep .el-menu--collapse {
		.el-submenu__title span {
			display: inline-block;
			width: 0;
			height: 0;
			visibility: hidden;
		}

		.el-submenu__icon-arrow {
			visibility: hidden;
		}
	}
}
</style>
