//** Libs */
import autoBind from "auto-bind";
import { Scene, OrthographicCamera } from "three";

//** Utils */
import { 
  getPositionDataTexture, 
  getVelocityDataTexture, 
  getAlphaDataTexture 
} from "./ParticleDataTexture";

class _ParticleData {
  constructor() {
    autoBind(this);

    //** Configs */
    this.textureSize = 32;
    this.pointsQtd = Math.pow(this.textureSize, 2);
    this.AABBSize = 0.7;

    //** Typed Arrays */
    this.points = new Float32Array(this.pointsQtd * 3);
    this.pointsRefs = new Float32Array(this.pointsQtd * 2);
    this.pointLines = new Float32Array(this.pointsQtd * 2 * 3);
    this.pointImageIndexes = new Float32Array(this.pointsQtd);

    //** Data Texture */
    this.position = null;
    this.velocity = null;
    this.alpha = null;

    //** FBO */
    this.sceneTexPosition = new Scene();
    this.sceneTexAlpha = new Scene();
    this.sceneCount = new Scene();
    this.camera = new OrthographicCamera(-1, 1, 1, -1, -1, 1);

    //** Real-time data */
    this.intersectionCount = 0;
    this.skipCounting = false;

    //** Initializers */
    this.initTypedArrays();
    this.initDataTextures();
  }

  initTypedArrays() {
    for (let i = 0; i < this.textureSize; i++) {
      for (let j = 0; j < this.textureSize; j++) {
          const k = i * this.textureSize + j;

          //** Point - Positions */
          this.points[k * 3 + 0] = 2 * i / this.textureSize;
          this.points[k * 3 + 1] = 2 * j / this.textureSize;
          this.points[k * 3 + 2] = 0;

          //** Point - Refs */
          this.pointsRefs[k * 2 + 0] = i / (this.textureSize - 1);
          this.pointsRefs[k * 2 + 1] = j / (this.textureSize - 1);
      }
    }
  }

  initDataTextures() {
    this.position = getPositionDataTexture(this.textureSize);
    this.velocity = getVelocityDataTexture(this.textureSize);
    this.alpha = getAlphaDataTexture(this.textureSize);
  }

  pointInAABB2D(point, minB, maxB) {
    return (point.x >= minB.x && point.x <= maxB.x && 
            point.y >= minB.y && point.y <= maxB.y);
  }

  forEachPositions(cb) {
    for (let i = 0; i < this.textureSize; i++) {
      for (let j = 0; j < this.textureSize; j++) {
          const k = i * this.textureSize + j;

          //** Point - Positions */
          const x = this.position.data[k * 3 + 0];
          const y = this.position.data[k * 3 + 1];
          const z = this.position.data[k * 3 + 2];

          cb([x, y, z]);
      }
    }
  }

  updatePositions(time, deltaTime, lerp = 0.1) {
    for (let i = 0; i < this.textureSize; i++) {
      for (let j = 0; j < this.textureSize; j++) {
          const k = i * this.textureSize + j;
          
          let iX = k * 3 + 0;
          let iY = k * 3 + 1;
          let iZ = k * 3 + 2;

          // ** Point - Velocity */
          let vx = this.velocity.data[iX];
          let vy = this.velocity.data[iY];
          let vz = this.velocity.data[iZ];

          //** Point - Positions */
          this.position.data[iX] += vx * lerp * deltaTime;
          this.position.data[iY] += vy * lerp * deltaTime;
          this.position.data[iZ] = (((this.position.data[iZ] + 0.005) * deltaTime) % 30) - 30.;
      }
    }
  }

  updateImageIndexes(uvs) {
    for (let i = 0; i < this.pointsQtd; i++) {
      this.pointImageIndexes[i] = Math.floor(Math.random() * uvs.length);
    }  
  }
}

export const ParticleData = new _ParticleData(); 
