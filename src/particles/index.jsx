//** Libs */
import React, { useCallback, useEffect, useRef } from 'react'
import { useFBO } from "@react-three/drei"
import { createPortal, useThree } from '@react-three/fiber'
import { NearestFilter, FloatType, RGBAFormat, UnsignedByteType, DataTexture, Vector3 } from "three"
import { useTempus } from 'tempus/react'

//** Components */
import { ParticlesPoints } from "./components/ParticlesPoints"
import { ParticleLines } from "./components/ParticleLines"
import { ParticleImages } from "./components/ParticleImages"

//** Data */
import { ParticleData } from "./data/ParticleData"

//** Simulation Materials */
import "./simulation/SimulationPositions"
import "./simulation/SimulationAlpha"
import "./simulation/SimulationCount"

import { useWindowSize } from 'hamo'

//** Constants */
export const PARTICLES_RENDER_PRIORITY = {
  tPosition: 1,
  tAlpha: 2,
  counting: 3,
  label: 4,
};

export const Particles = () => {
  /** Variables | Refs */
  //#region __variables
    const viewport = useThree(_ => _.viewport);
    const pointer = useThree(_ => _.pointer);
    const gl = useThree(_ => _.gl);
    const camera = useThree(_ => _.camera);

    const $simPosition = useRef();
    const $simAlpha = useRef();

    const $points = useRef();
    const $lines = useRef();
    const $images = useRef();
    const $labels = useRef();

    const texSize = ParticleData.textureSize;
    const total = texSize * texSize;
    const selectionData = new Uint8Array(total * 4); // r,g,b,a per texel, 0 or 255
    // default all zeros (no selection)
    const selectionTextureRef = useRef(
      new DataTexture(selectionData, texSize, texSize, RGBAFormat, UnsignedByteType)
    );
    selectionTextureRef.current.needsUpdate = true;
    selectionTextureRef.current.magFilter = NearestFilter;
    selectionTextureRef.current.minFilter = NearestFilter;
  //#endregion

  //** Frame Buffer Objects */
  //#region __fbos
    let tPositionTarget0 = useFBO(ParticleData.textureSize, ParticleData.textureSize,{
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      type: FloatType,
    });

    let tPositionTarget1 = useFBO(ParticleData.textureSize, ParticleData.textureSize,{
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        type: FloatType,
    });

    let tAlphaTarget0 = useFBO(ParticleData.textureSize, ParticleData.textureSize,{
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      type: FloatType,
    });

    let tAlphaTarget1 = useFBO(ParticleData.textureSize, ParticleData.textureSize,{
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      type: FloatType,
    });
  //#endregion

  /** State */
  //#region __state
    const windowDimensions = useWindowSize();
    const isMobile = windowDimensions.width <= 768;
  //#endregion

  /** Hooks */
  //#region __hooks
    useEffect(() => {
      if ($simPosition.current) {
        $simPosition.current.uniforms.uSelectionMask = { value: selectionTextureRef.current };
      }
    }, []);
  //#endregion

  /** Handlers */
  //#region __handlers
    const swapRenderTarget = (target, scene, needsClear = false) => {
      gl.setRenderTarget(target);

      if (needsClear) {
        gl.clearColor();
        gl.clear(true, true, true);
      }

      gl.render(scene, ParticleData.camera);
      gl.setRenderTarget(null);
    }

    const renderParticles = useCallback(() => {
      swapRenderTarget(tPositionTarget0, ParticleData.sceneTexPosition);

      //** STEP 1 - Simulation: consume FBO texture */
      $points.current.material.uniforms.tPosition.value = tPositionTarget1.texture;
      if ($lines.current && $lines.current.material) $lines.current.material.uniforms.tPosition.value = tPositionTarget1.texture;
      if ($images.current && $images.current.material) $images.current.material.uniforms.tPosition.value = tPositionTarget1.texture;

      //** STEP 2 - Update shader uniforms */
      if ($lines.current && $lines.current.material) $lines.current.material.uniforms.uTextureSize.value = ParticleData.textureSize;

      $lines.current.material.uniforms.uMouse.value.x = (pointer.x * viewport.width / 2) - 0.02;
      $lines.current.material.uniforms.uMouse.value.y = (pointer.y * viewport.height / 2) + 0.02;

      //** STEP 3 - Simulation: compute AABB intersections */
      $simPosition.current.uniforms.uProjectionMatrix.value = camera.projectionMatrix;
      $simPosition.current.uniforms.uViewMatrix.value = camera.matrixWorldInverse;

      $simPosition.current.uniforms.uBoxMinNDC.value.x = isMobile ? (ParticleData.AABBSize * -0.5) : pointer.x - (ParticleData.AABBSize * 0.5);
      $simPosition.current.uniforms.uBoxMinNDC.value.y = isMobile ? (ParticleData.AABBSize * -0.5) : pointer.y - (ParticleData.AABBSize * 0.5);

      $simPosition.current.uniforms.uBoxMaxNDC.value.x = isMobile ? (ParticleData.AABBSize * 0.5) : pointer.x + (ParticleData.AABBSize * 0.5);
      $simPosition.current.uniforms.uBoxMaxNDC.value.y = isMobile ? (ParticleData.AABBSize * 0.5) : pointer.y + (ParticleData.AABBSize * 0.5);

      //** STEP 4 - Simulation: replace FBO texture */
      $simPosition.current.uniforms.tPosition.value = tPositionTarget0.texture;

      //** STEP 5 - Simulation: swap render targets order */
      let temp = tPositionTarget0;
      tPositionTarget0 = tPositionTarget1;
      tPositionTarget1 = temp;
    }, []);

    const renderAlpha = useCallback(() => {
      swapRenderTarget(tAlphaTarget0, ParticleData.sceneTexAlpha);

      //** STEP 1 - Simulation: consume FBO texture */
      if ($images.current && $images.current.material) $images.current.material.uniforms.tAlpha.value = tAlphaTarget1.texture;

      //** STEP 2 - Update shader uniforms */

      //** STEP 3 - Simulation: replace FBO texture */
      $simAlpha.current.uniforms.tPosition.value = tPositionTarget1.texture;
      $simAlpha.current.uniforms.tAlpha.value = tAlphaTarget0.texture;

      //** STEP 4 - Simulation: swap render targets order */
      let temp = tAlphaTarget0;
      tAlphaTarget0 = tAlphaTarget1;
      tAlphaTarget1 = temp;
    }, []);

    const renderParticlesCouting = useCallback(() => {
      // --- Read whole position texture and compute selection by AABB --- //
      const texSize = ParticleData.textureSize;
      const total = texSize * texSize;

      // read raw positions (float RGBA per texel)
      const readBuffer = new Float32Array(total * 4);
      gl.readRenderTargetPixels(tPositionTarget1, 0, 0, texSize, texSize, readBuffer);

      // Build AABB in NDC (same logic as your sim shader)
      const half = (ParticleData.AABBSize * 0.5);
      const boxMinX = isMobile ? -half : pointer.x - half;
      const boxMinY = isMobile ? -half : pointer.y - half;
      const boxMaxX = isMobile ? half : pointer.x + half;
      const boxMaxY = isMobile ? half : pointer.y + half;

      const insideCandidates = []; // { idx, d2 } inside box
      const outsideCandidates = []; // { idx, d2 } outside box
      const v3 = new Vector3();

      for (let i = 0; i < total; i++) {
        const r = readBuffer[i * 4 + 0];
        const g = readBuffer[i * 4 + 1];
        const b = readBuffer[i * 4 + 2];
        v3.set(r, g, b);

        // keep same z test as shader
        if (v3.z <= -15.0) continue;

        // project to NDC
        const p = v3.clone();
        p.project(camera); // p.x, p.y in NDC [-1,1]

        let dx, dy;

        if (isMobile) {
          dx = p.x - 0;
          dy = p.y - 0;
        } else {
          dx = p.x - pointer.x;
          dy = p.y - pointer.y;
        }

        const d2 = dx * dx + dy * dy;

        // test AABB membership in NDC (same as shader's pointInAABB2D)
        const isInside =
          p.x >= boxMinX && p.x <= boxMaxX &&
          p.y >= boxMinY && p.y <= boxMaxY;

        if (isInside) {
          insideCandidates.push({ idx: i, d2 });
        } else {
          outsideCandidates.push({ idx: i, d2 });
        }
      }

      // If no candidates at all, clear mask and exit
      if (insideCandidates.length === 0 && outsideCandidates.length === 0) {
        selectionData.fill(0);
        selectionTextureRef.current.needsUpdate = true;
        return;
      }

      // sort both lists by distance ascending so nearest are first
      insideCandidates.sort((a, b) => a.d2 - b.d2);
      outsideCandidates.sort((a, b) => a.d2 - b.d2);

      const k = Math.min(5, insideCandidates.length + outsideCandidates.length);
      const selected = new Set();

      ParticleData.intersectionCount = (insideCandidates.length % 4) + 1;

      // take up to k from inside candidates first (nearest inside)
      for (let i = 0; i < insideCandidates.length && selected.size < k; i++) {
        selected.add(insideCandidates[i].idx);
      }

      // if not enough, fill from nearest outside
      if (selected.size < k) {
        for (let i = 0; i < outsideCandidates.length && selected.size < k; i++) {
          selected.add(outsideCandidates[i].idx);
        }
      }

      // write mask: set selected texels to 255, others to 0 (RGBA)
      selectionData.fill(0);
      selected.forEach((idx) => {
        const base = idx * 4;
        selectionData[base + 0] = 255;
        selectionData[base + 1] = 255;
        selectionData[base + 2] = 255;
        selectionData[base + 3] = 255;
      });

      selectionTextureRef.current.needsUpdate = true;
    }, [pointer, camera]);
  //#endregion

  //** Render Loop */
  //#region __render-loop
    useTempus(renderParticles, { priority: PARTICLES_RENDER_PRIORITY.tPosition });
    useTempus(renderAlpha, { priority: PARTICLES_RENDER_PRIORITY.tAlpha });
    useTempus(renderParticlesCouting, { priority: PARTICLES_RENDER_PRIORITY.counting, fps: 15 });
  //#endregion

  return (
    <>
      {/* SIMULATION - POSITIONS / INTERSECTIONS */}
      {
        createPortal(
          <mesh>
              <planeGeometry args={[2, 2]} />
              <simulationPositions ref={$simPosition} tPosition={ParticleData.position.dataTexture} tVelocity={ParticleData.velocity.dataTexture} />
          </mesh>,
          ParticleData.sceneTexPosition
        )
      }

      {/* SIMULATION - ALPHA */}
      {
        createPortal(
          <mesh>
              <planeGeometry args={[2, 2]} />
              <simulationAlpha ref={$simAlpha} tAlpha={ParticleData.alpha.dataTexture} />
          </mesh>,
          ParticleData.sceneTexAlpha
        )
      }

      {/** Points */}
      <ParticlesPoints ref={$points} />

      {/** Lines */}
      <ParticleLines ref={$lines} />

      {/** Images */}
      {/* {
        (!isMobile) && (
          <ParticleImages ref={$images} visible={!isLinearView} />
        )
      } */}
    </>
  )
}
