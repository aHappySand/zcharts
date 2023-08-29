import {
  RenderManager,
  SceneManager,
} from './chart.draw.js';

const VIRTUAL_DIAMETER = 1000;


function Container({ gridData, props }) {
  this.gridData = gridData;

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
    // postMsg({ type: 'drawed'});
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
    scale: 1,
    scene: null,
    data: {},
  };

  options = Object.assign({}, defaultOpt, options);
  for (const key in options) {
    this[key] = options[key];
  }
  this.setOtherProperty();
  this.init();
  this.parseOption();
}

GridManager.prototype = {
  createScene(position) {
    if (!this.scene) {
      const { render } = this.container;

      this.scene = new SceneManager({
        position,
        option: this.chartOption,
        render,
        virtualDiameter: VIRTUAL_DIAMETER,
      });
    } else {
      this.scene.position = position;
      this.scene.updateCamera();
    }
    return this;
  },
  parseOption() {
    function random(len) {
      return Math.floor(Math.random() * len);
    }
    const sourceData = [];
    const xAxis = (new Array(21)).fill('').map((v, i) => `中文x${i}`);
    const xLen = xAxis.length - 1;
    const yAxis = [];
    // for (let i = 0; i <= xLen; i++) {
    //   const yv = i * 10;
    //   yAxis[i] = yv;
    //   sourceData[i] = [xAxis[i], yv];
    // }
    console.log(sourceData);
    for (let i = 0; i < 1000; i++) {
      const yv = Math.random() * 1000;
      yAxis[i] = yv;
      sourceData[i] = [xAxis[random(xLen)], yv];
    }


    const xAxisData = [{ data: xAxis.map(v => ({ name: v })) }];
    const yAxisData = [[{ data: yAxis }]];
    this.chartOption = {
      series: [{
        data: sourceData,
      }],
      yAxisData,
      xAxisData
    };
  },
  init() {

  },
  setOtherProperty() {

  },
  directDraw() {
    console.time('draw');
    this.scene.drawXAxis(this.chartOption.xAxisData);
    this.scene.drawYAxis(this.chartOption.yAxisData);
    this.scene.drawPoint(this.chartOption);
    console.timeEnd('draw');
  },

  toJson() {
    const data = {
      option: this.data.option,
    };

    return {
      id: this.id,
      index: this.index,
      key: this.data.key,
      data,
    };
  },
};


export default function () {
  return {
    /**
     * @param container {Container}
     */
    container: null,
    init(e) {
      const { data, props } = e.data;
      this.container = new Container({ gridData: data, props });
      // postMsg({ type: 'init', data: this.container.toJson() });
      return this;
    },

    draw(e) {
      this.container.directDraw(e.data);
    },

    getList() {
      return { type: 'init', data: this.container.toJson() };
    },
  };
}
