<template>
	<svg :class="svgClass" aria-hidden="true" v-on="$listeners">
		<use :xlink:href="iconName" />
	</svg>
</template>
<script>
	export default {
		name: 'svg-icon',
		props: {
			iconClass: {
				type: String,
				required: true,
			},
			className: {
				type: String,
				default: '',
			},
		},
		computed: {
			// 图标名称
			iconName() {
				return `#icon-${this.iconClass}`;
			},
			// 样式类名
			svgClass() {
				if (this.className) {
					return `svg-icon ${this.className}`;
				}
				return 'svg-icon';
			},
		},
		data() {
			return {};
		},
	};
</script>
<style lang="less" scoped>
	.svg-icon {
		width: 1em;
		height: 1em;
		fill: currentColor; /* 图标填充颜色，currentColor是一个变量，表示当前元素的color值，如当前无指定，则从父元素继承 */
		overflow: hidden;
		margin-right: 5px;
		cursor: pointer;
	}
</style>
