//** Libs */
import React, { useRef, useImperativeHandle } from 'react';
import { useThree } from '@react-three/fiber';

//** Materials */
import '../materials/ParticlePoints.material'

//** Data */
import { ParticleData } from '../data/ParticleData';

export const ParticlesPoints = ({ ref }) => {
    /** Variables | Refs */
    //#region __variables
      const $mesh = useRef();
      const $material = useRef();

      const viewport = useThree(_ => _.viewport);
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

    //** Animations */
    //#region __animations
    //#endregion

    useImperativeHandle(ref, () => ({
      mesh: $mesh.current,
      material: $material.current,
    }));

    return(
      <points ref={$mesh}>
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
        <particlePointsMaterial ref={$material} uSize={50} uDPR={viewport.dpr} />
      </points>
    )
}
