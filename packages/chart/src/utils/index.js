import * as THREE from 'three';

export function drawText({
 txt, x = 0, y = 0, color = '#150404', fontSize = 14
}) {
  // canvas
  const scale = 2;
  const offscreen = new OffscreenCanvas(200, fontSize * scale);
  const ctx = offscreen.getContext('2d');
  ctx.font = `${fontSize * scale}px FangSong,"宋体",sans-serif`;
  const textRect = ctx.measureText(txt);
  offscreen.width = textRect.width;

  ctx.fillStyle = color;
  ctx.font = `${fontSize * scale}px FangSong,"宋体",sans-serif`;
  ctx.textBaseline = 'top';
  // ctx.textBaseline = 'middle';
  // ctx.textAlign = 'center';
  ctx.fillText(txt, 0, 0);
  ctx.imageSmoothingQuality = 'high';

  // plane
  const texture = new THREE.CanvasTexture(offscreen);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, color });
  const geometry = new THREE.PlaneGeometry(offscreen.width / scale, fontSize);
  const plane = new THREE.Mesh(geometry, material);

  plane.position.x = x;
  plane.position.y = y;
  return plane;
}

export function drawText2({
 txt, x = 0, y = 0, color = '#8b8b8b'
}) {
  // canvas
  const fontSize = 14; const scale = 2;
  const offscreen = new OffscreenCanvas(200, fontSize * scale);
  const ctx = offscreen.getContext('2d');
  ctx.font = `${fontSize * scale}px FangSong,"宋体",sans-serif`;
  const textRect = ctx.measureText(txt);
  offscreen.width = textRect.width;
  ctx.fillStyle = color;
  ctx.font = `${fontSize * scale}px FangSong,"宋体",sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText(txt, 0, 0);
  ctx.imageSmoothingQuality = 'high';

  // sprite
  const texture = new THREE.CanvasTexture(offscreen);
  const material2 = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material2);
  sprite.position.x = x;
  sprite.position.y = y;
  sprite.scale.set(textRect.width / scale, fontSize, 1);
  return sprite;
}

export function drawText3({
 txt, canvas, renderer, x = 0, y = 0, color = '#8b8b8b'
}) {
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
        proj.x / proj.w  + position.x * width / domWidth*2.0,
        proj.y / proj.w + position.y * height / domHeight*2.0,
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
  const offscreenCanvas = new OffscreenCanvas(316, 316);
  const context = offscreenCanvas.getContext('2d');

  context.imageSmoothingQuality = 'high';
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.lineWidth = 1;

  // 画描边
  context.font = '14px FangSong,"宋体",sans-serif';

  const textRect = context.measureText(txt);
  offscreenCanvas.width = textRect.width * 2;
  offscreenCanvas.height = textRect.width * 2.8;

  const halfWidth = offscreenCanvas.width / 2;
  const halfHeight = offscreenCanvas.height / 2;

  context.fillStyle = color;
  context.fillText(txt, halfWidth, halfHeight);

  const geometry = new THREE.PlaneGeometry();
  const material = new THREE.ShaderMaterial({
    vertexShader: UnscaledTextVertexShader,
    fragmentShader: UnscaledTextFragmentShader,
    uniforms: {
      tDiffuse: {
        value: new THREE.CanvasTexture(offscreenCanvas)
      },
      width: {
        value: canvas.width
      },
      height: {
        value: data.canvas.height
      },
      domWidth: {
        value: renderer.domElement.width
      },
      domHeight: {
        value: renderer.domElement.height
      }
    },
    transparent: true
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, 0);
  return mesh;
}


/**
 * @description: 销毁物体对象
 * @param {Object3D} THREE.Object3D 销毁的物体
 * @param {parent} THREE.Object3D 销毁的物体的父级，从父级移除物体
 * @return {void}
 * @文档: https://threejs.org/docs/#manual/zh/introduction/How-to-dispose-of-objects
 */
export const distoryObject = (object, parent) => {
  parent.remove(object);
  const { children } = object;
  if (!children) return;
  children.forEach(({ geometry, material, children }) => {
    geometry && geometry.dispose();
    if (Array.isArray(material)) {
      material.forEach((m) => m.dispose());
    } else material?.dispose();
    if (children.length) children.forEach((item) => distoryObject(item, object));
  });
};
