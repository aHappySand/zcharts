<template>
	<div class="zp-tags">
		<el-tabs v-model="currentTab" @tab-remove="handleRemove" @tab-click="handleClickTab">
			<el-tab-pane
				:key="item.fullPath"
				v-for="(item,index) in visitedTags"
				:label="item.title"
				:closable="index>0"
				:name="item.fullPath"
			></el-tab-pane>
		</el-tabs>
		<div class="tags-menu-box">
			<el-dropdown trigger="click" @command="handleCommand">
				<i class="el-icon-arrow-down el-icon--right"></i>
				<el-dropdown-menu slot="dropdown" class="app-tags-dropdown-menu">
					<el-dropdown-item :disabled="visitedTags.length === 1" command="close-current">关闭当前</el-dropdown-item>
					<el-dropdown-item :disabled="visitedTags.length === 1" command="close-others">关闭其他</el-dropdown-item>
				</el-dropdown-menu>
			</el-dropdown>
		</div>
	</div>
</template>

<script>
	import { Vuex } from '@/config';
	import { parseQueryString, removeUrlAnchor } from '@/utils';

	const { mapState, mapActions } = Vuex;
	export default {
		name: "Tags",
		data() {
			return {
				currentTab: 'home',
				visitedTags: [],
			}
		},
		computed: {
			...mapState('app', ['visitedViews', 'currentView']),
			visitedLen() {
				return this.visitedViews.length;
			},
			fullPath() {
				return this.$route.fullPath;
			},
		},
		watch: {
			visitedLen: {
				handler() {
					this.setVisitedViews();
				},
				immediate: true,
			},
			fullPath: {
				handler(to) {
					if(to === '' || to === '/') {
						this.$router.push({ path: '/demo?name=Home' });
						return;
					}
					this.addViewTags(to);
				},
				immediate: true,
			},
		},
		created() {

		},
		methods: {
			setVisitedViews() {
				const views = [];
				views.push({
					fullPath: '/demo?name=Home',
					title: 'Home',
				});
				this.visitedViews.forEach((curr) => {
					const params = parseQueryString(curr);
					if(params.name !== 'Home') {
						views.push({
							fullPath: curr,
							title: decodeURIComponent(params.title) || 'Custom',
						});
					}
				});
				this.visitedTags = views;
			},
			...mapActions('app', ['delVisitedView', 'findParentMenu', 'addVisitedView']),
			handleRemove(name) {
				const index = this.visitedViews.indexOf(name) + 1;
				const len = this.visitedViews.length + 1;
				this.delVisitedView(name);
				//删除当前页面的，需要更换
				if(name === this.$route.fullPath) {
					let path;
					let newIndex = index;
					if(index >= len - 1) {
						newIndex = index - 1;
					}
					path = this.visitedTags[newIndex].fullPath;
					this.$router.push({ path });
				}
			},
			addViewTags(to) {
				const index = to.indexOf('#');
				if(index !== -1) {
					const hash = to.substr(index);
					to = to.substring(0, index);
				}

				this.findParentMenu(to);
				if(to !== '/demo?name=Home') {
					this.addVisitedView(to);
				}
				this.currentTab = to;
			},
			handleClickTab(tab) {
				if (tab.name === this.fullPath) {
					return;
				}
				this.$router.push({ path: tab.name });
			},
			handleCommand() {

			},
		}
	}
</script>

<style lang="scss" scoped>
.zp-tags {
	display: flex;
	height: 40px;
	position: relative;
	padding-left: 20px;
	border-bottom: 2px solid #E4E7ED;

	.el-tabs--top {
		flex: 1;

		::v-deep .el-tabs__nav-wrap::after {
			height: 0;
		}
	}

	.tags-menu-box {
		/*position: absolute;*/
		/*top: 0;*/
		/*right: 0;*/
		width: 40px;
		height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;

		i {
			color: #409eff;
			font-weight: bold;
		}

	}
}
</style>
