import React from 'react'
import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei' 
import { Teste } from './Lizard'

export const Playground = () => {
  return (
    <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

        <Teste />
        
        <OrbitControls />
    </Canvas>
  )
}
