<template>
	<div class="zp-header">
		<div class="header-left">
			<div class="menu pl">
				<i class="el-icon-s-fold" v-show="asideShowMode === 2" @click="handleFoldAside"></i>
				<i class="el-icon-s-unfold" v-show="asideShowMode === 1" @click="handleUnfoldAside"></i>

				<ul class="first-menu">
					<li v-for="(menu, index) in menus" :class="{active: parentMenuIds.includes(menu.id) }" @click="clickMenu(index)">
						{{menu.title}}
					</li>
				</ul>
			</div>
		</div>
		<div class="header-right"></div>
	</div>
</template>

<script>
	import { Vuex } from 'examples/config';
	const { mapActions, mapState } = Vuex;

	export default {
		name: "Header",
		computed: {
			...mapState('app', ['asideShowMode', 'parentMenuIds', 'menus']),
		},
		data() {
			return {

			}
		},
		created() {

		},
		methods: {
			...mapActions('app', ['setAside', 'setParentMenuId',]),
			handleFoldAside() {
				this.setAside(1);
			},
			handleUnfoldAside() {
				this.setAside(2);
			},
			clickMenu(index) {
				const menu = this.menus[index];
				this.setParentMenuId([menu.id]);
			}
		}
	}
</script>

<style lang="scss" scoped>
.zp-header {
	display: flex;
	height: 40px;
	line-height: 40px;
	background-color: #409eff;

	.header-left {
		flex: 1;
	}
	.header-right {
		width: 260px;
	}

	.first-menu {
		margin-left: 20px;
		display: inline-block;

		li {
			display: inline-block;
			height: 100%;
			padding-left: 10px;
			padding-right: 10px;

			&.active {
				background-color: #ffffff;
			}
		}
	}
}
</style>
