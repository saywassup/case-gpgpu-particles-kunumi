import React from "react";
import { useGLTF } from '@react-three/drei';

// import modelUrl from '../assets/duck.glb?url';

// WIP -> Colocar uma URL para desenvolvimento e outra para build
const modelUrl = new URL('./models/duck.glb', import.meta.url).href;

export const Lizard = () => {
    const { meshes } = useGLTF(modelUrl);

    return (
        <mesh geometry={meshes.LOD3spShape.geometry} material={meshes.LOD3spShape.material} />
    )
}