//** Libs */
import React, { useRef, useImperativeHandle } from 'react';

//** Materials */
import '../materials/ParticleLines.material'

//** Data */
import { ParticleData } from '../data/ParticleData';

export const ParticleLines = ({ ref, visible = true }) => {
    /** Variables | Refs */
    //#region __variables
      const $mesh = useRef();
      const $material = useRef();
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
      <lineSegments ref={$mesh} visible={visible}>
        <bufferGeometry>
            <bufferAttribute
                attach="attributes-position"
                count={ParticleData.pointLines.length / 3}
                array={ParticleData.pointLines}
                itemSize={3}
            />
        </bufferGeometry>
        <particleLinesMaterial ref={$material} />
      </lineSegments>
    )
}
