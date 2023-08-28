<template>
  <div class="wafer-map-page fill" v-loading="isLoading">
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
          <BaseMap
            ref="map"
            :mapOption="mapOption"
            :mapProperty="split.data.mapProperty"
            :sourceAggregateData="split.data.aggregateData"
            :sourceDefectData="split.data.defectData"
            :statGroup="split.data.statGroup"
            :stat-style="statsStyle"
            :show-fields="split.data.showWaferFields"
            :show-defect-fields="split.data.showDefectFields"
            :zoneAnalysisData="split.data.zoneAnalysisData"
            :showDieGrid="showDieGrid"
            @onMousemoveInfo="(e) => handleMousemoveInfo(split, e)"
            @onResize="(r) => handleFullScreen(split, r)"
            @onScale="(r) => handleScale(split, r)"
            @onClick="(r) => handleClick(split, r)"
            @onSelectArea="(area) => handleSelectArea(split, area)"
            @onSelectAreaEnd="(area) => handleSelectAreaEnd(split, area)"
            @toggleShowZone="(show) => handleToggleShowZone(split, show)"
            @toggleShowGrid="(show) => handleToggleShowGrid(split, show)"
            @onReset="() => handleReset(split)"
            @toggleShowDie="(show) => handleToggleShowDie(split, show)"
            @onCancelDie="() => handleCancelDie(split)"
            @onTransform="(t) => handleTransform(split, t)"
          >
            <template v-slot:other>
              <slot name="other" :item="split"></slot>
            </template>
          </BaseMap>
        </div>
      </div>
      <div class="text-container" ref="textc">
        <div></div>
      </div>
    </div>
    <div class="pagination-container" v-if="total > 1">
      <el-pagination
        :current-page.sync="page"
        :page-size="size"
        :total="total"
        layout="total, prev, next, jumper"
        @current-change="handleChangePage"></el-pagination>
    </div>
  </div>
</template>

<script>
  import { createWorkerTask } from '../../../src/utils/createWorker';
  // eslint-disable-next-line import/extensions
  import MapWorker from './utils/map.worker.js';
  // eslint-disable-next-line import/extensions
  import BaseMap from './BaseMap.vue';

  export default {
    name: 'ZMap',
    components: {
      BaseMap,
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
        isLoading: true,
        gridKey: Math.random(),
        total: 0,
        size: 1,
        page: 1,
        row: 1,
        col: 2,
        mapOption: {
          diexField: 'die_x',
          dieyField: 'die_y',
          productField: '',
          showMapRuler: true,
          colorGroups: [],
          detailVisiable: false,
          zoneConfigMap: {},
          statisticsInfos: [],
          toolTips: [
            {
              name: 'Die_X',
              enable: true
            },
            {
              name: 'Die_Y',
              enable: true
            },
            {
              name: '值',
              enable: true
            },
            {
              name: 'Zone Name',
              enable: true
            }
          ],
          fieldTypeMap: {
            wafer_id: false,
            lot_id: false,
            product_id: false,
            hbin_code: true,
            hbin_flag: false,
            die_x: true,
            die_y: true,
            lot_Yield: true,
            bin_F_Qty: true,
            bin_flag: false,
            wafer_No: false
          },
          showTitle: true,
          zoneAnalysis: {},
          zoneAnalysisVisible: false,
          gridLineVisible: true,
          reverseDieX: false,
          reverseDieY: false,
          showZone: true,
          showStats: true,
          showProduct: true,
          showValueFieldName: true,
          colorModel: 0,
          coorXField: null,
          coorYField: null,
          mapType: 1,
          defectColorField: null,
          useDefaultColor: false,
          defaultColor: '#FFB74441',
          colorFieldIsNumberic: false,
          defectMarkerField: null,
          useDefaultMarker: false,
          defaultMarker: 0,
          markerFieldIsNumberic: false,
          defectMarkerSizeField: null,
          markerSizeFieldIsNumberic: false,
          defectStatsTypes: [],
          overlayColorMode: 1,
          enableOverlay: false,
          showOverlayStats: false,
          overlayValueField: null,
          showTotalDefects: true,
          showDefectRatio: false,
          bindCodeField: '',
          defectColors: [],
          defectMakers: [],
          defectMakerSizes: [],
          series: [
            {
              groupColors: [],
              name: 'max(hbin_code)',
              aliasName: 'max(hbin_code)',
              valueField: 'hbin_code',
              aggregateType: 'max',
              isSecondaryAxis: false,
              secondaryAxisTitle: null,
              showLabel: false,
              isCustomized: false,
              seriesType: 'WaferMapOption',
              specs: []
            }
          ],
          showOtherStat: false,
          noEdit: true
        },
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
        const offscreenCanvas = canvas.transferControlToOffscreen();

        this.worker = null;

        this.size = this.row * this.col;

        this.handler = {
          init: (event) => {
            this.gridKey = Math.random();
            const { split, mapOption, statsStyle } = event.data.data;
            this.splitList = split;
            this.mapOption = mapOption;
            this.statsStyle = statsStyle;
            this.total = this.splitList.length;

            this.$nextTick(() => {
              this.postDrawCommand();
            });
          },

          draw: (event) => {
            const { index, property } = event.data;
            const currIndex = this.getCurrentIndex(index);

            const t = 1;
            const drawCanvas = () => {
              const map = this.$refs.map[currIndex];
              if (map) {
                map.changeCanvas(canvas, property);
              } else {
                requestAnimationFrame(drawCanvas);
              }
            };
            requestAnimationFrame(drawCanvas);
          },

          mousemoveInfo: (event) => {
            const { index, data } = event.data;
            const currIndex = this.getCurrentIndex(index);
            const map = this.$refs.map[currIndex];
            if (map) {
              map.mousemoveInfo(data);
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

        createWorkerTask(MapWorker, ({ event, wt }) => {
            if (!this.worker) {
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
            sourceData: this.sourceData,
            ...opt,
          }, [offscreenCanvas]);
      },
      postDrawCommand() {
        if (!this.worker) return;
        const maps = this.$refs.map;
        const items = [];
        const preSize = this.prePageSize;
        maps.forEach((map, index) => {
          items.push({
            index: preSize + index,
            position: map.getContainerPosition(),
          });
        });

        this.worker.postMessage({
          type: 'draw',
          items,
        });
      },
      updateCanvas() {
        const canvas = this.$refs.mapc;
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
      },
      getResetOption() {
        const { mapOption } = this.$data;
        const { width, height } = this.$el.getBoundingClientRect();
        return {
          mapOption,
          props: {
            row: this.row,
            col: this.col,
            width,
            height,
            gapW: 0,
            gapH: 60,
            showDieGrid: this.showDieGrid,
          }
        };
      },
      getCurrentIndex(index) {
        return index - (this.page - 1) * this.size;
      },
      handleFullScreen(split, rect) {
        if (this.worker) {
          this.worker.postMessage({
            type: 'singleResize',
            index: split.index,
            props: rect,
          });
        }
      },
      handleMousemoveInfo(split, event) {
        if (this.worker) {
          this.worker.postMessage({
            type: 'mousemoveInfo',
            index: split.index,
            event,
          });
        }
      },
      handleScale(split, props) {
        if (this.worker) {
          this.worker.postMessage({
            type: 'scale',
            index: split.index,
            props,
          });
        }
      },
      handleClick(split, event) {
        if (this.worker) {
          this.worker.postMessage({
            type: 'click',
            index: split.index,
            event,
          });
        }
      },
      handleSelectArea(split, area) {
        if (this.worker) {
          this.worker.postMessage({
            type: 'selectArea',
            index: split.index,
            area,
          });
        }
      },
      handleSelectAreaEnd(split, area) {
        if (this.worker) {
          this.worker.postMessage({
            type: 'selectAreaEnd',
            index: split.index,
            area,
          });
        }
      },
      handleToggleShowZone(split, show) {
        if (this.worker) {
          this.mapOption.zoneVisible = show;
          this.worker.postMessage({
            type: 'toggleShowZone',
            index: split.index,
            show,
          });
        }
      },
      handleToggleShowGrid(split, show) {
        if (this.worker) {
          this.showDieGrid = show;
          this.worker.postMessage({
            type: 'toggleShowGrid',
            index: split.index,
            show,
          });
        }
      },
      handleReset(split) {
        if (this.worker) {
          this.worker.postMessage({
            type: 'reset',
            index: split.index,
          });
        }
      },
      handleToggleShowDie(split, show) {
        if (this.worker) {
          this.worker.postMessage({
            type: 'toggleShowDie',
            index: split.index,
            show
          });
        }
      },
      handleCancelDie(split) {
        if (this.worker) {
          this.worker.postMessage({
            type: 'cancelDie',
            index: split.index,
          });
        }
      },
      handleChangePage() {
        if (this.worker) {
          this.worker.postMessage({
            type: 'paging',
            page: this.page,
          });
        }
      },
      handleTransform(split, transform) {
        if (this.worker) {
          this.worker.postMessage({
            type: 'transform',
            transform,
            index: split.index,
          });
        }
      }
    },

    beforeDestroy() {
      if (this.workTask) {
        this.workTask.free();
        this.workTask = null;
        this.worker = null;
      }
    }
  };
</script>

<style lang="less" scoped>
  .wafer-map-page {
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

    .text-container {
      position: absolute;
      left: 0;
      width: 100%;
      height: 100%;

      &>div {
        position: absolute;
      }
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
