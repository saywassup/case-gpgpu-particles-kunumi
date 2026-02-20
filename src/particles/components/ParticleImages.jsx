//** Libs */
import React, { useRef, useImperativeHandle, useMemo } from 'react';
import { useThree } from '@react-three/fiber';

//** Materials */
import '../materials/ParticleImage.material'

//** Data */
import { ParticleData } from '../data/ParticleData';
import { useImageAtlas } from '../hooks/use-atlas';
import { getUVRectTexture } from '../data/ParticleDataTexture';

const urls = [
  "tex_1.jpg",
  "tex_2.jpg",
  "tex_3.jpg",
  "tex_4.jpg",
  "tex_5.jpg",
  "tex_6.jpg",
  "tex_7.jpg",
  "tex_8.jpg",
  "tex_9.jpg",
  "tex_10.jpg",
  "tex_11.jpg",
  "tex_12.jpg",
  "tex_13.jpg",
  "tex_14.jpg",
  "tex_15.jpg",
  "tex_16.jpg",
  "tex_17.jpg"
];

export const ParticleImages = ({ ref, visible = true }) => {
    /** Variables | Refs */
    //#region __variables
      const $mesh = useRef();
      const $material = useRef();

      const viewport = useThree(_ => _.viewport);

      const { atlas, texture: atlasTex, uvs } = useImageAtlas(urls, 128);

      // Example mapping: round-robin (or build your own `imageIndices` array of length SIZE*SIZE)
      const imageIndices = useMemo(() => {
        if (!uvs?.length) return null;
        
        const arr = ParticleData.pointImageIndexes;
        for (let i = 0; i < arr.length; i++) arr[i] = i % uvs.length;
        return arr;
      }, [uvs]);

      const tUVRect = useMemo(() => {
        if (!uvs?.length) return null;
        return getUVRectTexture(uvs, ParticleData.textureSize, imageIndices);
      }, [uvs, imageIndices]);

      // Optional UV gutter in UV units
      const uUVPad = useMemo(() => {
        if (!atlas) return 0.0;
        // ~1.5px gutter in UV units
        return 0.5 / atlas.width;
      }, [atlas]);
    //#endregion

    /** State */
    //#region __state
    //#endregion

    /** Hooks */
    //#region __hooks
    //#endregion

    /** Handlers */
    //#region __handlers
    //#endregion

    //** Render Loop */
    //#region __render-loop
    //#endregion

    useImperativeHandle(ref, () => ({
      mesh: $mesh.current,
      material: $material.current,
    }));

    return(
      <>
        { tUVRect && (
          <points ref={$mesh} visible={visible}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count ={ParticleData.points.length / 3}
                    array={ParticleData.points}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-ref"
                    count ={ParticleData.pointsRefs.length / 3}
                    array={ParticleData.pointsRefs}
                    itemSize={2}
                />
            </bufferGeometry>
    
            <particleImageMaterial
              transparent 
              ref={$material} 
              depthTest={false}
              depthWrite={false}
              uSize={100}
              uDPR={viewport.dpr} 
              tAtlas={atlasTex}
              tUVRect={tUVRect}
              uUVPad={uUVPad}
            />
          </points>
        )}
      </>
    )
}
