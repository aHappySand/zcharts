<template>
	<div>
		<el-submenu v-if="menu.children && menu.children.length" :index="`${menu.id}`" popper-class="app-aside-submenu" :class="[`el-submenu${level}`]">
			<template slot="title">
				<svg-icon icon-class="menu-0"></svg-icon>
				<span :title="menu.title">{{ menu.title }}</span>
			</template>
			<template v-for="cMenu in menu.children">
				<MenuItem :menu="cMenu" :key="cMenu.id" :level="level + 1"></MenuItem>
			</template>
		</el-submenu>
		<el-menu-item v-else :index="`${menu.fullPath}`" :class="[`el-menu-item${level}`]" @click="toPage(menu)">
			<svg-icon icon-class="menu-0"></svg-icon>
			<span slot="title" :title="menu.title">{{ menu.title }}</span>
		</el-menu-item>
	</div>
</template>
<script>

	export default {
		name: 'MenuItem',
		inject: ['toPage'],

		props: {
			menu: {
				type: Object,
				required: true,
			},
			level: {
				type: Number,
				default: 1,
			},
		},
	};
</script>
<style lang="less" scoped>
	.el-menu-item {
		height: 49px;
		line-height: 49px;
		background: #465166 !important;
		border-bottom: 1px solid #4d586d;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		&:hover {
			background: #2d98ff !important;
		}
		&.is-active {
			background: #2d98ff !important;
		}
	}
	.el-submenu {
		&.is-active {
			::v-deep {
				.el-submenu__title {
					background: #2d98ff !important;
				}
			}
		}
		&.is-opened {
			::v-deep {
				.el-submenu__title {
					background: #465166 !important;
					.el-icon-arrow-down {
						transform: translate(6px, 2px) rotateZ(0deg);
					}
				}
			}
		}
		::v-deep {
			.el-submenu__title {
				height: 49px;
				line-height: 49px;
				border-bottom: 1px solid #4d586d;
				background: #465166 !important;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
				.el-submenu__icon-arrow {
					color: #fff;
					font-weight: 900;
				}
				.el-icon-arrow-down {
					transform: translate(6px, 2px) rotateZ(-90deg);
				}
			}
			.el-submenu__title:hover {
				background: #2d98ff !important;
			}
		}
	}
</style>
