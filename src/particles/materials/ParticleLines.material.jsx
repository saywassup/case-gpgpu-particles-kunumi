//** Libs */
import React from 'react';
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Vector3 } from "three";

const ParticleLinesMaterial = shaderMaterial(
    {
        tPosition: null,
        uMouse: new Vector3(0, 0, 0),
        uTextureSize: null,
        vOpacity: 1,
    },
    /*glsl*/`
      uniform sampler2D tPosition;

      uniform vec3 uMouse;
      uniform float uTextureSize;

      varying vec3 vColor;

      void main() {
          int particleIndex = gl_VertexID / 2;

          // Convert particle index to UV
          float sizeF = uTextureSize;
          float x = mod(float(particleIndex), sizeF);
          float y = floor(float(particleIndex) / sizeF);
          vec2 uv = (vec2(x, y) + 0.5) / sizeF;

          vec4 data = texture2D(tPosition, uv);

          vec3 pos = data.rgb;

          float isInside = data.a;

          if (isInside == 0.) {
              // Push out of clip space to skip
              gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
              return;
          }

          if (mod(float(gl_VertexID), 2.0) == 0.0) {
              // First vertex at hub
              gl_Position = projectionMatrix * viewMatrix * vec4(uMouse, 1.0);
              vColor = vec3(0.5);
          } else {
              // Second vertex at particle position
              gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
              vColor = vec3(0.5);
          }
      }
    `,
    /*glsl*/`
      varying vec3 vColor;

      uniform float vOpacity;

      void main() {
          gl_FragColor = vec4(vColor, vOpacity);
      }
    `
)

extend({ ParticleLinesMaterial })
