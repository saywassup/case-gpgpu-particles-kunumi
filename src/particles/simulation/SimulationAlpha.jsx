//** Libs */
import React from 'react';
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

const SimulationAlpha = shaderMaterial(
  {
    tPosition: null,
    tAlpha: null,
  },
  /*glsl*/`
    varying vec2 vUv;
    
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /*glsl*/`
    uniform sampler2D tPosition;
    uniform sampler2D tAlpha;

    varying vec2 vUv;

    void main() {
        float isInside = texture2D(tPosition, vUv).a;
        vec4 dataV = texture2D(tAlpha, vUv);

        float alpha = dataV.a;

        if (isInside > 0.) {
          alpha = clamp(alpha + 0.05, 0., 0.8);
        } else {
          alpha = max(alpha - 0.005, 0.);
        }
        
        gl_FragColor.rgba = vec4(vec3(0., 0., 0.), alpha);
    }
  `
);

extend({ SimulationAlpha });
