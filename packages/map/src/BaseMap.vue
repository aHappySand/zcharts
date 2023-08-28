<template>
  <div class="wafer-map fill" :class="fullClass" v-loading="drawing"
       @mouseover="handleEnterMap"
       @mouseout="handleLeaveMap"
  >
    <section class="map-box" :style="mapBoxStyle">
      <div class="map-box-header">
        <div>&nbsp;<span v-if="mapOption.showTitle">{{ mapTitle }}</span></div>
        <div class="tool-box" v-show="showTool" v-if="mapOption.showTool !== false">
          <el-tooltip
            content="取消选择"
            class="inline-block"
            placement="top"
          >
            <i class="el-icon-refresh-right" @click.stop.prevent="clearSelectedDie"></i>
          </el-tooltip>

          <el-tooltip
            :content="showGrid ? '隐藏网格' : '显示网格'"
            class="inline-block"
            placement="top"
          >
            <i class="el-icon-s-grid" @click.stop.prevent="toggleShowGrid" :class="showGrid ? '' : 'not-show'"></i>
          </el-tooltip>

          <el-tooltip
            content="显示点"
            class="inline-block"
            placement="top"
          >
            <svg-icon
              @click.stop.prevent="showHidedDie"
              iconClass="show"></svg-icon>
          </el-tooltip>

          <el-tooltip
            content="隐藏点"
            class="inline-block"
            placement="top"

          >
            <svg-icon
              @click.stop.prevent="hideDie"
              iconClass="hide"></svg-icon>
          </el-tooltip>

          <el-tooltip
            :content="zoneVisible ? '隐藏 Zone' : '显示 Zone'"
            class="inline-block"
            placement="top"
            v-if="mapOption.showZone"
          >
            <i
              @click.stop.prevent="toggleShowZone"
              class="el-icon-s-marketing"
              :style="{color: !zoneVisible ? '#c0c0c0' : ''}"
            ></i>
          </el-tooltip>
          <el-tooltip
            :content="showZoneAnalysis ? '隐藏 Zone 分析' : '显示 Zone 分析'"
            class="inline-block"
            placement="top"
          >
            <i
              @click.stop.prevent="toggleShowZoneAnalysis"
              class="el-icon-s-data"
              :style="{color: !showZoneAnalysis ? '#c0c0c0' : ''}"
              v-if="visibleZoneAnalysis"
            ></i>
          </el-tooltip>
          <el-tooltip :content="(showDetail?'关闭':'打开') + '详情面板'" class="inline-block" placement="top">
            <i @click.stop.prevent="openDetail" class="el-icon-s-fold" :style="{transform: showDetail ? 'rotate(180deg)' : ''}"></i>
          </el-tooltip>
        </div>
      </div>
      <div class="map-box-main" ref="container"></div>
      <div  class="map-box-footer">
        <div class="footer-left">
          <el-tooltip content="标尺" v-if="mapOption.showMapRuler">
            <RulerBox :ruler="ruler" :style="transformStyle"></RulerBox>
          </el-tooltip>
          <el-tooltip content="还原" class="inline-block">
            <i @click.stop.prevent="handleReset" class="el-icon-refresh-right"></i>
          </el-tooltip>
        </div>
        <div>&nbsp;</div>
      </div>
    </section>
    <base-detail
      v-show="showDetail"
      class="detail-box"
      :mapOption="mapOption"
      :mapProperty="mapProperty"
      :defectCodes="defectCodes"
      :aggregateField="aggregateField"
      :mapTitle="mapTitle"
      @onSelectDefectCode="onSelectDefectCode"
      @onSelectShape="onSelectShape"
      @onReverseAggColor="handleReverseAggColor"
      :colorGroup="sourceAggregateData.colorGroupShow || []"
      v-bind="$attrs"
      v-on="$listeners"
    ></base-detail>
    <slot name="other"></slot>
  </div>
</template>

<script>
  import * as d3 from 'd3';
  import Vue from 'vue';

  import { isWaferMap } from './utils/map.init.js';
  import BaseDetail from './BaseDetail';
  import RulerBox from './RulerBox.vue';

  import MapTip from './MapTip.js';

  Vue.use(MapTip);

  const emitType = {
    MOUSE_MOVE_INFO: 'onMousemoveInfo',
    CLICK: 'onClick',
    AREA_SELECT: 'onSelectArea',
    AREA_SELECT_END: 'onSelectAreaEnd',
    RESIZE: 'onResize',
    SCALE: 'onScale',
    TOGGLE_SHOW_ZONE: 'toggleShowZone',
    TOGGLE_SHOW_GRID: 'toggleShowGrid',
    RESET: 'onReset',
    TOGGLE_SHOW_DIE: 'toggleShowDie',
    CANCEL_SELECTED_DIE: 'onCancelDie',
    TRANSFORM: 'onTransform',
  };

  export default {
    name: 'BaseMap',
    components: {
      RulerBox,
      BaseDetail,
    },
    props: {
      mapProperty: {
        type: Object,
        required: false,
        default: () => ({})
      },
      /**
       * sourceAggregateData
       */
      sourceAggregateData: {
        type: Object,
        default: () => ({}),
      },
      sourceDefectData: {
        type: Array,
        default: () => [],
      },
      zoneAnalysisData: Array,
      mapOption: {
        required: false,
        type: Object,
        default: () => ({}),
      },
      componentData: {
        type: Object,
        default: () => ({}),
      },
      // die 上面显示信息
      showFields: {
        type: Array,
        default: () => [
          {
            display: 'Die_X',
            field: 'diex',
          },
          {
            display: 'Die_Y',
            field: 'diey',
          },
        ],
      },
      showDefectFields: {
        type: Array,
        default: () => {
          const fields = ['coorx',
            'coory',
            'diex',
            'diey',
            'defectCode',
            'defectSize',];

          return fields.map((name) => ({
            display: name.replace(/^(\w)/, (itm) => itm.toUpperCase()),
            field: name,
          }));
        },
      },
      showDieGrid: {
        type: Boolean,
        default: true,
      },
      // 是否可以框选
      canBoxChoose: {
        type: Number,
        default: 1, // 0不可以，1单次框选，2多次框选
      },
      // 是否可以单个选择
      canSingleChoose: {
        type: Boolean,
        default: true,
      },
      // 是否显示image defect 标记
      showDefectImg: {
        type: Boolean,
        default: true,
      },
      // 是否显示defect Die标记
      showDefectDie: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      this._watch = {
        detailVisiable: this.handleDetailVisiable,
        zoneVisible: this.handleZoneVisible,
        zoneAnalysisVisible: this.handleZoneAnalysisVisible,
      };

      this.id = `dmap${this.$lodash.uniqueId()}`;
      this.objDraw = null;
      this.ratio = 1;
      this.sourceDiameter = 0;
      this.diameter = 0;
      this.canvasRect = {};
      this.mouseEvent = null;

      return {
        showTool: false, // 操作当前map时显示工具栏
        drawing: false,
        // 是否显示详情
        showDetail: this.mapOption.detailVisiable,
        zoneVisible: this.mapOption.zoneVisible,
        showZoneAnalysis: this.mapOption.zoneAnalysisVisible,
        showSetting: true, // 是否显示形状设置

        enableOverlay: this.mapOption.enableOverlay,
        showGrid: this.showDieGrid,
        tips: {
          info: [],
          position: {
            left: '0px',
            top: '0px',
          },
          visiable: false,
        },
        isFull: false,
      };
    },

    computed: {
      mapBoxStyle() {
        let rightWidth = 0;
        if (this.showDetail) {
          rightWidth += 180;
        }
        if (this.zoneVisible) {
          rightWidth += 200;
        }

        if (rightWidth > 0) {
          if (this.$el && this.$el.getBoundingClientRect().width < rightWidth + 50) {
            // return {
            //   display: 'none',
            // }
          }
        }
        return {
          display: 'inline-block',
          width: rightWidth === 0 ? '100%' : `calc(100% - ${rightWidth}px)`
        };
      },
      fullClass() {
        return this.isFull ? 'full-view' : '';
      },
      transformStyle() {
        if (!this.mapOption.reverseDieX && !this.mapOption.reverseDieY) return;
        let scale = '';
        if (this.mapOption.reverseDieX && this.mapOption.reverseDieY) {
          scale = 'scale(-1, -1)';
        } else if (this.mapOption.reverseDieX) {
          scale = 'scale(-1, 1)';
        } else if (this.mapOption.reverseDieY) {
          scale = 'scale(1, -1)';
        }
        return {
          transform: scale,
        };
      },
      setting() {
        return this.showSetting
          ? ['circle', 'cross', 'ring', 'square', 'star', 'triangle', 'invertedTriangle'].map((val) => {
            const firstUp = val.replace(/^(\w)/, (item) => item.toUpperCase());
            return {
              value: val,
              label: firstUp,
              icon: `<svg style="height: 1em; width: 1em;fill: #f55858" aria-hidden="true" class="svg-icon"><use xlink:href="#icon-${val}"></use></svg> `,
            };
          }) : [];
      },
      ruler() {
        return this.mapProperty.posX ? (this.mapProperty.posX + this.mapProperty.posY) : 'RU';
      },
      defectCodes() {
        const dcodes = {};
        this.sourceDefectData.forEach(data => {
          data.defectCodes && data.defectCodes.forEach(item => {
            dcodes[item.defectCode] = item;
          });
        });
        return Array.from(Object.values(dcodes));
      },
      zoneAnalysis() {
        const field = this.sourceAggregateData.aggregateField;
        return this.mapOption.zoneAnalysis && this.mapOption.zoneAnalysis[field] || field;
      },
      aggregateField() {
        const field = this.sourceAggregateData.aggregateField;
        if (this.hasComponentData) {
          const series = this.componentData.option.series?.series?.find(item => item.name === field);
          if (series) {
            return series.aliasName || field;
          }
        }
        return field;
      },
      hasComponentData() {
        return !!(this.componentData && this.componentData.option);
      },
      componentMapOption() {
        return this.hasComponentData ? (this.componentData.option.mapOption || this.componentData.option.MapOption) : null;
      },
      componentDetailVisiable() {
        return (this.componentMapOption) ? this.componentMapOption.detailVisiable : null;
      },
      componentZoneVisible() {
        return (this.componentMapOption) ? this.componentMapOption.zoneVisible : null;
      },
      componentZoneAnalysisVisible() {
        return (this.componentMapOption) ? this.componentMapOption.zoneAnalysisVisible : null;
      },
      _isWaferMap() {
        return isWaferMap(this.mapOption.mapType);
      },
      mapTitle() {
        if (this._isWaferMap) {
          if (this.sourceAggregateData.splitField) {
            return this.sourceAggregateData.splitField
              .replace(this.sourceAggregateData.productId, '')
              .replace(/^_/, '');
          }
        } else if (this.sourceDefectData && this.sourceDefectData.length === 1) {
            const defectData = this.sourceDefectData[0];
            return defectData.splitField
              .replace(defectData.productId, '')
              .replace(/^_/, '');
          }
        return '';
      },
      // 是否需要zone分析
      visibleZoneAnalysis() {
        return this.mapOption.showZoneAnalysis !== false && (this._isWaferMap || (!this._isWaferMap && this.enableOverlay));
      },
    },

    watch: {
      isAggregateDataChange(val) {
        if (val) {
          this._debounceRedraw();
        }
      },
      showDieGrid: {
        handler(val) {
          if (val !== this.showGrid) {
            this.showGrid = val;
            this.emitShowGrid();
          }
        }
      },
      showDefectImg: {
        handler() {
          this.hideShowDefectImg();
        }
      },
      'mapOption.detailVisiable': {
        handler(val) {
          this._watch.detailVisiable(val);
        },
      },
      'mapOption.zoneVisible': {
        handler(val) {
          this._watch.zoneVisible(val);
        }
      },
      'mapOption.zoneAnalysisVisible': {
        handler(val) {
          this._watch.zoneAnalysisVisible(val);
        }
      },
      componentDetailVisiable: {
        handler(val) {
          this._watch.detailVisiable(val);
        },
      },
      componentZoneVisible: {
        handler(val) {
          this._watch.zoneVisible(val);
        }
      },
      componentZoneAnalysisVisible: {
        handler(val) {
          this._watch.zoneAnalysisVisible(val);
        }
      },
      showDefectDie: {
        handler() {
          this.hideShowDefectDie();
        }
      }
    },

    created() {
      this._debounceResize = this.$lodash.debounce((isFull) => {
        if (isFull || !this.changeTranslate()) {
          const { width, height } = this.$refs.container.getBoundingClientRect();
          this.scale = 1;
          this.$emit(emitType.RESIZE, { w: Math.floor(width), h: Math.floor(height) });
        } else {
          this.translateContainer();
        }
      }, 100);

      this._debounceRedraw = this.$lodash.debounce(() => {
        // this.startDraw();
      }, 100);
    },

    mounted() {
      this.addEvent();
    },

    activated() {
      // 页面还未加载完，查看其他页面，然后再回来时，页面的map没有，需要重新draw
    },

    deactivated() {
      this.hideDieInfo();
    },
    methods: {
      startDraw() {
        this.$emit('drawFinish');
      },
      changeTranslate(canvas) {
        canvas = canvas || this.$refs.canvas;
        const { width, height } = this.$refs.container.getBoundingClientRect();
        const min = Math.min(width, height);
        this.translateX = (width - canvas.width) / 2;
        this.translateY = (height - canvas.height) / 2;
        return this.diameter > min - 10 && this.diameter < min;
      },
      onlyTranslate() {
        this.changeTranslate();
        this.translateContainer();
      },
      getContainerPosition() {
        const $el = this.$refs.container;
        const {
          width,
          height,
          top,
          right,
          bottom,
          left
        } = $el.getBoundingClientRect();

        return {
          width,
          height,
          top,
          right,
          bottom,
          left,
          offsetLeft: $el.offsetLeft,
          offsetTop: $el.offsetTop,
        };
      },
      addEvent() {
        const $el = this.$refs.container;

        let isInit = false;

        this.emitZoom = (e) => {
          if (this.emitZoom.timeout) {
            clearTimeout(this.emitZoom.timeout);
          }
          this.emitZoom.timeout = setTimeout(() => {
            this.$emit(emitType.TRANSFORM, e.transform);
          }, 100);
        };

        const zoom = d3.zoom().filter(e => e.type !== 'wheel' && e.type !== 'dblclick')
          .on('start', () => {
            this.isZoom = true;
            this.showView = false;
          })
          .on('zoom', e => {
            if (isInit) {
              this.emitZoom(e);
            } else {
              isInit = true;
            }
          })
          .on('end', () => this.isZoom = false);

        const dc = d3.select($el);

        dc.call(zoom)
          .on('wheel', e => {
            e.preventDefault();
            const t = d3.zoomTransform($el);
            console.log(e.deltaY, e.deltaMode);
            t.k += (-e.deltaY * (e.deltaMode === 1 ? 0.01 : e.deltaMode ? 1 : 0.001) * (e.ctrlKey ? 10 : 1));
            if (t.k <= 0.1) {
              // t.k = 0.1;
            }
            zoom.transform(dc, t);
          })
          .on('click', e => {
            const mouse = { x: 0, y: 0 };
            const rect = $el.getBoundingClientRect();
            mouse.x = ((e.x - rect.x) / rect.width) * 2 - 1;
            mouse.y = -((e.y - rect.y) / rect.height) * 2 + 1;
            this.$emit(emitType.CLICK, mouse);
          })
          .on('contextmenu', e => e.returnValue = false)
          .on('mousemove', (e) => {
            if (!this.isZoom) {
              this.showView = false;
              const mouse = { x: 0, y: 0 };
              this.position = [e.x - 20, e.y + 10];
              if ($el) {
                const rect = $el.getBoundingClientRect();
                mouse.x = ((e.x - rect.x) / rect.width) * 2 - 1;
                mouse.y = -((e.y - rect.y) / rect.height) * 2 + 1;
                // worker.postMessage({ type: 'view', mouse: mouse, index: i})
              }
            }
          })
          .on('mouseout', () => {
            this.showView = false;
          });

        const { virtualDiameter } = this.mapProperty;

        const { width, height } = $el.getBoundingClientRect();
        const min = Math.min(width, height);

        const transform = d3.zoomTransform(0)
          // 填充{x, y}
          .scale(min / virtualDiameter);
        zoom.transform(dc, transform);
      },
      initZoom(zoom) {
        const $el = this.$refs.container;
        const dc = d3.select($el);

        const { virtualDiameter } = this.mapProperty;

        const { width, height } = $el.getBoundingClientRect();
        const min = Math.min(width, height);

        const transform = d3.zoomTransform(0)
          // 填充{x, y}
          .scale(min / virtualDiameter);
        zoom.transform(dc, transform);
      },
      removeEvent() {
        const { canvas, container: $el } = this.$refs;

        canvas.removeEventListener('mousedown', this.handleMousedown);
        canvas.removeEventListener('mousemove', this.handleMousemove);
        canvas.removeEventListener('mouseup', this.handleMouseup(e)); h;
        canvas.removeEventListener('click', this.handleClick);
        canvas.removeEventListener('mousewheel', this.handleMousewheel);

        $el.removeEventListener('scroll', this.handleScroll);
        $el.removeEventListener('mouseleave', this.handleMouseLeave);
      },
      cloneEvent(e) {
        const { left, top } = this.canvasRect;
        return {
          cancelable: e.cancelable,
          pointerId: e.pointerId,
          width: e.width,
          height: e.height,
          isPrimary: e.isPrimary,
          pointerType: e.pointerType,
          pressure: e.pressure,
          tangentialPressure: e.tangentialPressure,
          tiltX: e.tiltX,
          tiltY: e.tiltY,
          twist: e.twist,
          isTrusted: e.isTrusted,
          type: e.type,
          altKey: e.altKey,
          button: e.button,
          buttons: e.buttons,
          clientX: e.clientX - left, // account for $canvas' offset
          clientY: e.clientY - top,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          movementX: e.movementX,
          movementY: e.movementY,
          pageX: e.pageX,
          pageY: e.pageY,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          screenX: e.screenX,
          screenY: e.screenY,
          deltaX: e.deltaX,
          deltaY: e.deltaY,
          nativeEvent: {},
        };
      },
      handleFullScreen() {
        this.drawing = true;
        this.isFull = !this.isFull;
        let layoutParent = null;
        let parent = this.$parent;
        let w = 4;
        while (w > 0 && parent) {
          if (parent.$options._componentTag === 'FlowLayout') {
            layoutParent = parent;
            break;
          }
          parent = parent.$parent;
          w--;
        }
        if (layoutParent) {
          if (this.isFull) {
            layoutParent.$el.classList.add('map-full');
          } else {
            layoutParent.$el.classList.remove('map-full');
          }
        }
        this.handleResize(true);
      },
      handleDetailVisiable(val) {
        if (val != this.showDetail) {
          this.showDetail = val;
          this.handleResize();
        }
      },
      getDrawOption() {
        const { container } = this.$refs;
        if (!container) return;
        return {
          instance: this,
          ...this.$data,
          ...this.$props,
          $el: container,
        };
      },
      /**
       * 取消选择的die
       */
      clearSelectedDie() {
        this.$emit(emitType.CANCEL_SELECTED_DIE);
      },
      handleReverseAggColor(data) {
        this.$emit('onReverseAggColor', data, this.componentData);
      },
      handleZoneVisible(val) {
        if (val !== this.zoneVisible) {
          this.toggleShowZone();
        }
      },
      handleZoneAnalysisVisible(val) {
        if (val !== this.showZoneAnalysis) {
          this.showZoneAnalysis = val;
          this._debounceResize();
        }
      },
      handleEnterMap() {
        this.showTool = true;
      },
      handleLeaveMap() {
        this.showTool = false;
        this.hideDieInfo();
      },
      hideDieInfo() {
        this.$mapTip.close();
      },
      mousemoveInfo(info) {
        if (info && this.mouseEvent) {
          const { type, data } = info;
          const showFields = type === 'die' ? this.showFields : this.showDefectFields;
          this.showDieInfo({ rectData: data, showFields, e: this.mouseEvent });
        } else {
          this.hideDieInfo();
        }
      },
      showDieInfo({ rectData, showFields, e }) {
        showFields = showFields || this.showFields;
        if (!showFields?.length || !rectData) return;

        const tspans = showFields.map(f => {
          const v = rectData[f.field] ?? '';
          return `${f.display}: ${v}`;
        });

        this.$mapTip({
          tips: tspans,
          position: {
            left: e.pageX,
            top: e.pageY,
          }
        });
      },
      /**
       * 计算 container size ,据此
       */
      drawMapWidthSize() {
        new Promise((resolve, reject) => {
          this.$lodash.debounce(this.startDraw, 1)();
        });
      },
      hideShowDefectImg() {

      },
      /**
       * 根据 showZone 重新绘制 zone
       */
      redrawZone() {

      },
      /**
       * 打开详情面板
       */
      openDetail() {
        this.showDetail = !this.showDetail;
        this.$set(this.mapOption, 'detailVisiable', this.showDetail);
        this.$emit('onShowDetail', this.showDetail);
        this.handleResize();
      },
      toggleShowZone() {
        this.zoneVisible = !this.zoneVisible;
        this.$set(this.mapOption, 'zoneVisible', this.zoneVisible);
        this.$emit(emitType.TOGGLE_SHOW_ZONE, this.zoneVisible);
      },
      toggleShowZoneAnalysis() {
        this.showZoneAnalysis = !this.showZoneAnalysis;
        this.$set(this.mapOption, 'zoneAnalysisVisible', this.showZoneAnalysis);
        if (this.componentMapOption) {
          this.$set(this.componentMapOption, 'zoneAnalysisVisible', this.showZoneAnalysis);
        }
        this.$emit(
          'toggleShowZoneAnalysis',
          this.showZoneAnalysis,
          this.componentData
        );
        if (this.showZoneAnalysis && !this.zoneAnalysisData?.length) {
          const aggregateField = this.zoneAnalysis;
          const arr = aggregateField.split('(');
          const data = {
            valueField: arr[1].substring(0, arr[1].length - 1),
            aggregateType: arr[0],
            aggregateField,
          };
          this.getZoneAnalysis(data);
        }
        this.handleResize();
      },
      handleResize(isFull) {
        const { zoneChart } = this.$refs;
        zoneChart && zoneChart.handleResize();
        this.$nextTick(() => {
          this.onlyTranslate();
          this._debounceResize(isFull);
        });
      },
      /**
       * 进行 zone 分析
       */
      getZoneAnalysis(data) {
        this.$emit('getZoneAnalysis', data, this.componentData);
      },
      onSelectShape(val) {
        this.defectMapShape = val;
      },
      // 选择defectCode
      onSelectDefectCode(vals) {
        this.defectMapData = this.sourceDefectData.map((zData) => {
          const data = zData.data.filter((item) => vals.findIndex(v => item.defectCode == v) !== -1);
          return {
            ...zData,
            data
          };
        });
        this.$emit('onSelectDefectCode', vals);
      },

      emitShowGrid() {
        this.$emit(emitType.TOGGLE_SHOW_GRID, this.showGrid);
      },
      /**
       * 是否显示网格
       */
      toggleShowGrid() {
        this.showGrid = !this.showGrid;
        this.emitShowGrid();
      },
      /**
       * 显示被隐藏的die
       */
      showHidedDie() {
        this.$emit(emitType.TOGGLE_SHOW_DIE, true);
      },
      /**
       * 隐藏选择的die
       */
      hideDie() {
        this.$emit(emitType.TOGGLE_SHOW_DIE, false);
      },
      hideShowDefectDie() {

      },
      destroy() {
      },
      handleReset() {
        this.drawing = true;
        this.$emit(emitType.RESET);
      },
    },
    beforeDestroy() {
      this.destroy();
    }
  };
</script>

<style lang="less" scoped>
  .wafer-map {
    display: flex;
    flex: 1;
    padding: 5px;

    section {
      flex: 1;
    }

    .tool-box {
      i,svg {
        cursor: pointer;
      }

      .inline-block {
        margin-left: 10px;
      }
    }
  }

  .footer-left {
    display: flex;
    align-content: center;
    align-items: center;
  }
  .detail-box {
    max-width: 180px;
    height: calc(100% - 5px);
    overflow: auto;
    background-color: #ffffff;
  }

  .zone-analysis {
    max-width: 40%;
  }

  .map-box-header, .map-box-footer {
    position: relative;
    height: 30px;
    display: flex;
    justify-content: space-between;
    z-index: 2;
    align-items: center;
    align-content: center;
  }

  .map-box-main {
    height: calc(100% - 60px);
    position: relative;
    overflow: hidden;
  }

  @border: 1px solid #ccc;
  .svg-icon {
    fill: #1296db;
  }
  .not-show {
    fill: #c0c0c0;
    color: #c0c0c0;
  }
</style>
