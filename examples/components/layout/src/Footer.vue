<template>
	<div class="zp-footer" :class="{show: true}">
<!--		<i class="el-icon-circle-close footer-close pointer" @click="closeFooter"></i>-->
		<div class="footer-content">
			ssss
		</div>
	</div>
</template>

<script>
	export default {
		name: "Footer",
		data() {
			return {
				isShow: false,
			}
		},
		mounted() {
			this.addEvent();
		},
		methods: {
			addEvent() {
				this.mouseIn = (e) => {
					this.isShow = false;
					if (document.body.clientHeight - e.pageY <= 40) {
						this.isShow = true;
					}
				}
				this.$parent.$el.addEventListener('mousemove', this.mouseIn);
			},
			removeEvent() {
				this.$parent.$el.removeEventListener('mousemove', this.mouseIn);
			},
			closeFooter() {
				this.isShow = false;
				this.removeEvent();
			}
		},
		beforeDestroy() {
			this.removeEvent();
		}
	}
</script>

<style lang="scss" scoped>
.zp-footer {
	position: fixed;
	height: 40px;
	width: 100%;
	bottom: -40px;
	transition: bottom 0.5s;
	background-color: #eeeeee;

	&.show {
		bottom: 0;
	}

	.footer-content {
		line-height: 40px;
		text-align: center;
	}

}
</style>
