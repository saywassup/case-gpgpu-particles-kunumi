//** Libs */
import React from 'react';
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

const ParticleImageMaterial = shaderMaterial(
    {
        tPosition: null,
        tAlpha: null,
        tAtlas: null,
        tUVRect: null, 
        uDPR: 1,
        uSize: 100,
        uUVPad: 0.0
    },
    /*glsl*/`
      attribute vec2 ref;

      uniform sampler2D tPosition;
      uniform sampler2D tAlpha;
      uniform sampler2D tUVRect;

      uniform float uSize;
      uniform float uDPR;

      varying vec2 vRef;
      varying float vOpacity;
      varying vec4 vRect; // (u0, v0, du, dv) for this particle

      void main() {
        vRef = ref;

        // position + per-particle alpha
        vec4 posData = texture2D(tPosition, ref);
        vec4 alphaData = texture2D(tAlpha, ref);
        vOpacity = alphaData.a;

        // fetch UV rect for this particle once (vertex stage)
        vRect = texture2D(tUVRect, ref);

        vec3 pos = posData.rgb;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        gl_PointSize = uSize * uDPR;
      }
    `,
    /*glsl*/`
      uniform sampler2D tAlpha;
      uniform sampler2D tAtlas;

      uniform float uUVPad;

      varying vec2 vRef;
      varying float vOpacity;
      varying vec4 vRect;

      void main() {
        // kill invisible particles
        float alphaMask = texture2D(tAlpha, vRef).a;
        if (alphaMask <= 0.0) discard;

        // local quad UV (flip Y to match Canvas2D draw)
        vec2 local = vec2(gl_PointCoord.x, 1. - gl_PointCoord.y);

        // apply padding to avoid bleeding across atlas cells (optional)
        vec2 pad = vec2(uUVPad);
        vec2 uv = vRect.xy + pad + local * (vRect.zw - 2.0 * pad);

        vec4 texel = texture2D(tAtlas, uv);

        // If your atlas draws transparent gutters, this extra discard helps crisp edges:
        if (texel.a <= 0.01) discard;

        gl_FragColor = vec4(texel.rgb, alphaMask * texel.a);
      }
    `
)

extend({ ParticleImageMaterial })