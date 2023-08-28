import { flowMap } from './map.init.js';

import {
  RenderManager,
  SceneManager,
} from './map.draw.js';

const postMsg = self.postMessage;
const VIRTUAL_DIAMETER = 1000;


function Container({
 gridData, props, mapOption, statsStyle, products
}) {
  this.baseDie = products;
  this.gridData = gridData;
  this.mapOption = mapOption;
  this.statsStyle = statsStyle;

  this.setProps(props);

  this.render = new RenderManager(this.props.canvas);
  this.splitCanvas(gridData);

  Object.defineProperty(this, 'inited', {
    get() {
      return true;
    }
  });
}

Container.prototype = {
  setProps(props) {
    const defaultOptions = {
      dieColor: '#ffffff00',
      crossDieColor: '#7FDDFF82', // '#7FDDFF82'
      circleColor: '#eaeaea', // '#eaeaea'  圆的颜色
      dieBorderColor: '#252323', // '#f0f0f0' die边框的颜色
      selectedColor: '#ffff00', // 选中时的颜色
      zoneBorderColor: '#000000', //
      circleStroke: 1,
      zoneStroke: 1,
      dieStroke: 1,
      defectMapShape: 'cross',
      defectSize: 2,
      row: 1,
      col: 1,
      page: 1,
      canBoxChoose: 1, // 0不可以，1单次框选，2多次框选
      canSingleChoose: true,
    };
    this.props = Object.assign(this.props || {}, defaultOptions, props);
  },
  get row() {
    return this.props.row;
  },
  get col() {
    return this.props.col;
  },
  get width() {
    return this.props.width;
  },
  get height() {
    return this.props.height - (this.gridData.length > 1 ? 32 : 0);
  },
  get page() {
    return this.props.page;
  },
  get preNum() {
    return (this.page - 1) * this.gridSize;
  },
  get gridSize() {
    return this.row * this.col;
  },
  splitCanvas(gridData) {
    const total = gridData.length;
    const pageNum = Math.ceil(total / this.gridSize);
    const grid = [];
    for_one:
      for (let p = 1; p <= pageNum; p++) {
        for (let r = 0; r < this.row; r++) {
          for (let c = 0; c < this.col; c++) {
            const index = (p - 1) * this.gridSize + r * this.row + c;
            const gData = gridData[index];
            if (gData) {
              const { productId } = gData;

              if (!this.baseDie[productId].layer) {
                const { mapProperty } = this.baseDie[productId];
                mapProperty.virtualDiameter = VIRTUAL_DIAMETER;

                this.baseDie[productId].layer = this.render.drawLayer({
                  virtualDiameter: VIRTUAL_DIAMETER,
                  circleColor: this.props.circleColor,
                  dieHeight: mapProperty.dieH,
                  dieWidth: mapProperty.dieW,
                });
              }
              const objGrid = new GridManager({
                index,
                container: this,
                data: gData,
              });
              grid.push(objGrid);
            } else {
              break for_one;
            }
          }
        }
      }
    this.grid = grid;
    return this;
  },
  toJson() {
    return {
      split: (this.grid || []).map(gManager => gManager.toJson()),
      mapOption: this.mapOption,
      statsStyle: this.statsStyle,
    };
  },
  getDieBorderOption(productId) {
    const { diameter, baseDie, props } = this;
    const baseInfo = baseDie[productId];
    if (!baseInfo) {
      throw new Error('初始化失败，未找到底图信息');
    }
    const { die, property: { diameter: mapDiameter, dieWidth, dieHeight } } = baseInfo;
    const ratio = diameter / mapDiameter;
    return {
      diameter,
      dieWidth: dieWidth * ratio,
      dieHeight: dieHeight * ratio,
      baseData: baseDie[productId].die,
      ratio,
      dieBorderColor: props.dieBorderColor,
      showDieGrid: props.showDieGrid,
    };
  },
  directDraw({ items }) {
    const scenes = [];
    items.forEach(({ position, index }) => {
      const grid = this.grid[index];
      grid.createScene(position);
      grid.directDraw();
      scenes.push(grid.scene);
    });
    this.render.render(scenes);
    postMsg({ type: 'drawed' });
  },
  directDrawCurrent() {
    const size = this.row * this.col;
    const start = (this.page - 1) * size;
    const scenes = [];

    for (let i = start, last = this.page * size; i < last; i++) {
      const grid = this.grid[i];
      if (grid) {
        scenes.push(grid.scene);
      } else {
        break;
      }
    }
    scenes.length && this.render.render(scenes);
  },
  onlyPost() {
    const size = this.row * this.col;
    const start = (this.page - 1) * size;
    for (let i = start, last = this.page * size; i < last; i++) {
      const grid = this.grid[i];
      grid.postImg();
    }
  },

  /**
   * 根据事件获取操作的对应grid
   * @param event
   * @returns {{leftX: number, topY: number, index: number}}
   */
  findGrid(event) {
    const { clientX, clientY } = event;
    const c = Math.floor(clientX / this.w);
    const r = Math.floor(clientY / this.h);
    const { col } = this.props;

    const index = this.preNum + r * col + c;

    const grid = this.grid[index];

    if (grid) {
      return {
        event,
        grid,
        index,
        leftX: clientX - grid.leftX,
        topY: clientY - grid.topY,
      };
    }
  },
  getGridByIndex(index) {
    return this.grid[index];
  },
};

/**
 * 每个grid的管理
 * @param options
 * @constructor
 */
let gridId = 0;
function GridManager(options) {
  const defaultOpt = {
    id: gridId++,
    leftX: 0,
    topY: 0,
    scale: 1,
    scene: null,
    data: {},
    translateX: 0,
    translateY: 0,
    selectedDie: Object.create(null),
    selectedArea: Object.create(null),
    areaIndex: -1,
    bitmap: Object.create(null), // die, defect, layer?, dieBorder?, selectedDie, area, zone
    showDieGrid: true,
    showDefectImg: true, // 是否显示image defect 标记
    showDefectDie: false, // 是否显示defect Die标记
    showSelectedDie: true, // 显示选中的die
  };

  options = Object.assign({}, defaultOpt, options);
  for (const key in options) {
    this[key] = options[key];
  }
  this.setOtherProperty();
}

GridManager.prototype = {
  createScene(position) {
    if (!this.scene) {
      const { render } = this.container;
      this.scene = new SceneManager({
        position,
        mapProperty: this.mapProperty,
        render
      });
    } else {
      this.scene.position = position;
      this.scene.updateCamera();
    }
    return this;
  },
  get mapProperty() {
    return this.container.baseDie[this.data.productId].mapProperty;
  },
  setOtherProperty() {

  },
  directDraw() {
    this.scene.drawTest();
    // this.directDrawBase(true);
    // this.directDrawDie();
    // this.directDrawDefect();
    // this.directDrawSelectedDie();
    // this.directDrawArea();
    // this.directDrawZone();
  },

  directDrawDie() {
    const {
 data: {
      aggregateData,
    }
} = this;
    const { baseData } = this.container.baseDie[this.data.productId];
    const opt2 = {
      baseData,
      aggregateData,
    };
    this.scene.drawDie(opt2);
  },
  directDrawDefect() {
    const {
 data: {
      defectData,
    }
} = this;

    const opt3 = {
      defectData,
    };
    this.scene.drawDefect(opt3);
  },
  directDrawBase(redraw = false) {
    if (redraw) {
      const { productId } = this.data;
      const { baseDie } = this.container;
      this.scene.drawLayer(baseDie[productId].layer);

      this.directDrawDieBorder();
    }
    return this;
  },
  directDrawDieBorder() {
    const { productId } = this.data;
    const { baseDie } = this.container;
    const borderData = baseDie[productId].dieBorderData;
    const { props: { dieBorderColor, showDieGrid } } = this.container;

    this.scene.drawDieBorder({ borderData, dieBorderColor });
  },

  directDrawSelectedDie() {
    const hasSelected = this.hasSelectedDie();
    const {
 diameter, dieHeight, dieWidth, selectedDie, ratio, showSelectedDie
} = this;

    if (hasSelected) {
      const { props: { selectedColor } } = this.container;
      // const area = toImageBitMap(draw({
      //   type: 'selectedDie',
      //   options: {
      //     diameter,
      //     dieWidth,
      //     dieHeight,
      //     selectedDie,
      //     ratio,
      //     selectedColor,
      //     showSelectedDie,
      //   }
      // }));
      // this.bitmap.selectedDie = area;
    } else {
      this.bitmap.selectedDie = null;
    }
    return this;
  },
  directDrawArea(areas) {
    const { selectedArea, ratio, diameter } = this;
    areas = areas || selectedArea;
    let hasArea = false;
    for (const id in areas) {
      hasArea = true;
      break;
    }
    if (hasArea) {
      // const area = toImageBitMap(draw({
      //   type: 'area',
      //   options: {
      //     selectedArea: areas,
      //     ratio,
      //     diameter
      //   }
      // }));
      // this.bitmap.area = area;
      return this;
    }
    this.bitmap.area = null;
    return this;
  },
  directDrawZone() {
    const {
 diameter, dieWidth, dieHeight, ratio, data: { zoneBorderDies }
} = this;
    const { props: { zoneBorderColor }, mapOption: { zoneVisible, showZone } } = this.container;
    if (showZone && zoneBorderDies.length) {
      const opt = {
        zoneBorderDies,
        diameter,
        zoneBorderColor,
        dieWidth,
        dieHeight,
        ratio,
        zoneVisible,
      };

      // const zone = toImageBitMap(draw({
      //   type: 'zone',
      //   options: opt
      // }));
      // this.bitmap.zone = zone;
      return this;
    }
    this.bitmap.zone = null;
    return this;
  },
  hasSelectedDie() {
    let hasSelected = false;
    for (const id in this.selectedDie) {
      hasSelected = true;
      break;
    }
    return hasSelected;
  },
  /**
   * 合并各层
   */
  stackLayer() {

  },
  /**
   * post 最终的map图，附带其他要传递的信息
   * @param other
   */
  postImg(other) {
    other = other || {};
    postMsg({
      type: 'draw',
      index: this.index,
      property: {
        type: this.type,
        ...other,
      }
    });
  },
  toJson() {
    const defectData = this.data.defectData.map(item => ({ ...item, data: [] }));

    const data = {
      aggregateData: {
        colorGroupShow: this.data.aggregateData.colorGroupShow || [],
        aggregateField: this.data.aggregateData.aggregateField,
      },
      defectData,
      mapProperty: this.mapProperty,
      showDefectFields: this.data.showDefectFields,
      showWaferFields: this.data.showWaferFields,
      splitField: this.data.splitField,
      statInfo: this.data.statInfo,
      zoneAnalysisData: this.data.zoneAnalysisData,
    };

    return {
      id: this.id,
      index: this.index,
      key: this.data.key,
      data,
      style: this.style,
    };
  },
  getDrawOption() {
    const { props } = this.container;
    return {
      ...props,
      diameter: this.diameter,
      dieWidth: this.dieWidth,
      dieHeight: this.dieHeight,
      ratio: this.ratio,
      selectedDie: this.selectedDie,
      pxDieData: this.pxDieData,
      pxDefectData: this.pxDefectData,
    };
  },
  resize(props) {
    this.w = props.w;
    this.h = props.h;
    this.diameter = Math.min(props.w, props.h);
    this.sourceDiameter = this.diameter;

    this.setProperty();
    this.directDrawBase(true);
    this.directDraw();
    this.postImg();
  },
  scaleMap(props) {
    this.diameter = props.diameter;
    this.setProperty();

    this.directDrawBase(true);
    this.directDraw();
    this.postImg();
  },
  findDie(id) {
    const { baseData } = this.data;
    for (const zoneId in baseData) {
      if (baseData[zoneId][id]) return baseData[zoneId][id];
    }
  },
  findDieInfo(diex, diey) {
    const id = diey === undefined ? diex : `${diex}_${diey}`;
    const die = this.findDie(id);
    if (die) {
      const { aggregateData } = this.data;
      const agg = aggregateData.data[id] || {};
      return {
        ...die,
        ...agg,
      };
    }
    return die;
  },

  handleShowInfo(event) {
    const { offsetX: x, offsetY: y } = event;
    const index = y * this.width3 + x * 3;
    let index0 = this.pxDefectData[index];
    let data = null;
    if (index0) {
      const index1 = this.pxDefectData[index + 1];
      const index2 = this.pxDefectData[index + 2];
      const { defectData } = this.data;
      for (let i = 0, len = defectData.length; i < len; i++) {
        const itm = defectData[i].data[index1];
        if (itm) {
          data = {
            type: 'defect',
            data: itm,
          };
          break;
        }
      }
    } else {
      index0 = this.pxDieData[index];
      const index1 = this.pxDieData[index + 1];
      const index2 = this.pxDieData[index + 2];
      if (index0) {
        data = {
          type: 'die',
          data: this.findDieInfo(index1, index2),
        };
      }
    }

    postMsg({
      type: 'mousemoveInfo',
      index: this.index,
      data,
    });
  },

  isClickArea(x, y) {
    let isArea = false;
    const { selectedArea, ratio, selectedDie } = this;
    for (const i in selectedArea) {
      let {
 startX, startY, endX, endY
} = selectedArea[i];
      startX *= ratio;
      startY *= ratio;
      endX *= ratio;
      endY *= ratio;

      if (x >= startX && x <= endX && y >= startY && y <= endY) {
        const { dies } = selectedArea[i];
        if (dies) {
          dies.forEach(id => delete selectedDie[id]);
        }
        delete selectedArea[i];
        isArea = true;
      }
    }
    return isArea;
  },

  redrawForSelect() {
    this.directDrawSelectedDie();
    this.directDrawArea();
    this.postImg({
      selectedArea: this.selectedArea,
      selectedDie: this.selectedDie
    });
  },
  handleClick(event) {
    return;
    const { offsetX: x, offsetY: y } = event;

    // 点击在 框选框上
    if (this.isClickArea(x, y)) {
      this.redrawForSelect();
      return;
    }

    const { pxDieData, pxDefectData, width3 } = this;
    const index = y * width3 + x * 3;
    let index0 = pxDefectData[index];
    // 点击到defect上
    if (index0) {

    } else {
      index0 = pxDieData[index];
      // 点击在die上
      if (index0) {
        const index1 = pxDieData[index + 1];
        const index2 = pxDieData[index + 2];
        const id = `${index1}_${index2}`;
        const data = this.findDieInfo(index1, index2);
        if (data) {
          const { canSingleChoose } = this.container.props;
          // 可以选择
          if (canSingleChoose) {
            // ctrl 可以多选
            const isSingle = !event.ctrlKey;
            if (this.selectedDie[id]) {
              delete this.selectedDie[id];
            } else {
              if (isSingle) {
                this.selectedDie = Object.create(null);
              }
              this.selectedDie[id] = data;
            }
            if (isSingle) {
              this.selectedArea = Object.create(null);
              this.directDrawArea();
            }
            this.directDrawSelectedDie();
            this.postImg({ selectedDie: this.selectedDie });
          }
        }
      }
    }
  },
  handleSelectArea(area) {
    const { props: { canBoxChoose } } = this.container;
    this.areaIndex++;
    const temp = Object.create(null);

    if (canBoxChoose === 2) {
      for (const id in this.selectedArea) {
        temp[id] = this.selectedArea[id];
      }
    }
    temp[this.areaIndex] = area;
    this.directDrawArea(temp);
    this.postImg();
  },
  findDieDefectInArea(area, isAdd = true) {
    const { ratio, width3, pxDieData } = this;
    const dieIds = new Set();
    const selectArea = area || this.selectedArea;
    for (const i in selectArea) {
      let {
 startX, startY, endX, endY
} = selectArea[i];
      startX *= ratio;
      startY *= ratio;
      endX *= ratio;
      endY *= ratio;
      const temp = new Set();

      for (let y = Math.ceil(startY); y <= endY; y++) {
        const y3 = y * width3;
        for (let x = Math.ceil(startX); x <= endX; x++) {
          const index = y3 + x * 3;
          const index0 = pxDieData[index];
          if (index0) {
            temp.add(`${pxDieData[index + 1]}_${pxDieData[index + 2]}`);
          }
        }
      }

      this.selectedArea[i].dies = temp;
      temp.forEach(id => dieIds.add(id));
    }
    dieIds.forEach(id => {
      const data = this.findDieInfo(id);
      if (data) {
        if (isAdd) {
          this.selectedDie[id] = data;
        } else {
          delete this.selectedDie[id];
        }
      }
    });

    return {
      dieIds,
    };
  },
  handleSelectAreaEnd(area) {
    const { props: { canBoxChoose } } = this.container;
    this.areaIndex++;

    if (canBoxChoose === 1) {
      this.selectedDie = Object.create(null);
      this.selectedArea = Object.create(null);
    }
    this.selectedArea[this.areaIndex] = area;
    this.findDieDefectInArea({ [this.areaIndex]: area });
    this.directDrawSelectedDie();
    this.postImg({
      selectedArea: this.selectedArea,
      selectedDie: this.selectedDie
    });
  },
  handleShowZone(show) {
    this.container.mapOption.zoneVisible = show;
    this.directDrawZone();
    this.postImg();
  },
  handleShowGrid(show) {
    this.showDieGrid = show;
    this.postImg();
  },
  handleReset() {
    this.diameter = this.sourceDiameter;
    this.setProperty();
    this.directDrawBase(true);
    this.directDraw();
    this.postImg();
  },
  handleShowDie(show) {
    if (this.showSelectedDie === true && show === true) return;
    this.showSelectedDie = show;
    this.directDrawSelectedDie();
    this.postImg();
  },
  cancelSelectedDie() {
    this.showSelectedDie = true;
    const has = this.hasSelectedDie();
    if (has) {
      this.selectedDie = Object.create(null);
      this.selectedArea = Object.create(null);
      this.directDrawSelectedDie();
      this.directDrawArea();
      this.postImg({ selectedDie: this.selectedDie });
    }
  }
};


export default function () {
  return {
    /**
     * Container
     */
    container: null,
    init(e) {
      const { sourceData, mapOption } = e.data;

      mapOption.sceneSize = VIRTUAL_DIAMETER;
      const objMap = flowMap(sourceData, mapOption);
      console.time('init');
      objMap.randomDefectData(1000);
      console.timeEnd('init');

      const {
 grid, mapOption: option, statsStyle, products
} = objMap.getGridData();
      this.container = new Container({
 gridData: grid, props: e.data.props, mapOption: option, statsStyle, products
});
      postMsg({ type: 'init', data: this.container.toJson() });
      return this;
    },

    draw(e) {
      console.time('draw');
      this.container.directDraw(e.data);
      console.timeEnd('draw');
    },
    getGrid(e) {
      const { index, type } = e.data;
      const grid = this.container.getGridByIndex(index);
      grid.type = type;
      return grid;
    },
    singleResize(e) {
      const { props } = e.data;
      const grid = this.getGrid(e);
      grid.resize(props);
    },

    paging(e) {
      this.container.page = e.data.page;
      this.container.directDraw();
    },

    mousemoveInfo(e) {
      const { event } = e.data;
      const grid = this.getGrid(e);
      grid.handleShowInfo(event);
    },

    scale(e) {
      console.time('scale');
      const { props } = e.data;
      const grid = this.getGrid(e);
      grid.scaleMap(props);
      console.timeEnd('scale');
    },

    click(e) {
      const { event } = e.data;
      const grid = this.getGrid(e);
      grid.handleClick(event);
    },

    selectArea(e) {
      const { area } = e.data;
      const grid = this.getGrid(e);
      grid.handleSelectArea(area);
    },

    selectAreaEnd(e) {
      const { area } = e.data;
      const grid = this.getGrid(e);
      grid.handleSelectAreaEnd(area);
    },

    toggleShowZone(e) {
      const { show } = e.data;
      const grid = this.getGrid(e);
      grid.handleShowZone(show);
    },

    toggleShowGrid(e) {
      const { show } = e.data;
      const grid = this.getGrid(e);
      grid.handleShowGrid(show);
    },

    reset(e) {
      const grid = this.getGrid(e);
      grid.handleReset();
    },

    toggleShowDie(e) {
      const { show } = e.data;
      const grid = this.getGrid(e);
      grid.handleShowDie(show);
    },

    cancelDie(e) {
      const grid = this.getGrid(e);
      grid.cancelSelectedDie();
    },

    transform(e) {
      const { transform } = e.data;
      const grid = this.getGrid(e);
      grid.scene.handleTransform(transform);
      grid.container.directDrawCurrent();
    }
  };
}
