import * as THREE from 'three';
import { OrbitControls } from '../../../../src/plugins/OrbitControls.js';

import { drawText, distoryObject } from './index';

export class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }

  pick(normalizedPosition, objects, camera) {
    this.pickedObject = null;
    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);

    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(objects, true);

    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0];// .object
    }
  }

  rebackHex() {
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
    }
  }

  setHex(color) {
    color = color || 0xFFFF00;
    this.pickedObject.material.emissive.setHex(color);
  }
}

export function RenderManager(canvas) {
  this.canvas = canvas;
  this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  this.renderer.autoClear = false;
  this.renderer.localClippingEnabled = true;
  // this.renderer.setPixelRatio(1.25);

  this.pickHelper = new PickHelper();
  this.scenes = [];
}

RenderManager.prototype = {
  updateSize() {
    const { width } = this.canvas;
    const { height } = this.canvas;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.renderer.setSize(width, height, false);
    }
  },

  render(scenes) {
    scenes = scenes || this.scenes;
    this.updateSize();
    const { renderer } = this;
    renderer.setClearColor(0xffffff);
    renderer.setScissorTest(false);
    renderer.clear();

    renderer.setClearColor(0xe0e0e0, 0);
    renderer.setScissorTest(true);

    const renderHeight = renderer.domElement.height;

    scenes.forEach((scene) => {
      const rect = scene.position;
      // set the viewport
      const width = rect.right - rect.left;
      const height = rect.bottom - rect.top;

      /**
       * 左下角为起点
       */
      const left = rect.offsetLeft;
      const bottom = renderHeight - rect.offsetTop - height;

      renderer.setViewport(left, bottom, width, height);
      renderer.setScissor(left, bottom, width, height);

      renderer.render(scene.scene, scene.camera);
      renderer.render(scene.pointScene, scene.pointCamera);
    });
    this.scenes = scenes;
  },
};


/**
 * @param position { left, right, bottom, top, width, height }
 * @param render { RenderManager }
 * @param option {  }
 * @param virtualDiameter {number}
 * @constructor
 */
export function SceneManager({
 position, render, option, virtualDiameter
}) {
  this.position = position;
  this.option = option;
  this.virtualDiameter = virtualDiameter;
  this.render = render;
  this.scene = new THREE.Scene();

  this.pointScene = new THREE.Scene();

  this.axisLineMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color('#3d3d3d'),
    fog: false,
  });
  this.pointMesh = Object.create(null);
  this.addCamera(position, virtualDiameter);
}

SceneManager.prototype = {
  addCamera(position, virtualDiameter) {
    this.camera = new THREE.OrthographicCamera(-position.width / 2, position.width / 2, position.height / 2, -position.height / 2, 1, virtualDiameter);
    // this.camera = new THREE.PerspectiveCamera( 50, 1, 1, 1000 );
    this.camera.position.z = virtualDiameter;

    this.pointCamera = new THREE.OrthographicCamera(-position.width / 2, position.width / 2, position.height / 2, -position.height / 2, 1, virtualDiameter);
    this.pointCamera.position.z = virtualDiameter;

    // this.handleTransform({k: 0.36, x: 0, y: 0});

    if (position.target) {
      this.controls = new OrbitControls(this.pointCamera, position.target);
      this.controls.enableRotate = false; // 禁止旋转
      this.controls.translateType = 'xy';
      this.controls.isRightBtnMove = false;
      // this.controls.enablePan = false; //禁止右键拖拽
      this.controls.minZoom = 1;

      // this.controls.zoomToCursor = true;
      const { pickHelper } = this.render;

      position.target.addEventListener('mousemove', (e) => {
        const rect = position.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const w = rect.width;
        const h = rect.height;
        const mouse = {};
        mouse.x = (x / w) * 2 - 1;
        mouse.y = -(y / h) * 2 + 1;

        pickHelper.pick(mouse, this.pointScene.children, this.pointCamera);
        if (pickHelper.pickedObject) {
          this.handleMousemovePoint(pickHelper.pickedObject);
        }
      });


      this.controls.addEventListener('change', (e) => {
        this.checkOrbitControls(e.target);

        this.controls.target.set(0, 0, 0);
        this.pointCamera.position.set(0, 0, 0);

        this.render.render();
      });
    }

    this.drawCover({});
  },
  // 处理鼠标划过
  handleMousemovePoint(pickedObject) {
    console.log(pickedObject);
    if (pickedObject.object instanceof THREE.InstancedMesh) {
      const { type } = pickedObject.object.userData;

      if (type === 'series') {
        console.log(pickedObject.object.userData, pickedObject.instanceId);
      }
    }
  },
  updateCamera() {
    const { width, height } = this.position;
    const halfW = width / 2;
    const halfH = height / 2;
    this.camera.left = -halfW;
    this.camera.right = halfW;

    this.camera.bottom = -halfH;
    this.camera.top = halfH;

    this.camera.updateProjectionMatrix();
  },
  handleTransform(transform) {
    const { camera, render } = this;
    camera.zoom = transform.k;
    camera.position.x = -transform.x / camera.zoom;
    camera.position.y = transform.y / camera.zoom;
    camera.updateProjectionMatrix();
    return this;
  },

  reRender() {
    this.render.renderer.render(this.scene, this.camera);
  },
  /**
   * 将数据转换为坐标
   */
  init() {

  },
  checkOrbitControls(orbit) {
    const { zoom } = orbit.object;

    const { width, height } = this.position;
    const halfWidth = width / 2;
    const halfHeight = height / 2;


    const maxLeftOffset = 40;
    const maxRightOffset = 40;
    const maxTopOffset = 40;
    const maxBottomOffset = 30;

    const maxZLeftOffset = maxLeftOffset * zoom;
    const maxZRightOffset = maxRightOffset * zoom;
    const maxZTopOffset = maxTopOffset * zoom;
    const maxZBottomOffset = maxBottomOffset * zoom;


    let worldPosition = new THREE.Vector3();
    let b = worldPosition.project(this.pointCamera);

    const xn = b.x * width / 2;
    const yn = b.y * height / 2;

    const lHalfWidth = zoom * halfWidth;
    const lHalfHeight = zoom * halfHeight;


    // (zoom - 1) * height / 2 + yn
    let top = (zoom - 1 + b.y) * halfHeight;
    // (zoom - 1) * width / 2 - xn
    let left = (zoom - 1 - b.x) * halfWidth;


    const orbitRight = xn + lHalfWidth;
    const orbitLeft = xn - lHalfWidth;
    const orbitTop = yn + lHalfHeight;
    const orbitBottom = yn - lHalfHeight;


    // 是否需要重新更改orbit controls
    let right = 0;
    // 最右边
    if (orbitRight - maxZRightOffset < halfWidth - maxRightOffset) {
      const more = halfWidth - orbitRight + maxZRightOffset - maxRightOffset;
      left -= more;
      this.controls.target.x -= more;
      this.pointCamera.position.x -= more;
    } else {
      right = orbitRight - width / 2;
      // 最左边
      if (orbitLeft + maxZLeftOffset > -halfWidth + maxLeftOffset) {
        const more = orbitLeft + halfWidth + maxZLeftOffset - maxLeftOffset;
        left = 0;
        right -= more;
        this.controls.target.x += more;
        this.pointCamera.position.x += more;
      }
    }

    let bottom = 0;
    // 最下边
    if (orbitBottom + maxZBottomOffset > -halfHeight + maxBottomOffset) {
      const more = orbitBottom + halfHeight + maxZBottomOffset - maxBottomOffset;
      top += more;
      this.controls.target.y += more;
      this.pointCamera.position.y += more;
    } else {
      bottom = -orbitBottom - halfHeight;
      // 最上边
      if (orbitTop - maxZTopOffset < halfHeight - maxTopOffset) {
        const more = halfHeight - orbitTop + maxZTopOffset - maxTopOffset;
        top = 0;
        bottom -= more;
        this.controls.target.y -= more;
        this.pointCamera.position.y -= more;
      }
    }

    // 缩放
    if (!this.afterOrbit || this.afterOrbit.zoom !== zoom) {

      // 移动x轴
    } else if (this.afterOrbit.left !== left && this.afterOrbit.top === top) {

    }

    this.afterOrbit = {
      zoom,
      left,
      right,
      top,
      bottom,
    };

    this.drawXAxis(this.option.xAxisData, this.afterOrbit);


    worldPosition = null;
    b = null;
    // const  g = this.pointGroup.children[0].geometry;
    // const radius = g.parameters.radius
    // g.parameters.radius = radius / zoom;
    // g.needsUpdate = true;
  },
  // x轴主线
  drawXAxisMain() {

  },
  /**
   * @param axisData {Array}
   * @param limit
   */
  drawXAxis(axisData, limit = {
 left: 0, right: 0, top: 0, bottom: 0, zoom: 1
}) {
    const { width, height } = this.position;
    const halfW = width / 2;
    const halfH = height / 2;

    if (this.xAxisGroup) {
      distoryObject(this.xAxisGroup, this.scene);
    }
    const group = new THREE.Group();
    group.userData.type = 'xaxis';
    group.position.z = 12;

    let {
 left: limitLeft, right: limitRight, top: limitTop, bottom: limitBottom, zoom
} = limit;
    limitLeft = Math.floor(limitLeft);
    limitRight = Math.floor(limitRight);
    limitTop = Math.floor(limitTop);
    limitBottom = Math.floor(limitBottom);

    axisData.forEach((axis) => {
      const {
 data, position = 'bottom', offset = 30, left = 40, right = 40, type = 'category'
} = axis;

      const bottom = Math.floor(-halfH + offset) + 0.5;
      // 主线
      const points = [
        new THREE.Vector3(-halfW + left - 5, bottom, 0),
        new THREE.Vector3(halfW - right + 5, bottom, 0),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, this.axisLineMaterial);
      group.add(line);

      // 刻度
      const len = data.length;

      let startIndex = 0;
        let endIndex = len - 1;
if (type === 'category') {
        if (limitLeft > 0) {
          const rWidth = (width - left - right) * zoom;
          startIndex = Math.floor((limitLeft - left) / rWidth * len);
          if (startIndex < 0) startIndex = 0;
          endIndex = len - Math.ceil((limitRight - right) / rWidth * len) - 1;
        }
        // 数值类型
      } else {

      }
      const leftCount = endIndex - startIndex + 1;

      const splitNumber = leftCount >= 10 ? 10 : leftCount;
      console.log(splitNumber, 'splitNumber', endIndex, startIndex);
      const xLen = width - left - right;
      const step = Math.floor(len / splitNumber);

      // x轴对应的坐标点
      const ratio = Math.ceil(xLen / len);

      const tickGeometry = new THREE.BufferGeometry();
      const positions = [];
      for (let i = 0, start = Math.floor(-halfW + left + ratio) + 0.5; i < len; i++) {
        data[i].x = undefined;

        if (i >= startIndex && i <= endIndex) {
          data[i].x = start;
          if (i % step === 0) {
            // start = Math.floor(start) + 0.5;
            positions.push(start, bottom, 0);
            positions.push(start, bottom - 10, 0);
            const txtMesh = drawText({ txt: data[i].name, x: start, y: bottom - 20 });
            group.add(txtMesh);
          }
          start += ratio;
        }
      }

      tickGeometry.attributes.position = new THREE.Float32BufferAttribute(positions, 3);
      const lineSegments = new THREE.LineSegments(tickGeometry, this.axisLineMaterial);
      group.add(lineSegments);
    });
    this.xAxisGroup = group;
    this.scene.add(group);
  },
  // 创建遮盖层，放大超过范围的不显示
  drawCover({
 left = 40, right = 40, top = 30, bottom = 30
}) {
    const { width, height } = this.position;

    const group = new THREE.Group();
    this.scene.add(group);

    const halfW = width / 2;
    const halfH = height / 2;

    {
      // 左边
      const geometry = new THREE.PlaneGeometry(left, height - 2);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const cube = new THREE.Mesh(geometry, material);

      cube.position.z = 1;
      cube.position.x = -halfW + left / 2 - 1;
      cube.position.y = 0;
      group.add(cube);
    }

    {
      // 右边
      const geometry = new THREE.PlaneGeometry(right, height - 2);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const cube = new THREE.Mesh(geometry, material);

      cube.position.z = 1;
      cube.position.x = halfW - right / 2 + 1;
      cube.position.y = 0;
      group.add(cube);
    }

    {
      // 下边
      const geometry = new THREE.PlaneGeometry(width, right - 2);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const cube = new THREE.Mesh(geometry, material);

      cube.position.z = 1;
      cube.position.x = 0;
      cube.position.y = -halfH + bottom / 2 - 10;
      group.add(cube);
    }

    {
      // 上边
      const geometry = new THREE.PlaneGeometry(width, top - 2);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const cube = new THREE.Mesh(geometry, material);

      cube.position.z = 1;
      cube.position.x = 0;
      cube.position.y = halfH - bottom / 2 + 1;
      group.add(cube);
    }
  },
  createPointMesh({ code, count, size = 10 }) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0.5,
      transparent: true,
    });
    const geometry = new THREE.CircleGeometry(size);
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    this.pointMesh[code] = mesh;
    if (!this.pointGroup) {
      this.pointGroup = new THREE.Group();
      this.pointGroup.userData.type = 'content';
    }
    this.pointGroup.add(mesh);
    this.pointScene.add(this.pointGroup);
    return mesh;
  },
  drawYAxis(axisData) {
    const { width, height } = this.position;
    const halfW = width / 2;
    const halfH = height / 2;
    const group = new THREE.Group();
    group.userData.type = 'yaxis';
    group.position.z = 2;

    axisData.forEach((axis) => {
      const {
 data, position = 'left', offset = 40, top = 40, bottom = 30, splitNumber = 5
} = axis;
      const left = Math.floor(-halfW + offset) + 0.5;
      const rBottom = -halfH + bottom;
      axis.startPos = rBottom;
      axis.endPos = halfH - top;

      // 主线
      const points = [
        new THREE.Vector3(left, halfH - top, 0),
        new THREE.Vector3(left, rBottom - 5, 0),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, this.axisLineMaterial);
      group.add(line);

      // 刻度
      const step = (height - top - bottom) / (splitNumber - 1);

      const tickGeometry = new THREE.BufferGeometry();

      const positions = [];
      for (let i = 1, start = rBottom + step; i < splitNumber; i++, start += step) {
        positions.push(left, start, 0);
        positions.push(left - 10, start, 0);
      }
      tickGeometry.attributes.position = new THREE.Float32BufferAttribute(positions, 3);
      const lineSegments = new THREE.LineSegments(tickGeometry, this.axisLineMaterial);
      group.add(lineSegments);
    });
    this.scene.add(group);
  },

  drawLegend() {

  },

  drawPoint({ series, yAxisData, xAxisData }) {
    const { width, height } = this.position;

    series.forEach((serie, index) => {
      const {
 data, xAxisIndex = 0, yAxisIndex = 0, id
} = serie;

      const { startPos, endPos } = yAxisData[xAxisIndex];
      const { data: xData } = xAxisData[xAxisIndex];
      const xPos = Object.create(null);
      xData.forEach(({ name, x }) => {
        xPos[name] = x;
      });

      // 获取y轴中的最大值，最小值
      data.sort((a, b) => a[1] - b[1]);
      const minData = data[0];
      const maxData = data[data.length - 1];
      // 最大，最小的差，根据比例计算y轴的坐标点
      const dataGap = maxData[1] - minData[1];
      const posGap = endPos - startPos;
      const posC = posGap / 2;
      const ratio = dataGap === 0 ? posGap : posGap / dataGap;

      const yPos = (v) => (dataGap === 0 ? posC : v * ratio) + startPos;

      const matrix = new THREE.Matrix4();
      const mesh = this.createPointMesh({ code: id || index, count: data.length, size: 4 });
      mesh.userData.type = 'series';
      mesh.userData.chartType = serie.type;
      mesh.userData.seriesIndex = index;

      mesh.name = serie.name || id;

      const color = new THREE.Color('#81ffae');

      data.forEach((d, i) => {
        if (d[1] !== '' && d[1] !== undefined) {
          matrix.setPosition(xPos[d[0]], yPos(d[1]), 0);
          mesh.setMatrixAt(i, matrix);
          mesh.setColorAt(i, color);
        }
      });
    });
  }
};
