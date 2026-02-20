//** Libs */
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Vector2, Matrix4 } from "three";

const SimulationPositions = shaderMaterial(
  {
    tPosition: null,
    tVelocity: null,
    uBoxMinNDC: new Vector2(-0.5, -0.5),
    uBoxMaxNDC: new Vector2(0.5, 0.5),
    uProjectionMatrix: new Matrix4(),
    uViewMatrix: new Matrix4(),
    uSelectionMask: null,
    uIsLinearView: false
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
    uniform sampler2D tVelocity;
    uniform sampler2D uSelectionMask;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;

    uniform vec2 uBoxMinNDC;
    uniform vec2 uBoxMaxNDC;

    varying vec2 vUv;

    uniform bool uIsLinearView;

    bool pointInAABB2D(vec2 p, vec2 minB, vec2 maxB) {
        return (p.x >= minB.x && p.x <= maxB.x &&
                p.y >= minB.y && p.y <= maxB.y);
    }

    void main() {
        vec3 position = texture2D(tPosition, vUv).rgb;
        vec3 velocity = texture2D(tVelocity, vUv).rgb;
      
        position.xy += velocity.xy * 0.01;
        position.z = mod(position.z + 0.005, 30.) - 30.;

        // World → Clip → NDC
        vec4 clip = uProjectionMatrix * uViewMatrix * vec4(position, 1.0);
        vec2 ndc = clip.xy / clip.w;

        bool inside = false;

        if (position.z > -15.) {
          // Intersection check in NDC space
          inside = pointInAABB2D(ndc, uBoxMinNDC, uBoxMaxNDC);

          // apply selection mask (only selected particles can be inside)
          float sel = texture2D(uSelectionMask, vUv).r;
          if (sel < 0.5) inside = false;
        }
        
        gl_FragColor.rgba = vec4(position, inside ? 1.0 : 0.0);
    }
  `
);

extend({ SimulationPositions });
