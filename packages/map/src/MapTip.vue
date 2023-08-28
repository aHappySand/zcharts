<template>
  <div class="map-tip" :style="style">
      <div class="tip-item" v-for="info in tips">
        {{info}}
      </div>
  </div>
</template>

<script>
  export default {
    name: 'MapTip',
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
      };
    },
    watch: {
      position: {
        deep: true,
        handler() {
          this.getTipStyle();
        }
      },
      visible(val, old) {
        this.$set(this.style, 'display', val ? 'block' : 'none');
        if (val) {
          this.getTipStyle();
        }
      }
    },
    methods: {
      getTipStyle() {
        this.$nextTick(() => {
          let { top, left } = this.position;
          if (this.$el) {
            const rect = this.$el.getBoundingClientRect();
            const width = rect.width || 50;
              const height = rect.height || 80;
            const dis = 20;
            // 超过了左边界
            if (left - width < dis + 20) {
              left += dis;
            } else {
              left = left - width - dis;
            }
            if (top - height < dis + 20) {
              top += dis;
            } else {
              top = top - height - dis;
            }
          }

          this.$set(this.style, 'top', `${top}px`);
          this.$set(this.style, 'left', `${left}px`);
        });
      }
    },
  };
</script>

<style lang="less" scoped>
  .map-tip {
    position: absolute;
    background: #FFFFFF;
    padding: 5px;
    border: 1px solid #8b949e;
    z-index: 99999999;
  }
</style>
