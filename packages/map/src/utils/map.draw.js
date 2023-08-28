import * as THREE from 'three';


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
    const intersectedObjects = this.raycaster.intersectObjects(objects);
    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0];// .object
      // save its color
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
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

function createLabelTexture(text) {
  const offscreenCanvas = new OffscreenCanvas(256, 256);
  const ctx = offscreenCanvas.getContext('2d');
  ctx.fillStyle = '#FDB';
  ctx.fillRect(0, 0, 256, 256);
  ctx.font = '200px normal sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fb4848';
  ctx.fillText(text, 128, 128);
  const texture = new THREE.CanvasTexture(offscreenCanvas);
  texture.flipY = false;
  return texture;
}

export function RenderManager(canvas) {
  this.canvas = canvas;
  this.renderer = new THREE.WebGLRenderer({ canvas });
  this.renderer.setPixelRatio(1);
  this.pickHelper = new PickHelper();
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

      const { camera } = scene;
      renderer.render(scene.scene, camera);
    });
  },

  /**
   *
   * @param options {
      virtualDiameter,
      circleColor,
      dieHeight,
    }
   * @returns {{canvas: OffscreenCanvas, ctx: OffscreenCanvasRenderingContext2D}}
   */
  drawLayer(options) {
    const {
 virtualDiameter, circleColor, dieHeight, dieWidth
} = options;

    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(circleColor.substr(0, 7)),
    });
    const halfDiameter = virtualDiameter / 2;
    const geometry = new THREE.RingGeometry(halfDiameter, halfDiameter, halfDiameter * 4);
    const layerMesh = new THREE.Line(geometry, material);
    layerMesh.position.x = 0;// -dieWidth / 2;
    layerMesh.position.y = 0;// dieHeight / 2;
    return layerMesh;
  },
};

/**
 * @param position { left, right, bottom, top, width, height }
 * @param render { RenderManager }
 * @param mapProperty { dieW, dieH, dieNum, virtualDiameter }
 * @param virtualDiameter { diameter }
 * @constructor
 */
export function SceneManager({ position, render, mapProperty }) {
  const { virtualDiameter } = mapProperty;
  this.position = position;
  this.scene = new THREE.Scene();
  this.camera = new THREE.OrthographicCamera(-position.width / 2, position.width / 2, position.height / 2, -position.height / 2, 1, virtualDiameter);

  // this.camera = new THREE.PerspectiveCamera(90, 1, 1, virtualDiameter);
  // this.camera.position.set(0, 0, virtualDiameter);

  const min = Math.min(position.width, position.height);
  this.camera.position.z = virtualDiameter;
  this.camera.lookAt(0, 0, 0);
  this.handleTransform({ k: min / virtualDiameter, x: 0, y: 0 });
  this.defectMesh = Object.create(null);
  this.render = render;
  this.createDieMesh(mapProperty);
}

SceneManager.prototype = {
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

  createDieMesh({ dieW: dieWidth, dieH: dieHeight, dieNum }) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      // vertexColors: true,
      // transparent: true,
      // opacity: 0.9,
    });
    const geometry = new THREE.PlaneGeometry(dieWidth, dieHeight);
    this.dieMesh = new THREE.InstancedMesh(geometry, material, dieNum);
    this.scene.add(this.dieMesh);
    return this;
  },
  createDefectMesh({ code, count = 100, size = 20 }) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    const geometry = new THREE.CircleGeometry(size);
    this.defectMesh[code] = new THREE.InstancedMesh(geometry, material, count);
    this.scene.add(this.defectMesh[code]);
    return this.defectMesh[code];
  },

  handleClick(pos) {
    const picker = this.render.pickHelper;
    picker.pick(pos, [this.dieMesh], this.camera);
    if (picker.pickedObject) {
      const item = picker.pickedObject;
      const { instanceId } = item;
      this.dieMesh.setColorAt(instanceId, new THREE.Color(1, 1, 0));
      this.dieMesh.instanceColor.needsUpdate = true;

      this.reRender();
    }
  },
  reRender() {
    this.render.renderer.render(this.scene, this.camera);
  },
  drawLayer(layerMesh) {
    this.scene.add(layerMesh.clone());
    return this;
  },
  /**
     *
     * @param options {
        baseData,
        aggregateData,
      }
   * @returns {SceneManager}
   */
  drawDie(options) {
    const {
      baseData,
      aggregateData,
    } = options;

    const { dieMesh: mesh } = this;
    const matrix = new THREE.Matrix4();

    const hasAggregate = !!aggregateData.data;
    this.dieIndex = [];
    let i = 0;
    for (const zoneId in baseData) {
      for (const dieid in baseData[zoneId]) {
        const item = baseData[zoneId][dieid];

        const { originLeftX: x, originTopY: y } = item;

        const aggItem = hasAggregate && aggregateData.data[dieid];

        let color;
        if (aggItem) {
          color = new THREE.Color(aggItem.colorShow.substr(0, 7));
        } else {
          color = new THREE.Color('#ffffff');
        }
        this.dieIndex[i] = item;
        matrix.setPosition(x, y, 0);
        mesh.setMatrixAt(i, matrix);
        mesh.setColorAt(i, color);
        i++;
      }
    }


    return this;
  },

  drawTest() {
    const tickGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: '#bababa'
    });
    const positions = [];
    const left = 100;
    const step = 50;
    const len = 5;
    for (let i = 1, start = left + step; i < len; i++, start += step) {
      positions.push(start, 200, 0);
      positions.push(start, 200 - 100, 0);
    }
    tickGeometry.attributes.position = new THREE.Float32BufferAttribute(positions, 3);
    const lineSegments = new THREE.LineSegments(tickGeometry, lineMaterial);
    this.scene.add(lineSegments);


    {
      const offscreenCanvas = new OffscreenCanvas(256, 256);
      // offscreenCanvas.setPixelRatio(2);
      const ctx = offscreenCanvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      // ctx.fillStyle = '#FDB';
      // ctx.fillRect(0, 0, 256, 256);
      ctx.font = '36px bold sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#666';
      ctx.fillText('中', 128, 128);
      ctx.scale(2, 2);

      const texture = new THREE.CanvasTexture(offscreenCanvas);
      const material = new THREE.SpriteMaterial({ map: texture, sizeAttenuation: false, transparent: true });
      // material.sizeAttenuation = false;
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(material.map.image.width, material.map.image.height, 1);
      sprite.position.set(0, 0, 0);
      this.scene.add(sprite);
    }


    {
      const offscreenCanvas = new OffscreenCanvas(256, 256);
      const ctx = offscreenCanvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      // ctx.fillStyle = '#FDB';
      // ctx.fillRect(0, 0, 256, 256);
      ctx.font = '36px bold sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#666';
      ctx.fillText('中', 128, 128);
      ctx.scale(2, 2);
      const texture = new THREE.CanvasTexture(offscreenCanvas);
      texture.minFilter = THREE.LinearMipMapNearestFilter;
      texture.magFilter = THREE.LinearFilter;
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xff0000 // useful for debugging. in this way you see, how much are of the plane is used for the text
      });

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(), material);

      this.scene.add(mesh);
    }


    {
      const geometries = [
        new THREE.BoxGeometry(100, 100, 100),
        new THREE.SphereGeometry(0.5, 12, 8),
        new THREE.DodecahedronGeometry(0.5),
        new THREE.CylinderGeometry(0.5, 0.5, 1, 12)
      ];


      // add one random mesh to each scene
      const geometry = geometries[0];

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1, 0.75, THREE.SRGBColorSpace),
        roughness: 0.5,
        metalness: 0,
        flatShading: true
      });

      this.scene.add(new THREE.Mesh(geometry, material));
    }

    {
      const UnscaledTextVertexShader = `precision highp float;
uniform float width;
uniform float height;
uniform float domWidth;
uniform float domHeight;

varying vec2 vUv;
 
void main() {
    vUv = uv;
    vec4 proj = projectionMatrix * modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    gl_Position = vec4(
        proj.x / proj.w  + position.x * width / domWidth * 2.0,
        proj.y / proj.w + position.y * height / domHeight * 2.0,
        proj.z / proj.w,
        1.0
    );
}`;

      const UnscaledTextFragmentShader = `precision highp float;

uniform sampler2D tDiffuse;
uniform float width;
uniform float height;
 
varying vec2 vUv;
 
void main() {
    vec2 _uv = vec2(
        (floor(vUv.s * width) + 0.5) / width,
        (floor(vUv.t * height) + 0.5) / height
    );

    gl_FragColor = texture2D( tDiffuse, _uv );
}`;
      const text = 'ABS测试有点模糊';
      const offscreenCanvas = new OffscreenCanvas(256, 256);
      const context = offscreenCanvas.getContext('2d');

      // context.imageSmoothingQuality = 'high';
      context.textBaseline = 'middle';
      context.textAlign = 'center';
      // context.lineWidth = 1;

      const halfWidth = offscreenCanvas.width / 2;
      const halfHeight = offscreenCanvas.height / 2;

// 画描边
      context.font = '20px "Microsoft YaHei"';
//       context.strokeStyle = '#000';
//       context.strokeText(text, halfWidth, halfHeight);

// 画文字
      context.fillStyle = '#575757';
      context.fillText(text, halfWidth, halfHeight);

      const geometry = new THREE.PlaneGeometry();
      const material = new THREE.ShaderMaterial({
        vertexShader: UnscaledTextVertexShader,
        fragmentShader: UnscaledTextFragmentShader,
        uniforms: {
          tDiffuse: {
            value: new THREE.CanvasTexture(offscreenCanvas)
          },
          width: {
            value: offscreenCanvas.width
          },
          height: {
            value: offscreenCanvas.height
          },
          domWidth: {
            value: this.render.renderer.domElement.width
          },
          domHeight: {
            value: this.render.renderer.domElement.height
          }
        },
        transparent: true
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(200, 100, 0);
      this.scene.add(mesh);
    }

    {


      // var particleMaterial = new THREE.SpriteMaterial( {
      //   color: 0x000000,
      //   program: function ( context ) {
      //     context.beginPath();
      //     context.font="bold 100px Arial";
      //     context.fillStyle="#000";
      //     context.transform(-1,0,0,1,0,0);
      //     context.rotate(Math.PI);
      //     context.fillText( '测试?' , 0, 0 );
      //   }
      // } );
      // var particle = new THREE.Sprite( particleMaterial );
      // particle.rotation.x = Math.PI/2;

      // this.scene.add(particle);
    }
  },
  /**
   *
   * @param options {
      defectData,
    }
   * @returns {{canvas: OffscreenCanvas, ctx: OffscreenCanvasRenderingContext2D}}
   */
  drawDefect(options) {
    const {
      defectData,
    } = options;

    defectData.forEach(defect => {
      const count = defect.data.length;

      let i = 0;
      const size = 4;
      const mesh = this.createDefectMesh({ code: defect.splitField, count, size });
      const matrix = new THREE.Matrix4();

      defect.data.forEach(((item, index) => {
        const rx = item.originLeftX;
        const ry = item.originTopY;
        const r = size / 2;
        const color = new THREE.Color(item.colorShow.substr(0, 7));
        switch (item.shapeShow) {
          case 'circle': {
            matrix.setPosition(rx, ry, 0);
            mesh.setMatrixAt(i, matrix);
            mesh.setColorAt(i, color);
            i++;
            break;
          }
        }

        if (item.isImageDefect) {
          // const r1 = r + 2;
          // drawRect({
          //   imgData,
          //   x1: Math.round(rx - r1),
          //   y1: Math.round(ry - r1),
          //   x2: Math.round(rx + r1),
          //   y2: Math.round(ry + r1),
          //   color: [0, 0, 0, 255],
          //   width4,
          // });
        }
      }));
    });
    return this;
  },

  drawDieBorder(options) {
    const {
      borderData,
      dieBorderColor
    } = options;
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(dieBorderColor)
    });

    const group = new THREE.Group();
    borderData.forEach(border => {
      const points = [
        new THREE.Vector3(border[0][0], border[0][1], 0),
        new THREE.Vector3(border[1][0], border[1][1], 0),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      group.add(line);
    });
    this.dieBorderGroup = group;
    this.scene.add(group);
    return this;
  }
};
