//** Libs */
import React, { Suspense } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useTempus } from 'tempus/react'
import { App } from './App'

export function Case() {
  return (
    <Canvas
        gl={{
          precision: 'highp',
          powerPreference: 'high-performance',
          antialias: true,
          alpha: true,
        }}
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.001, far: 1000 }}
        frameloop="never"
        linear
        flat
        eventSource={document.documentElement}
        eventPrefix="client"
        resize={{ scroll: false, debounce: { scroll: 0, resize: 500 } }}
      >
      <Suspense>
        <App />
      </Suspense>

      <RAF />
    </Canvas>
  )
}

function RAF({ render = true }) {
  const advance = useThree((state) => state.advance)

  useTempus(
    (time) => {
      if (render) {
        advance(time / 1000)
      }
    },
    {
      priority: 1,
    }
  )

  return null
}

