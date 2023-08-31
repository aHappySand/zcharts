<template>
  <div class="chart-page fill" v-loading="isLoading">
    <div class="map-box">
      <canvas class="map-c" ref="mapc"></canvas>
      <div class="grid-container" :key="gridKey">
        <div
          v-for="split in splitList.slice((page - 1) * size, page * size)"
          :class="['grid-split']"
          :key="split.id"
          :style="gridStyle"
          ref="splits"
        >
          <Container ref="chart"
             @onTransform="(t) => handleTransform(split, t)"
             @onMousemoveInfo="(mouse, e) => handleMousemoveInfo(split, mouse, e)"
             @onOrbitControls="(e) => handleOrbitControls(split, e)"
          ></Container>
        </div>
      </div>
    </div>
    <div class="pagination-container" v-if="total > 1">
      <el-pagination :current-page.sync="page" :page-size="size" :total="total" layout="total, prev, next, jumper" @current-change="handleChangePage"></el-pagination>
    </div>
  </div>
</template>

<script>
  import Container from './container.vue';
  import { createWorkerTask } from '../../../src/utils/createWorker';
  import ChartWorker from './utils/chart.worker.js';
  import Vue from 'vue';

  import ChartTip from './ChartTip.js';
  Vue.use(ChartTip);

  export default {
    name: 'ZScatter',
    components: {
      Container,
    },
    props: {
      sourceData: Object,
    },
    watch: {

    },
    data() {
      this.id = 'map';
      this.splitList = [];

      this.options = [{}];

      return {
        isLoading: false,
        gridKey: Math.random(),
        total: 0,
        size: 2,
        page: 1,
        row: 1,
        col: 1,
        statsStyle: {},
        showDieGrid: true,
      };
    },

    created() {

    },

    computed: {
      gridStyle() {
        return {
          width: `${100 / this.col}%`,
          height: `${100 / this.row}%`,
        };
      },
      prePageSize() {
        return (this.page - 1) * this.row * this.col;
      }
    },
    mounted() {
      this.init();
    },
    methods: {
      init() {
        const canvas = this.$refs.mapc;
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        const offscreenCanvas = canvas.transferControlToOffscreen();

        this.worker = null;

        this.size = this.row * this.col;

        this.handler = {
          init: (event) => {
            this.gridKey = Math.random();
            const { split } = event.data.data;
            this.splitList = split;
            this.total = this.splitList.length;
            this.$nextTick(() => {
              this.postDrawCommand();
            });
          },

          draw: (event) => {
            const { index, property } = event.data;
            const currIndex = this.getCurrentIndex(index);

            let t = 1;
            const drawCanvas = () => {
              const map = this.$refs.map[currIndex];
              if (map) {
                map.changeCanvas(canvas, property);
              } else {
                requestAnimationFrame(drawCanvas);
              }
            }
            requestAnimationFrame(drawCanvas);
          },

          mousemoveInfo: (event) => {
            const { index, data } = event.data;
            const currIndex = this.getCurrentIndex(index);
            const map = this.$refs.chart[currIndex];
            if (map) {
              this.mousemoveInfo(data);
            }
          },
          drawed: () => {
            this.isLoading = false;
          },

          text: () => {

          }
        };

        const opt = this.getResetOption();
        opt.props.canvas = offscreenCanvas;

        createWorkerTask(ChartWorker, ({event, wt}) => {
            if(!this.worker) {
              this.workTask = wt;
              this.worker = wt.worker;
            }
            const handle = this.handler[event.data.type];
            if (handle) {
              handle.call(this, event);
            }
          },
          {
            type: 'init',
            ...opt,
          }, [offscreenCanvas]);
      },
      getResetOption() {
        const { width, height } = this.$el.getBoundingClientRect();
        return {
          options: this.options,
          props: {
            row: this.row,
            col: this.col,
            width,
            height,
            gapW: 0,
            gapH: 60,
          }
        }
      },
      postDrawCommand() {
        if (!this.worker) return;
        const maps = this.$refs.chart;
        const items = [];
        const preSize = this.prePageSize;
        maps.forEach((map, index) => {
          items.push({
            index: preSize + index,
            dom: map.cloneDom(),
          });
        });

        this.worker.postMessage({
          type: 'draw',
          items,
        });
      },
      getCurrentIndex(index) {
        return index - (this.page - 1) * this.size;
      },
      handleTransform(split, transform) {
        if (this.worker) {
          this.worker.postMessage({
            type: 'transform',
            transform,
            index: split.index,
          });
        }
      },
      handleChangePage() {

      },
      handleMousemoveInfo(split, event, e) {
        this.mouseEvent = e;
        if (this.worker) {
          this.worker.postMessage({
            type: 'mousemoveInfo',
            index: split.index,
            event,
          });
        }
      },
      hideDieInfo() {
        this.$chartTip.close();
      },
      mousemoveInfo(info) {
        console.log(info, '---------------------');
        if (info && this.mouseEvent) {
          this.showDieInfo({ data: info, e: this.mouseEvent });
        } else {
          this.hideDieInfo();
        }
      },
      showDieInfo({ data, e }) {
        this.$chartTip({
          tips: data,
          position: {
            left: e.pageX,
            top: e.pageY,
          }
        });
      },
      handleOrbitControls(split, data) {
        if (this.worker) {
          this.worker.postMessage({
            type: 'orbitControls',
            index: split.index,
            data,
          });
        }
      },
    },

    beforeDestroy() {

    }
  };
</script>

<style lang="less" scoped>
  .chart-page {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .map-box {
      width: 100%;
      height: 100%;
      flex-grow: 1;
      position: relative;

    }

    .map-c {
      position: absolute;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .grid-container {
      display: flex;
      flex-wrap: wrap;
      overflow: hidden;
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      padding: 0 0 0 0;
    }
    .pagination-container {
      flex-basis: 30px;
      flex-shrink: 1;
      text-align: right;
    }
  }
</style>
