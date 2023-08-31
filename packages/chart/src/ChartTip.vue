<template>
	<div class="chart-tip" :style="style">
			<div class="tip-item" v-for="info in tips">
				<div class="item-header">{{ info.name }}</div>
				<div class="item">
					<span class="item-legend" :class="[`legend-${info.symbol}`]" :style="{backgroundColor: info.color}"></span>
					<span class="left">{{ info.item[0] }}</span>
					<span class="right">{{ info.item[1] }}</span>
					<div style="clear:both"></div>
				</div>
			</div>
	</div>
</template>

<script>
	export default {
		name: "ChartTip",
		data() {
			return {
				position: {
					left: 0,
					top: 0,
				},
				tips: [],
				visible: false,
				style: {
					top: 0,
					left: 0,
					display: 'none',
				}
			}
		},
		watch: {
			position: {
				deep: true,
				handler(){
					this.getTipStyle();
				}
			},
			visible(val, old){
				this.$set(this.style, 'display', val ? 'block' : 'none');
				if(val){
					this.getTipStyle();
				}
			}
		},
		methods: {
			getTipStyle(){
				this.$nextTick(() => {
					let {top, left} = this.position;
					if(this.$el){
						const rect = this.$el.getBoundingClientRect();
						let width = rect.width || 50,
							height = rect.height || 80;
						const dis = 20;
						//超过了左边界
						if(left - width < dis + 20){
							left += dis;
						}else {
							left = left - width - dis;
						}
						if(top - height < dis + 20){
							top += dis;
						}else {
							top = top - height - dis;
						}
					}

					this.$set(this.style, 'top', top + 'px');
					this.$set(this.style, 'left', left + 'px');
				});
			}
		},
	}
</script>

<style lang="less" scoped>
	.chart-tip {
		position: absolute;
		background: #FFFFFF;
		padding: 10px;
		z-index: 99999999;
		box-shadow: 1px 1px 5px 0 #707070;

		.item-header {
			line-height: 40px;
			font-weight: 500;
		}

		.item-legend {
			display: inline-block;
			width: 10px;
			height: 10px;
			margin-right: 5px;
		}

		.legend-circle {
			border-radius: 5px;
		}

		.item {
			line-height: 30px;
		}

		.right {
			margin-left: 30px;
			float: right;
			font-weight: 700;
		}
	}
</style>
