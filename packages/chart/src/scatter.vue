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
          <Container ref="chart"></Container>
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
  import ChartManage from './utils/chart.manage.js';

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
      this.manage = ChartManage();
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
        const map = this.$refs.mapc;
        const { width, height } = map.getBoundingClientRect();
        map.width = width;
        map.height = height;

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
          drawed: () => {
            this.isLoading = false;
          }
        };

        this.manage.init({
 data: {
          type: 'init',
          data: [{
            option: {}
          },
            {
              option: {}
            }
          ],
          props: {
            canvas: map
          }
        }
});

        this.handler.init({
          data: this.manage.getList()
        });
      },

      postDrawCommand() {
        const charts = this.$refs.chart;
        const items = [];
        const preSize = this.prePageSize;
        charts.forEach((map, index) => {
          items.push({
            index: preSize + index,
            position: map.getContainerPosition(),
          });
        });
        this.manage.draw({
 data: {
          items
        }
});

        this.handler.drawed();
      },
      getCurrentIndex(index) {
        return index - (this.page - 1) * this.size;
      },
      handleChangePage() {

      }
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
