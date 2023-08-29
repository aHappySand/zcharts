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
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
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
      this.splitList = [{}, {}];

      return {
        isLoading: false,
        gridKey: Math.random(),
        total: 0,
        size: 2,
        page: 1,
        row: 1,
        col: 2,
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
        let canvas; let
renderer;
        const scenes = [];

        const pickPosition = { x: -100000, y: -100000 };
        const self = this;

        class PickHelper {
          constructor() {
            this.raycaster = new THREE.Raycaster();
            this.pickedObject = null;
            this.pickedObjectSavedColor = 0;
          }

          pick(normalizedPosition, scene, camera, time) {
            // restore the color if there is a picked object
            if (this.pickedObject) {
              this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
              this.pickedObject = undefined;
            }

            // cast a ray through the frustum
            this.raycaster.setFromCamera(normalizedPosition, camera);
            // get the list of objects the ray intersected
            const intersectedObjects = this.raycaster.intersectObjects(scene.children);
            if (intersectedObjects.length) {
              // pick the first object. It's the closest one
              this.pickedObject = intersectedObjects[0].object;
              // save its color
              this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
              // set its emissive color to flashing red/yellow
              this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
            }
          }
        }
        const pickHelper = new PickHelper();

        init();
        animate();

        function init() {
          canvas = self.$refs.mapc;


          const geometries = [
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.SphereGeometry(0.5, 12, 8),
            new THREE.DodecahedronGeometry(0.5),
            new THREE.CylinderGeometry(0.5, 0.5, 1, 12)
          ];

          const charts = self.$refs.chart;
          charts.forEach((el, index) => {
            const { $el: sceneElement } = el;
            const scene = new THREE.Scene();
            // the element that represents the area we want to render the scene
            scene.userData.element = sceneElement;

            const camera = new THREE.PerspectiveCamera(50, 1, 1, 10);
            camera.position.z = 2;
            scene.userData.camera = camera;

            const controls = new OrbitControls(scene.userData.camera, scene.userData.element);
            controls.minDistance = 2;
            controls.maxDistance = 5;
            // controls.enablePan = false;
            // controls.enableZoom = false;
            scene.userData.controls = controls;

            // add one random mesh to each scene
            const geometry = geometries[geometries.length * Math.random() | 0];

            const material = new THREE.MeshStandardMaterial({

              color: new THREE.Color().setHSL(Math.random(), 1, 0.75, THREE.SRGBColorSpace),
              roughness: 0.5,
              metalness: 0,
              flatShading: true

            });

            scene.add(new THREE.Mesh(geometry, material));

            scenes.push(scene);

            function getCanvasRelativePosition(event) {
              const rect = scene.userData.element.getBoundingClientRect();
              return {
                x: (event.clientX - rect.left),
                y: (event.clientY - rect.top),
              };
            }


            function setPickPosition(event) {
              const rect = scene.userData.element.getBoundingClientRect();

              const pos = getCanvasRelativePosition(event);
              pickPosition.x = (pos.x / rect.width) * 2 - 1;
              pickPosition.y = (pos.y / rect.height) * -2 + 1; // note we flip Y

              pickHelper.pick(pickPosition, scene, camera, Math.random() * 0.01);
            }

            scene.userData.element.addEventListener('mousemove', setPickPosition);
          });

          renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        }

        function updateSize() {
          const width = canvas.clientWidth;
          const height = canvas.clientHeight;

          if (canvas.width !== width || canvas.height !== height) {
            renderer.setSize(width, height, false);
          }
        }

        function animate() {
          render();
          requestAnimationFrame(animate);
        }

        function render() {
          updateSize();
          // canvas.style.transform = `translateY(${container.scrollTop}px)`;

          renderer.setClearColor(0xffffff);
          renderer.setScissorTest(false);
          renderer.clear();

          renderer.setClearColor(0xe0e0e0);
          renderer.setScissorTest(true);

          scenes.forEach((scene) => {
            // so something moves
            scene.children[0].rotation.y = Date.now() * 0.001;

            // get the element that is a place holder for where we want to
            // draw the scene
            const { element } = scene.userData;

            // get its position relative to the page's viewport
            const rect = element.getBoundingClientRect();

            // check if it's offscreen. If so skip it
            if (rect.bottom < 0 || rect.top > renderer.domElement.clientHeight
              || rect.right < 0 || rect.left > renderer.domElement.clientWidth) {
              return; // it's off screen
            }

            const p = element.parentElement.getBoundingClientRect();

            // set the viewport
            const width = rect.right - rect.left;
            const height = rect.bottom - rect.top;
            const left = element.offsetLeft;
            const bottom = renderer.domElement.height - rect.offsetTop - height;
            renderer.setViewport(left, bottom, width, height);
            renderer.setScissor(left, bottom, width, height);

            const { camera } = scene.userData;

            // camera.aspect = width / height; // not changing in this example
            // camera.updateProjectionMatrix();

            // scene.userData.controls.update();

            renderer.render(scene, camera);
          });
        }
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
