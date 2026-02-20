//** Libs */
import { DataTexture, RGBAFormat, FloatType, MathUtils, NearestFilter, ClampToEdgeWrapping } from "three"

const __w = 7.3;
const __h = 4.1;

const TUNNEL_RADIUS = 10;
const TUNNEL_LENGTH = -30;

export function getPositionDataTexture(size){
    let number = size * size;

    const data = new Float32Array(4 * number);

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const index = i * size + j;

        const angle = MathUtils.randFloat(0, Math.PI * 2);
        const radius = MathUtils.randFloat(0, TUNNEL_RADIUS);
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = MathUtils.randFloat(TUNNEL_LENGTH, 0);

        data[4 * index] = x;
        data[4 * index + 1] = y;
        data[4 * index + 2] = z;
        data[4 * index + 3] = 0;
      }
    }

    let dataTexture = new DataTexture(
      data,
      size,
      size,
      RGBAFormat,
      FloatType
    );

    dataTexture.needsUpdate = true;

    return { dataTexture, data };
}

export function getVelocityDataTexture(size){
  let number = size * size;

  const data = new Float32Array(4 * number);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = i * size + j;
      
      const vx = MathUtils.randFloat(-0.05, 0.05);
      const vy = MathUtils.randFloat(-0.05, 0.05);
      const vz = 0;

      data[4 * index] = vx;
      data[4 * index + 1] = vy;
      data[4 * index + 2] = vz;
      data[4 * index + 3] = 0;
    }
  }

  let dataTexture = new DataTexture(
    data,
    size,
    size,
    RGBAFormat,
    FloatType
  );

  dataTexture.needsUpdate = true;

  return { dataTexture, data };
}

export function getAlphaDataTexture(size){
  let number = size * size;

  const data = new Float32Array(4 * number);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = i * size + j;

      data[4 * index] = 0;
      data[4 * index + 1] = 0;
      data[4 * index + 2] = 0;
      data[4 * index + 3] = 0;
    }
  }

  let dataTexture = new DataTexture(
    data,
    size,
    size,
    RGBAFormat,
    FloatType
  );

  dataTexture.needsUpdate = true;

  return { dataTexture, data };
}

async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // allow CORS if needed
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export const createImageAtlas = async (urls, cellSize = 128) => {
  // load all images
  const images = await Promise.all(urls.map(loadImage));

  const count = images.length;
  const gridSize = Math.ceil(Math.sqrt(count));

  // compute atlas size (power of two)
  const potSize = (n) => 2 ** Math.ceil(Math.log2(n));
  const atlasSize = potSize(gridSize * cellSize);

  const canvas = document.createElement("canvas");
  canvas.width = atlasSize;
  canvas.height = atlasSize;

  const ctx = canvas.getContext("2d");

  const uvs = [];

  images.forEach((img, i) => {
    const gx = i % gridSize;
    const gy = Math.floor(i / gridSize);

    const x = gx * cellSize;
    const y = gy * cellSize;

    // fit image into cell (centered, keep aspect ratio)
    const scale = Math.min(cellSize / img.width, cellSize / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const dx = x + (cellSize - w) / 2;
    const dy = y + (cellSize - h) / 2;

    ctx.clearRect(x, y, cellSize, cellSize);
    ctx.drawImage(img, dx, dy, w, h);

    // store UVs (normalized)
    const u0 = x / atlasSize;
    const v0 = y / atlasSize;
    const u1 = (x + cellSize) / atlasSize;
    const v1 = (y + cellSize) / atlasSize;

    uvs.push({ u0, v0, u1, v1 });
  });

  return { texture: canvas, uvs };
}

export const getUVRectTexture = (uvs, size) => {
  const count = size * size;
  const data = new Float32Array(count * 4);

  for (let i = 0; i < count; i++) {
    const imgIndex = i % uvs.length;

    const { u0, v0, u1, v1 } = uvs[imgIndex];
    const du = u1 - u0;
    const dv = v1 - v0;
    
    const u0_gl = u0;
    const v0_gl = 1.0 - v1; // bottom-left origin

    const o = i * 4;
    data[o + 0] = u0_gl;
    data[o + 1] = v0_gl;
    data[o + 2] = du;
    data[o + 3] = dv;
  }

  const tex = new DataTexture(data, size, size, RGBAFormat, FloatType);
  tex.needsUpdate = true;
  tex.magFilter = NearestFilter;
  tex.minFilter = NearestFilter;
  tex.wrapS = ClampToEdgeWrapping;
  tex.wrapT = ClampToEdgeWrapping;
  tex.flipY = false;
  tex.generateMipmaps = false;

  return tex;
}