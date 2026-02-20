//** Libs */
import React from 'react';
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

const ParticlePointsMaterial = shaderMaterial(
    {
        tPosition: null,
        uSize: 1,
        uDPR: 1,
        linearViewLerp: 0.,
        vOpacity: 1.,
    },
    /*glsl*/`
      attribute vec2 ref;

      flat varying int vID;
      varying vec2 vRef;

      uniform sampler2D tPosition;

      uniform float uSize;
      uniform float uDPR;

      uniform float linearViewLerp;

      void main() {
          vRef = ref;
          vID = gl_VertexID;
          
          vec3 pos = texture2D(tPosition, ref).rgb;

          float index = mod(float(gl_VertexID), 7.0);
          float centerOffset = 1.5;

          vec3 linearPos = vec3(index * 0.5 - centerOffset, 0., 0.);

          vec3 finalPos = mix(pos, linearPos, linearViewLerp);

          vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);

          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = (uSize * uDPR) / -mvPosition.z;
      }
    `,
    /*glsl*/`
      uniform sampler2D tPosition;

      uniform float vOpacity;

      flat varying int vID;

      varying vec2 vRef;

      float sdCircle( vec2 p, float r ) {
          return length(p) - r;
      }

      void main() {
          vec4 data = texture2D(tPosition, vRef);

          vec3 pos = data.rbg;
          
          float isInside = data.a;

          float opacity = smoothstep(-35., -10., data.b);

          float dist = sdCircle(gl_PointCoord - 0.5, 0.5);

          if (dist > 0.) {
              discard;
          }

          gl_FragColor = vec4(vec3(0.), vOpacity);
      }
    `
)

extend({ ParticlePointsMaterial })
