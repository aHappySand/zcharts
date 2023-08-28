<template>
  <div class="ruler-box" :class="'ruler-' + this.ruler" :style="transformStyle">
    <span class="ruler-axis y-axis">↑</span>
    <span class="ruler-axis x-axis">→</span>
  </div>
</template>

<script>
  export default {
    name: 'RulerBox',
    props: {
      ruler: {
        type: String,
        default: 'RU',
      },
      transformStyle: {
        type: String,
        default: '',
      }
    }
  };
</script>

<style lang="less" scoped>

  .ruler-box {
    position: relative;
    width: 16px;
    height: 16px;
    display: inline-block;
    /*line-height: 12px;*/
    margin-left: 5px;
    margin-right: 5px;

  &.active {
     background-color: #FFEDC8;
     box-shadow: inset 1px 1px 4px #949494;
   }

  .ruler-axis {
    position: absolute;
  }

  .x-axis {
    color: #ff0000;
  }

  y-axis {
    color: #008000;
  }

  &.ruler-RU {
  .y-axis {
    left: 1px;
  }

  .x-axis {
    top: 3px;
  }
  }

  &.ruler-RB {
  .y-axis {
    transform: rotate(180deg);
    left: 1px;
    top: 5px;
  }

  .x-axis {
    top: 0px;
  }
  }

  &.ruler-LU {
  .x-axis {
    top: 6px;
    transform: rotate(180deg);
  }
  .y-axis {
    left: 6px;
    top: 1px;
  }
  }


  &.ruler-LB {
  .x-axis {
    transform: rotate(180deg);
    top: 1px;
  }
  .y-axis {
    transform: rotate(180deg);
    top: 4px;
    left: 6px;
  }
  }
  }
</style>
