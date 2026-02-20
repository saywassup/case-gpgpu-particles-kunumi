//** Libs */
import React from 'react';
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Vector2, Matrix4 } from "three";

const SimulationCount = shaderMaterial(
  {
    tPosition: null,
    uSize: 256,
    uChannel: 3
  },
  /*glsl*/`
    varying vec2 vUv;
    
    void main() {
        vUv = uv;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /*glsl*/`
    precision highp float;
    precision highp sampler2D;

    uniform sampler2D tPosition;
    uniform int uSize;
    uniform int uChannel; // 0=R,1=G,2=B,3=A

    // fetch scalar from a chosen channel via texelFetch (integer coords)
    float sampleChan(ivec2 p) {
      vec4 c = texelFetch(tPosition, p, 0);
      if (uChannel == 0) return c.r;
      if (uChannel == 1) return c.g;
      if (uChannel == 2) return c.b;
      return c.a;
    }

    void main() {
      // One fragment only (we render a fullscreen quad into a 1x1 target).
      // Sum: count texels with "inside == 1.0".
      float sumv = 0.0;
      for (int y = 0; y < 8192; ++y) {      // large static upper bound
        if (y >= uSize) break;
        for (int x = 0; x < 8192; ++x) {    // large static upper bound
          if (x >= uSize) break;
          float a = sampleChan(ivec2(x, y));
          // assume 0.0 or 1.0 in the source; if it's soft, threshold it:
          sumv += a >= 0.5 ? 1.0 : 0.0;
        }
      }

      gl_FragColor = vec4(sumv, 0.0, 0.0, 1.0);
    }
  `
);

extend({ SimulationCount });
